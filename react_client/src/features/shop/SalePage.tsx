import { useNavigate, useParams } from "react-router-dom";
import { AppRoutes } from '@/AppRoutes'

import { ImageComponent } from "@/shared/ImageComponent"

import { useSalesQuery } from "./shopService"
import { useEffect } from "react";


function SalePage() {
	const navigate = useNavigate()

    const { slug } = useParams()
  useEffect(() => {
        if (!slug) 
            navigate(AppRoutes.catalogue);
    }, [slug, navigate])
    
    const {data: sales} = useSalesQuery()

    if (sales && slug) {
        const sale = sales[slug]
        return (
            <div className="rounded border border-slate-200 bg-white p-4">
                <h1 className="text-lg font-semibold">
                    {sale.name}
                </h1>
                <ImageComponent 
                altText={sale.name} />
                <h2 className="text-lg font-semibold">
                    {sale.discountPercent}% off!
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