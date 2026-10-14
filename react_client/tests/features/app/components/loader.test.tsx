import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { performance } from "../../../../mock_data/app"
import { server } from "@/core"
import { PerformanceLoader } from "@/features/app/components/loader"

describe("PerformanceLoader intimacy: medium", () => {
    it("functionality passes the form period and performance data",
        async () => {
            const retrievePerformance = vi.spyOn(
                server.app,
                "retrievePerformance",
            ).mockResolvedValue({ performance })
            const renderPerformance = vi.fn(({ data }) => (
                <p>{data.orders} orders</p>
            ))

            renderWithRouter(
                <PerformanceLoader render={renderPerformance} />,
            )

            expect(await screen.findByText(
                `${performance.orders} orders`,
            )).toBeInTheDocument()
            expect(retrievePerformance).toHaveBeenCalledWith({ period: null })
            expect(renderPerformance).toHaveBeenCalledWith(
                expect.objectContaining({ data: performance }),
            )
        },
    )

    it("shows loading while performance data is unavailable", () => {
        vi.spyOn(server.app, "retrievePerformance").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<PerformanceLoader render={vi.fn()} />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})
