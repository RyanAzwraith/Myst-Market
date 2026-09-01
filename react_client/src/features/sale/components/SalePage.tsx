import { useNavigate, useParams } from "react-router-dom";
import { PageRoutes } from '@/PageRoutes'

import { useSaleQuery } from "../service"
import { useEffect } from "react";
import { SaleMediaCarouselComponent } from "./SaleMediaCarouselComponent";

function SalePage() {
	const navigate = useNavigate()

    const { slug } = useParams()
    useEffect(() => {
        if (!slug) 
            navigate(PageRoutes.catalogue);
    }, [slug, navigate])

    const {data: sale} = useSaleQuery(slug)
    if (sale ) {
        return (
            <div className="rounded border border-slate-200 bg-white p-4">
                <h1 className="text-lg font-semibold">
                    {sale.name}
                </h1>
                <SaleMediaCarouselComponent saleId={sale.id} limit={10} />
                <h2 className="text-lg font-semibold">
                    {sale.discountPerc}% off!
                </h2>
                <p className="text-sm text-slate-600">
                    {sale.startAt.toString()} to {sale.endAt.toString()}
                </p>
                <p className="text-sm text-slate-600">
                    {sale.description}
                </p>
            </div>
        )
    }
    else
        return <div></div>
}

export { SalePage }