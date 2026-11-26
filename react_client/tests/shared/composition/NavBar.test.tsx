import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { NavBar } from "@/shared/composition/NavBar"

const items = [
    { label: "Shop", path: "/shop" },
    { label: "Profile", path: "/profile" },
]

function renderNavBar(
    initialPath = "/shop",
    onClick?: (item: (typeof items)[number]) => void,
) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <NavBar
            items={items}
            path={item => item.path}
            render={item => item.label}
            onClick={onClick}
            />
        </MemoryRouter>,
    )
}

describe("NavBar intimacy: low", () => {
    it("functionality renders links with the active state", () => {
        renderNavBar()

        const shopLink = screen.getByRole("link", { name: "Shop" })
        const profileLink = screen.getByRole("link", {
            name: "Profile",
        })

        expect(shopLink).toHaveClass("border-b-2", "font-semibold")
        expect(profileLink).toHaveClass("text-gray-500")
    })

    it("navigates and reports the selected item", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()

        renderNavBar("/shop", onClick)
        await user.click(screen.getByRole("link", {
            name: "Profile",
        }))

        expect(onClick).toHaveBeenCalledOnce()
        expect(onClick).toHaveBeenCalledWith(items[1])
        expect(screen.getByRole("link", {
            name: "Profile",
        })).toHaveClass("border-b-2", "font-semibold")
    })

    it("applies custom container and link classes", () => {
        render(
            <MemoryRouter>
                <NavBar
                items={items}
                path={item => item.path}
                render={item => item.label}
                className="custom-container"
                linkClassName="custom-link"
                />
            </MemoryRouter>,
        )

        expect(screen.getByRole("link", { name: "Shop" }))
            .toHaveClass("custom-link")
        expect(screen.getByRole("link", { name: "Profile" }))
            .toHaveClass("custom-link")
    })
})