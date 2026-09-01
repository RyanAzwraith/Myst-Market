import { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import {
	NumberEditField,
	SelectEditComponent,
	TextEditField,
} from '@/shared/SelectEditComponent';
import { PopUpModalComponent } from '@/shared/PopUpModalComponent';
import { QueryParamsContainer,
	BooleanFilterField,
	SelectMultipleFilterField,
	SelectOneFilterField,
	TextFilterField,
} from '@/shared/QueryParamsComponent';
import {
	numberField,
	textField,
	useSelectEdit,
} from '@/utils/useSelectEdit';
import { today } from '@/utils/DateStr';

import {
	useDeleteSaleMutation,
	usePostSaleMutation,
	usePatchSalesMutation,
	usePatchSaleMutation,
	useSaleAnalyticsQuery,
	useAdminSearchParams,
	useAdminSearchQuery,
} from '../service';
import type {
	AdminSearchParams,
	Sale,
	SaleAnalytics,
} from '../schema';
import { SaleMediaCarouselComponent } from './media';

function toDateTimeInput(value: Date | string) {
	const date = new Date(value);
	const timezoneOffset = date.getTimezoneOffset() * 60000;
	return new Date(date.getTime() - timezoneOffset)
		.toISOString()
		.slice(0, 16);
}

function fromDateTimeInput(value: string) {
	return value === '' ? null : new Date(value);
}

function SalesPage() {
	const { activation, getParams, isAscending, search, sortBy } =
		useAdminSearchParams();
	const { mutate: patchSales } = usePatchSalesMutation();
	const { data, fetchNextPage, hasNextPage } = useAdminSearchQuery(
		20,
		getParams() as AdminSearchParams,
	);
	const sales = data?.pages.flatMap(page => page.sales) ?? [];

	const editFields = {
		startAt: textField({ label: 'Start date' }),
		endAt: textField({ label: 'End date' }),
		discountPercent: numberField({
			label: 'Discount percent',
			step: 1,
		}),
	};
	const selectEdit = useSelectEdit({
		ids: new Set(sales.map(sale => String(sale.id))),
		FieldFactories: editFields,
		handleSubmit: (selectedIds, fieldValues) => {
			patchSales({
				ids: [...selectedIds].map(Number),
				startAt: fieldValues.startAt === null
					? null
					: new Date(fieldValues.startAt),
				endAt: fieldValues.endAt === null
					? null
					: new Date(fieldValues.endAt),
				discountPercent: fieldValues.discountPercent,
			});
		},
	});

	const itemComponents = Object.fromEntries(
		sales.map(sale => [
			String(sale.id),
			<SaleCard key={sale.id} sale={sale} />,
		]),
	);
	const title = search.get()
		? `Searching: ${search.get()}`
		: activation.get().join(', ') || 'All Sales';

	return (
		<div>
			<QueryParamsContainer>
				<TextFilterField accessor={search} />
				<SelectMultipleFilterField accessor={activation} />
				<SelectOneFilterField accessor={sortBy} />
				<BooleanFilterField accessor={isAscending} />
			</QueryParamsContainer>
			<h1 className="mb-2 text-lg font-semibold">{title}</h1>
			<PopUpModalComponent
				content={onClose => <CreateSaleModal onClose={onClose} />}
			>
				<span>Create sale</span>
			</PopUpModalComponent>
			<SelectEditComponent
				fieldComponents={
					<>
						<TextEditField field={selectEdit.startAt} />
						<TextEditField field={selectEdit.endAt} />
						<NumberEditField field={selectEdit.discountPercent} />
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
					value={toDateTimeInput(formData.startAt)}
					onChange={event => setFormData(current => ({
						...current,
						startAt: fromDateTimeInput(event.target.value)
							?? current.startAt,
					}))}
				/>
			</label>
			<label>
				End date
				<input
					aria-label="End date"
					type="datetime-local"
					value={toDateTimeInput(formData.endAt)}
					onChange={event => setFormData(current => ({
						...current,
						endAt: fromDateTimeInput(event.target.value)
							?? current.endAt,
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

function SaleCard({ sale }: { sale: SaleAnalytics }) {
	return (
		<PopUpModalComponent
			content={() => <SaleModal saleId={sale.id} />}
		>
			<div className="rounded border p-3 shadow-sm">
				<div className="font-semibold">{sale.name}</div>
				<div>{sale.discountPerc}% off</div>
				<div>{new Date(sale.startAt).toLocaleString()}</div>
				<div>{new Date(sale.endAt).toLocaleString()}</div>
				<div>Revenue: {sale.revenue}</div>
				<div>Orders: {sale.orderCount}</div>
			</div>
		</PopUpModalComponent>
	);
}

function SaleModal({ saleId }: { saleId: number }) {
	const { mutate: patchSale, isPending: isPatchPending } =
		usePatchSaleMutation(saleId);
	const { mutate: deleteSale, isPending: isDeletePending } =
		useDeleteSaleMutation(saleId);
	const { data: sale, isLoading, isError } = useSaleAnalyticsQuery(saleId);
	const [formData, setFormData] = useState<Partial<Sale>>({ })

	useEffect(() => {
		if (!sale) return;
		setFormData({
			name: sale.name,
			slug: sale.slug,
			description: sale.description,
			startAt: new Date(sale.startAt),
			endAt: new Date(sale.endAt),
			discountPerc: sale.discountPerc,
		});
	}, [sale]);

	if (isLoading) return <div>Loading...</div>;
	if (isError || !sale) return <div>Error loading sale details</div>;

	return (
		<div>
			<h2 className="mb-3 text-lg font-semibold">Sale Details</h2>
      		<SaleMediaCarouselComponent saleId={saleId} limit={5} />
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
					value={formData.startAt
						? toDateTimeInput(formData.startAt)
						: ''}
					onChange={event => setFormData(current => ({
						...current,
						startAt: fromDateTimeInput(event.target.value),
					}))}
				/>
			</label>
			<label>
				End date
				<input
					aria-label="End date"
					type="datetime-local"
					value={formData.endAt
						? toDateTimeInput(formData.endAt)
						: ''}
					onChange={event => setFormData(current => ({
						...current,
						endAt: fromDateTimeInput(event.target.value),
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
							? null
							: Number(event.target.value),
					}))}
				/>
			</label>
			<button
				type="button"
				onClick={() => patchSale({ saleId, data: formData })}
				disabled={isPatchPending}
			>
				Update sale
			</button>
			<button
				type="button"
				onClick={() => deleteSale(saleId)}
				disabled={isDeletePending}
			>
				Delete sale
			</button>
		</div>
	);
}

export { SalesPage };
