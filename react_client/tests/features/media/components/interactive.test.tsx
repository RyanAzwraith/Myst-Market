import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import {
    ImportButton,
    downloadCsv,
} from "@/features/media/components/interactive"

describe("ImportButton intimacy: low", () => {
    it("functionality renders the import action and CSV input", () => {
        renderWithRouter(
            <ImportButton
                label="Import media"
                isPending={false}
                onFileSelected={vi.fn()}
            />,
        )

        expect(screen.getByRole("button", { name: "Import media" }))
            .toBeEnabled()

        const input = document.querySelector<HTMLInputElement>(
            'input[type="file"]',
        )
        expect(input).not.toBeNull()
        expect(input).toHaveAttribute("accept", ".csv,text/csv")
    })

    it("passes the selected file to the callback", async () => {
        const user = userEvent.setup()
        const onFileSelected = vi.fn()
        const file = new File(["media"], "media.csv", {
            type: "text/csv",
        })

        renderWithRouter(
            <ImportButton
                label="Import media"
                isPending={false}
                onFileSelected={onFileSelected}
            />,
        )

        const input = document.querySelector<HTMLInputElement>(
            'input[type="file"]',
        )
        expect(input).not.toBeNull()
        await user.upload(input!, file)

        expect(onFileSelected).toHaveBeenCalledOnce()
        expect(onFileSelected).toHaveBeenCalledWith(file)
    })

    it("disables the action and shows pending text while importing", () => {
        renderWithRouter(
            <ImportButton
                label="Import media"
                isPending={true}
                onFileSelected={vi.fn()}
            />,
        )

        expect(screen.getByRole("button", { name: "Importing..." }))
            .toBeDisabled()
    })
})

describe("downloadCsv intimacy: low", () => {
    it("functionality downloads an exported CSV", async () => {
        const file = new Blob(["media,csv"], { type: "text/csv" })
        const exportFile = vi.fn().mockResolvedValue(file)
        const createObjectURL = vi.fn(() => "blob:media")
        const revokeObjectURL = vi.fn()
        const clickedLinks: HTMLAnchorElement[] = []

        vi.stubGlobal("URL", {
            createObjectURL,
            revokeObjectURL,
        })
        vi.spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(function (this: HTMLAnchorElement) {
                clickedLinks.push(this)
            })

        await downloadCsv(exportFile, "media.csv")

        expect(exportFile).toHaveBeenCalledOnce()
        expect(createObjectURL).toHaveBeenCalledWith(file)
        expect(clickedLinks).toHaveLength(1)
        expect(clickedLinks[0]).toHaveAttribute("href", "blob:media")
        expect(clickedLinks[0]).toHaveAttribute("download", "media.csv")
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:media")
    })

    it("propagates export errors without creating a download", async () => {
        const error = new Error("Export failed")
        const exportFile = vi.fn().mockRejectedValue(error)
        const createObjectURL = vi.fn()
        const revokeObjectURL = vi.fn()

        vi.stubGlobal("URL", {
            createObjectURL,
            revokeObjectURL,
        })

        await expect(downloadCsv(exportFile, "media.csv"))
            .rejects.toBe(error)

        expect(createObjectURL).not.toHaveBeenCalled()
        expect(revokeObjectURL).not.toHaveBeenCalled()
    })
})
