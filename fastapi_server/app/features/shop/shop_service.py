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
    SaleSummary,
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

def get_sale_by_slug(session, slug) -> SaleDetail:
    db_sale = session.query(Sale).filter(Sale.slug == slug).first()
    return db_sale

def active_sale_subquery(session) -> Query:
    now = datetime.now()
    return (
        session.query(
            sale_product.c.product_id,
            Sale.id.label("sale_id"),
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
            Sale,
        )
        .join(Product.category)
        .join(Product.rarity)
        .outerjoin(Product.stock)
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
        .outerjoin(
            Sale,
            Sale.id == sale_query.c.sale_id,
        )
    )
    return query

def get_discounted_price(product: Product, sale: Sale | None):
    price = product.price_aud_cent
    if not sale:
        return price
    
    discount=sale.discount_percent
    return round((100 - discount)/100 * price )

def get_product_by_slug(session, slug) -> ProductDetail:
    query = product_query(session)
    query = query.filter(Product.slug == slug).first()

    if not query:
        raise ContentNotFoundException(
            "Product Not Found", 
            details={"product_slug":slug}
        )
    db_product, db_sale  = query

    return ProductDetail(
        id=db_product.id,
        name=db_product.name,
        category_name=db_product.category.name,
        rarity_name=db_product.rarity.name,
        price_aud_cent=db_product.price_aud_cent,
        slug=db_product.slug,
        description=db_product.description,
        stock= db_product.stock.current if db_product.stock else 0,
        discounted_price=get_discounted_price( db_product, db_sale),
        sale=SaleSummary(
            name = db_sale.name,
            slug = db_sale.slug,
            discount_percent = db_sale.discount_percent
        ) if db_sale else None,
    )

def apply_product_filters(
    query, 
    categories=None, 
    rarities=None,
    is_discontinued=False,
    is_stock=True
) -> Query:
    if categories:
        query = query.filter(Category.name.in_(categories))
    if rarities:
        query = query.filter(Rarity.name.in_(rarities))
    if not is_discontinued:
        query = query.filter(Product.discontinued_at.is_(None))
    if is_stock:
        query = query.filter(Stock.current > 0)
    return query

def apply_product_search(
    query, 
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
    is_ascending=False
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
):
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
                stock= p.stock.current if p.stock else 0,
                discounted_price=get_discounted_price(p, s),
                sale=SaleSummary(
                    name = s.name,
                    slug = s.slug,
                    discount_percent = s.discount_percent
                ) if s else None,
            ) for p, s in db_products],
        has_more=has_more
    )