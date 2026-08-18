import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { AppRoutes } from '@/AppRoutes';
import { ImageComponent } from '@/shared/ImageComponent';
import {
  BooleanFilterField,
  SelectMultipleFilterField,
  SelectOneFilterField,
  TextFilterField,
  QueryParamsContainer,
} from '@/shared/QueryParamsComponent';
import { PopUpModalComponent } from '@/shared/PopUpModalComponent';
import {
  NumberEditField,
  SelectEditComponent,
  SelectOneEditField,
} from '@/shared/SelectEditComponent';
import {
  numberField,
  selectOneField,
  useSelectEdit,
} from '@/utils/useSelectEdit';
import { formatMoney } from '@/utils/formatMoney';

import {
  useDeleteProductMutation,
  usePostProductMutation,
  useProductAnalyticsQuery,
  useProductParams,
  useProductsInfiniteQuery,
  usePatchProductBulkMutation,
  usePatchProductMutation,
} from './AdminService';
import type {
  PatchProductRequest,
  PostProductRequest,
  PostProductSearchRequest,
  ProductAnalytics,
} from './AdminSchema';


function ProductsPage() {
  const {
    categories,
    getParams,
    isAscending,
    isDiscontinued,
    rarities,
    search,
    sortBy,
  } = useProductParams();
  const { mutate: patchProducts } = usePatchProductBulkMutation();
  const limit = 20;

  const { data, fetchNextPage, hasNextPage } =
    useProductsInfiniteQuery(
      limit,
      getParams() as Omit<PostProductSearchRequest, 'limit' | 'offset'>
    );
  const products = data?.pages.flatMap(page => page.products) ?? [];

  const editFields = {
    categoryName: selectOneField({
      label: 'Category',
      options: categories.options,
    }),
    rarityName: selectOneField({
      label: 'Rarity',
      options: rarities.options,
    }),
    priceAudCent: numberField({
      label: 'Price (cents)',
      step: 1,
    }),
    stock: numberField({
      label: 'Stock',
      step: 1,
    }),
  };

  const selectEdit = useSelectEdit({
    ids: new Set(products.map(product => String(product.id))),
    FieldFactories: editFields,
    handleSubmit: (selectedIds, fieldValues) => {
      patchProducts({
        productIds: [...selectedIds].map(Number),
        ...fieldValues,
      });
    },
  });

  const itemComponents = Object.fromEntries(
    products.map(product => [
      String(product.id),
      <ProductCard key={product.id} product={product} />,
    ])
  );

  const title = search.get()
    ? `Searching: ${search.get()}`
    : categories.get().concat(rarities.get()).join(', ')
      || 'All Products';

  return (
    <div>
      <QueryParamsContainer>
        <TextFilterField accessor={search} />
        <SelectMultipleFilterField accessor={categories} />
        <SelectMultipleFilterField accessor={rarities} />
        <SelectOneFilterField accessor={sortBy} />
        <BooleanFilterField accessor={isDiscontinued} />
        <BooleanFilterField accessor={isAscending} />
      </QueryParamsContainer>

      <h1 className="mb-2 text-lg font-semibold">{title}</h1>
      <PopUpModalComponent
        content={onClose => <CreateProductModal onClose={onClose} />}
      >
        <span>Create product</span>
      </PopUpModalComponent>
      <SelectEditComponent
        fieldComponents={
          <>
            <SelectOneEditField field={selectEdit.categoryName} />
            <SelectOneEditField field={selectEdit.rarityName} />
            <NumberEditField field={selectEdit.priceAudCent} />
            <NumberEditField field={selectEdit.stock} />
          </>
        }
        itemComponents={itemComponents}
        useSelectEdit={selectEdit}
      />
      {hasNextPage ? (
        <ChevronDownIcon
          aria-label="ChevronDownIcon"
          className="h-24 w-24"
          onClick={() => fetchNextPage()}
        />
      ) : null}
    </div>
  );
}

function CreateProductModal({ onClose }: { onClose: () => void }) {
  const { mutate: postProduct, isPending } = usePostProductMutation();
  const [formData, setFormData] = useState<PostProductRequest>({
    name: '',
    categoryName: '',
    rarityName: '',
    priceAudCent: 0,
    slug: '',
    description: '',
    stock: 0,
  });

  const updateTextField = (
    field: 'name' | 'categoryName' | 'rarityName' | 'slug' | 'description',
    value: string,
  ) => setFormData(current => ({ ...current, [field]: value }));

  const updateNumberField = (
    field: 'priceAudCent' | 'stock',
    value: string,
  ) => setFormData(current => ({
    ...current,
    [field]: value === '' ? 0 : Number(value),
  }));

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Create Product</h2>
      <label>
        Name
        <input
          aria-label="Name"
          value={formData.name}
          onChange={event => updateTextField('name', event.target.value)}
        />
      </label>
      <label>
        Category
        <input
          aria-label="Category"
          value={formData.categoryName}
          onChange={event =>
            updateTextField('categoryName', event.target.value)
          }
        />
      </label>
      <label>
        Rarity
        <input
          aria-label="Rarity"
          value={formData.rarityName}
          onChange={event => updateTextField('rarityName', event.target.value)}
        />
      </label>
      <label>
        Price (cents)
        <input
          aria-label="Price (cents)"
          type="number"
          value={formData.priceAudCent}
          onChange={event =>
            updateNumberField('priceAudCent', event.target.value)
          }
        />
      </label>
      <label>
        Slug
        <input
          aria-label="Slug"
          value={formData.slug}
          onChange={event => updateTextField('slug', event.target.value)}
        />
      </label>
      <label>
        Description
        <textarea
          aria-label="Description"
          value={formData.description}
          onChange={event =>
            updateTextField('description', event.target.value)
          }
        />
      </label>
      <label>
        Stock
        <input
          aria-label="Stock"
          type="number"
          value={formData.stock}
          onChange={event => updateNumberField('stock', event.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={() => postProduct(formData, { onSuccess: onClose })}
        disabled={isPending}
      >
        Create product
      </button>
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: ProductAnalytics
}) {
  return (
    <PopUpModalComponent
      content={() => <ProductModal productId={product.id} />}
    >
      <div className="rounded border p-3 shadow-sm">
        <ImageComponent altText={product.name} />
        <div className="font-semibold">{product.name}</div>
        <div>{product.categoryName} / {product.rarityName}</div>
        <div>{formatMoney(product.priceAudCent)}</div>
        <div>Stock: {product.stock}</div>
        <div>Reviews: {product.reviews}</div>
      </div>
    </PopUpModalComponent>
  );
}

function ProductModal({
  productId,
}: {
  productId: number
}) {
  const navigate = useNavigate();
  const { mutate: deleteProduct, isPending } = useDeleteProductMutation();
  const { mutate: patchProduct, isPending: isPatchPending } =
    usePatchProductMutation();
  const { data, isLoading, isError } = useProductAnalyticsQuery(productId);
  const [formData, setFormData] = useState<PatchProductRequest>({
    name: null,
    categoryName: null,
    rarityName: null,
    priceAudCent: null,
    slug: null,
    description: null,
    stock: null,
  });

  useEffect(() => {
    if (!data) return;

    const { product } = data;
    setFormData({
      name: product.name,
      categoryName: product.categoryName,
      rarityName: product.rarityName,
      priceAudCent: product.priceAudCent,
      slug: product.slug,
      description: product.description,
      stock: product.stock,
    });
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Error loading product details</div>;

  const { product } = data;
  const updateField = <K extends keyof PatchProductRequest>(
    field: K,
    value: PatchProductRequest[K],
  ) => setFormData(current => ({ ...current, [field]: value }));

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Product Details</h2>
      <ImageComponent altText={product.name} />
      <div className="space-y-1 text-sm">
        <div>Name: {product.name}</div>
        <div>Category: {product.categoryName}</div>
        <div>Rarity: {product.rarityName}</div>
        <div>Price: {formatMoney(product.priceAudCent)}</div>
        <div>Discounted Price: {
          product.discountedPrice === null
            ? 'None'
            : formatMoney(product.discountedPrice)
        }</div>
        <div>Stock: {product.stock}</div>
        <div>Slug: {product.slug}</div>
        <div>Description: {product.description}</div>
        <div>Units Sold: {product.unitsSold}</div>
        <div>Revenue: {formatMoney(product.revenue)}</div>
        <div>Orders: {product.orderCount}</div>
        <div>Refunds: {product.refunds}</div>
        <div>Revenue Lost: {formatMoney(product.revenueLost)}</div>
        <div>Average Rating: {product.averageRating}</div>
        <div>Reviews: {product.reviews}</div>
      </div>
      <div>
        <label>
          Name
          <input
            aria-label="Name"
            value={formData.name ?? ''}
            onChange={event => updateField('name', event.target.value)}
          />
        </label>
        <label>
          Category
          <input
            aria-label="Category"
            value={formData.categoryName ?? ''}
            onChange={event =>
              updateField('categoryName', event.target.value)
            }
          />
        </label>
        <label>
          Rarity
          <input
            aria-label="Rarity"
            value={formData.rarityName ?? ''}
            onChange={event => updateField('rarityName', event.target.value)}
          />
        </label>
        <label>
          Price (cents)
          <input
            aria-label="Price (cents)"
            type="number"
            value={formData.priceAudCent ?? ''}
            onChange={event => updateField(
              'priceAudCent',
              event.target.value === '' ? null : Number(event.target.value),
            )}
          />
        </label>
        <label>
          Slug
          <input
            aria-label="Slug"
            value={formData.slug ?? ''}
            onChange={event => updateField('slug', event.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            aria-label="Description"
            value={formData.description ?? ''}
            onChange={event => updateField('description', event.target.value)}
          />
        </label>
        <label>
          Stock
          <input
            aria-label="Stock"
            type="number"
            value={formData.stock ?? ''}
            onChange={event => updateField(
              'stock',
              event.target.value === '' ? null : Number(event.target.value),
            )}
          />
        </label>
        <button
          type="button"
          onClick={() => patchProduct({ productId, data: formData })}
          disabled={isPatchPending}
        >
          Update product
        </button>
      </div>
      <button
        type="button"
        onClick={() =>
          deleteProduct(productId, {
            onSuccess: () =>
              navigate(AppRoutes.adminProducts),
          })
        }
        disabled={isPending}
      >
        Delete product
      </button>
    </div>
  );
}

export { ProductsPage };
