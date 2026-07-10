from datetime import datetime
from sqlalchemy import and_, func
from sqlalchemy.orm import Query, contains_eager
from app.db.models import (
    Product,
    Sale,
    Category,
    Rarity,
    Stock,
    sale_product
)
from app.core.exceptions import (
    ContentNotFoundException,
)

from .shop_schemas import (
    SortBy,
    SaleDetail,
    ProductDetail,
    ProductsSearch,
)

def get_category_names(session) -> list[str]:
    db_categories = session.query(Category.name).all()
    return [c[0] for c in db_categories]

def get_rarity_names(session) -> list[str]:
    db_rarities = session.query(Rarity.name).all()
    return [r[0]  for r in db_rarities]

def get_sales(session) -> list[SaleDetail]:
    db_sales = session.query(Sale).all()
    return db_sales


def active_sale_subquery(session) -> Query:
    now = datetime.now()
    return (
        session.query(
            sale_product.c.product_id,
            Sale.slug.label("sale_slug"),
            func.row_number()
            .over(
                partition_by=sale_product.c.product_id,
                order_by=Sale.discount_percent.desc()
            )
            .label("row_num")
        )
        .join(
            Sale,
            Sale.id == sale_product.c.sale_id
        )
        .filter(
            Sale.start_at <= now,
            Sale.end_at >= now,
        )
        .subquery()
    )

def product_query(session) -> Query:
    sale_query = active_sale_subquery(session)
    query = (
        session.query(
            Product,
            sale_query.c.sale_slug
        )
        .join(Product.category)
        .join(Product.rarity)
        .join(Product.stock)
        .options(
            contains_eager(Product.category),
            contains_eager(Product.rarity),
            contains_eager(Product.stock),
        )
        .outerjoin(
            sale_query,
            and_(
                sale_query.c.product_id == Product.id,
                sale_query.c.row_num == 1
            )
        )
    )
    return query

def get_product_by_slug(session, slug) -> ProductDetail:
    query = product_query(session)
    query = query.filter(Product.slug == slug).first()

    if not query:
        raise ContentNotFoundException(
            "Product Not Found", 
            details={"product_slug":slug}
        )
    db_product, sale_slug = query

    return ProductDetail(
        id=db_product.id,
        name=db_product.name,
        category_name=db_product.category.name,
        rarity_name=db_product.rarity.name,
        price_aud_cent=db_product.price_aud_cent,
        slug=db_product.slug,
        description=db_product.description,
        stock=db_product.stock.current,
        sale_slug=sale_slug,
    )

def apply_product_filters(
    query, 
    categories=None, 
    rarities=None,
    is_discontinued=False,
    is_stock=False
) -> Query:
    if categories:
        query = query.filter(Category.name.in_(categories))
    if rarities:
        query = query.filter(Rarity.name.in_(rarities))
    if not is_discontinued:
        query = query.filter(Product.discontinued_at is not None)
    if not is_stock:
        query = query.filter(Stock.current > 0)
    return query

def apply_product_search(query, 
    search=None
) -> Query:
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%")
        )
    return query
    
def apply_product_sorting(
    query, 
    sort_by=SortBy.popularity, 
    is_ascending=True
) -> Query:
    sort_column = Product.units_sold
    match sort_by:
        case SortBy.price:
            sort_column = Product.price_aud_cent
        case SortBy.alphabet:
            sort_column = Product.name
        case SortBy.newest:
            sort_column = Product.created_at
        case SortBy.rarity:
            sort_column = Rarity.order
        case SortBy.popularity | _:
            sort_column = Product.units_sold

    if is_ascending or is_ascending is None:
        return query.order_by(sort_column.asc())
    else:
        return query.order_by(sort_column.desc())
    
def apply_pagination(
    query, 
    limit=None, 
    offset=None
) -> tuple[list, bool]:
    result = None
    has_more = False

    if offset is not None:
        query = query.offset(offset)

    if limit is None:
        result = query.all()
        return (result, False)
    
    query = query.limit(limit + 1)
    result = query.all()

    has_more = len(result) > limit
    if has_more:
        result.pop()

    return (result, has_more)

def search_products(session, options) -> ProductsSearch:
    query = product_query(session)
    query = apply_product_filters(
        query, 
        options.categories, 
        options.rarities
    )
    query = apply_product_search(
        query, 
        options.search
    )
    query = apply_product_sorting(
        query, 
        options.sort_by, 
        options.is_ascending
    )
    db_products, has_more = apply_pagination(
        query, 
        options.limit, 
        options.offset
    )
    return ProductsSearch(
        products=[
            ProductDetail(
                id=p.id,
                name=p.name,
                category_name=p.category.name,
                rarity_name=p.rarity.name,
                price_aud_cent=p.price_aud_cent,
                slug=p.slug,
                description=p.description,
                stock=p.stock.current,
                sale_slug=sale_slug,
            ) for p, sale_slug in db_products],
        has_more=has_more
    )