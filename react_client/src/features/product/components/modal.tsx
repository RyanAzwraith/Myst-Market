import { useEffect } from "react";

import { Loading } from "@/shared/elements/text";
import { formatMoney } from "@/utils/formatMoney";
import {
  FormFieldsContainer,
  NumberFormField,
  TextAreaFormField,
  TextFormField,
} from "@/shared/FormFieldsComponent";
import {
  numberField,
  textField,
  useFormFields,
} from "@/utils/useFormFields";

import type { Product } from "../schema";
import { 
    useDeleteProductMutation,
    usePostProductMutation,
    usePatchProductMutation, 
    useProductAnalyticsQuery 
} from "../service";
import { ProductCarousel } from "./media";


export {
    ProductModal,
    CreateProductModal
}

function ProductModal({ productId, onClose}: {
  productId: number,
  onClose?: () => void
}) {
  const { mutate: deleteProduct, isPending } = useDeleteProductMutation();
  const { mutate: patchProduct, isPending: isPatchPending } =
    usePatchProductMutation(productId);
  const { data, } = useProductAnalyticsQuery(productId);
  
  const form = useFormFields({
    name: textField({ label: "Name" }),
    categoryName: textField({ label: "Category" }),
    rarityName: textField({ label: "Rarity" }),
    priceAudCent: numberField({
      label: "Price (cents)",
      step: 1,
    }),
    slug: textField({ label: "Slug" }),
    description: textField({ label: "Description" }),
    stock: numberField({
      label: "Stock",
      step: 1,
    }),
  });

  useEffect(() => {
    if (!data) return;

    const { product } = data;
    form.reset({
      name: product.name,
      categoryName: product.categoryName,
      rarityName: product.rarityName,
      priceAudCent: product.priceAudCent,
      slug: product.slug,
      description: product.description,
      stock: product.stock,
    });
  }, [data]);

  if (!data) return <Loading />;
  const { product } = data;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Product Details</h2>
      <ProductCarousel productId={productId} limit={5} />
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
        <FormFieldsContainer>
          <TextFormField field={form.name} />
          <TextFormField field={form.categoryName} />
          <TextFormField field={form.rarityName} />
          <NumberFormField field={form.priceAudCent} />
          <TextFormField field={form.slug} />
          <TextAreaFormField field={form.description} />
          <NumberFormField field={form.stock} />
        </FormFieldsContainer>
        <button
          type="button"
          onClick={() => patchProduct(form.values as Product)}
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
              onClose?.(),
          })
        }
        disabled={isPending}
      >
        Delete product
      </button>
    </div>
  );
}


function CreateProductModal({ onClose }: { onClose: () => void }) {
  const { mutate: postProduct, isPending } = usePostProductMutation();
  const form = useFormFields({
    name: textField({ label: "Name" }),
    categoryName: textField({ label: "Category" }),
    rarityName: textField({ label: "Rarity" }),
    priceAudCent: numberField({
      label: "Price (cents)",
      step: 1,
    }),
    slug: textField({ label: "Slug" }),
    description: textField({ label: "Description" }),
    stock: numberField({
      label: "Stock",
      step: 1,
    }),
  });

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Create Product</h2>
      <FormFieldsContainer>
        <TextFormField field={form.name} />
        <TextFormField field={form.categoryName} />
        <TextFormField field={form.rarityName} />
        <NumberFormField field={form.priceAudCent} />
        <TextFormField field={form.slug} />
        <TextAreaFormField field={form.description} />
        <NumberFormField field={form.stock} />
      </FormFieldsContainer>
      <button
        type="button"
        onClick={() => postProduct(form.values as Product, { 
            onSuccess: onClose 
        })}
        disabled={isPending}
      >
        Create product
      </button>
    </div>
  );
}
