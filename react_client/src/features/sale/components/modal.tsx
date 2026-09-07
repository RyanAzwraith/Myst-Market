import { useState, useEffect } from 'react';


import type { Sale } from '../schema';
import {
    usePatchSaleMutation,
    useDeleteSaleMutation,
    useSaleAnalyticsQuery,
    usePostSaleMutation,
} from '../service';
import { SaleCarousel } from './media';
import { today } from '@/utils/DateStr';


export {
    SaleModal,
    CreateSaleModal,
}


function SaleModal({ id }: { 
    id: number 
}) {
	const { mutate: patchSale, isPending: isPatchPending } =
		usePatchSaleMutation(id);
	const { mutate: deleteSale, isPending: isDeletePending } =
		useDeleteSaleMutation(id);
	const { data: sale, isLoading, isError } = useSaleAnalyticsQuery(id);
	const [formData, setFormData] = useState<Partial<Sale>>({ })

	useEffect(() => {
		if (!sale) return;
		setFormData({
			name: sale.name,
			slug: sale.slug,
			description: sale.description ?? undefined,
			startAt: sale.startAt ?? undefined,
			endAt: sale.endAt ?? undefined,
			discountPerc: sale.discountPerc,
		});
	}, [sale]);

	if (isLoading) return <div>Loading...</div>;
	if (isError || !sale) return <div>Error loading sale details</div>;

	return (
		<div>
			<h2 className="mb-3 text-lg font-semibold">Sale Details</h2>
      		<SaleCarousel saleId={id} limit={5} />
			<label>
				Name
				<input
					aria-label="Name"
					value={formData.name ?? ''}
					onChange={event => setFormData(current => ({
						...current,
						name: event.target.value,
					}))}
				/>
			</label>
			<label>
				Slug
				<input
					aria-label="Slug"
					value={formData.slug ?? ''}
					onChange={event => setFormData(current => ({
						...current,
						slug: event.target.value,
					}))}
				/>
			</label>
			<label>
				Description
				<textarea
					aria-label="Description"
					value={formData.description ?? ''}
					onChange={event => setFormData(current => ({
						...current,
						description: event.target.value,
					}))}
				/>
			</label>
			<label>
				Start date
				<input
					aria-label="Start date"
					type="datetime-local"
					value={formData.startAt}
					onChange={event => setFormData(current => ({
						...current,
						startAt: event.target.value,
					}))}
				/>
			</label>
			<label>
				End date
				<input
					aria-label="End date"
					type="datetime-local"
					value={formData.endAt}
					onChange={event => setFormData(current => ({
						...current,
						endAt: event.target.value,
					}))}
				/>
			</label>
			<label>
				Discount percent
				<input
					aria-label="Discount percent"
					type="number"
					value={formData.discountPerc ?? ''}
					onChange={event => setFormData(current => ({
						...current,
						discountPerc: event.target.value === ''
							? undefined
							: Number(event.target.value),
					}))}
				/>
			</label>
			<button
				type="button"
				onClick={() => patchSale(formData)}
				disabled={isPatchPending}
			>
				Update sale
			</button>
			<button
				type="button"
				onClick={() => deleteSale()}
				disabled={isDeletePending}
			>
				Delete sale
			</button>
		</div>
	);
}



function CreateSaleModal({ onClose }: { onClose: () => void }) {
	const { mutate: postSale, isPending } = usePostSaleMutation();
	const [formData, setFormData] = useState<Omit<Sale, 'id'>>({
		name: '',
		slug: '',
		description: '',
		discountPerc: 0,
		startAt: today(),
		endAt: today(),
	});

	return (
		<div>
			<h2 className="mb-3 text-lg font-semibold">Create Sale</h2>
			<label>
				Name
				<input
					aria-label="Name"
					value={formData.name}
					onChange={event => setFormData(current => ({
						...current,
						name: event.target.value,
					}))}
				/>
			</label>
			<label>
				Slug
				<input
					aria-label="Slug"
					value={formData.slug}
					onChange={event => setFormData(current => ({
						...current,
						slug: event.target.value,
					}))}
				/>
			</label>
			<label>
				Description
				<textarea
					aria-label="Description"
					value={formData.description}
					onChange={event => setFormData(current => ({
						...current,
						description: event.target.value,
					}))}
				/>
			</label>
			<label>
				Discount percent
				<input
					aria-label="Discount percent"
					type="number"
					value={formData.discountPerc}
					onChange={event => setFormData(current => ({
						...current,
						discountPerc: event.target.value === ''
							? 0
							: Number(event.target.value),
					}))}
				/>
			</label>
			<label>
				Start date
				<input
					aria-label="Start date"
					type="datetime-local"
					value={formData.startAt}
					onChange={event => setFormData(current => ({
						...current,
						startAt: event.target.value ?? current.startAt,
					}))}
				/>
			</label>
			<label>
				End date
				<input
					aria-label="End date"
					type="datetime-local"
					value={formData.endAt}
					onChange={event => setFormData(current => ({
						...current,
						endAt: event.target.value ?? current.endAt,
					}))}
				/>
			</label>
			<button
				type="button"
				onClick={() => postSale(formData, { onSuccess: onClose })}
				disabled={isPending}
			>
				Create sale
			</button>
		</div>
	);
}