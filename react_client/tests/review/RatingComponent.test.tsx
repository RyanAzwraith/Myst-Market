import { describe,  test, expect, } from "vitest"
import { screen,  } from "@testing-library/react"

import { 
    renderWithRouter,
} from "../utils";

import { RatingComponent } from "@/features/review/ratingComponent";

describe("RatingComponent", () => {
    test("Rating is correct", async () => {
        const rating = 4
        renderWithRouter(<RatingComponent rating={rating} />)
        expect(await screen.findByText(`${rating}/5`))
        expect(await screen.findAllByLabelText("solidstaricon"))
            .toHaveLength(rating)
        expect(await screen.findAllByLabelText("outlinestaricon"))
            .toHaveLength(5 - rating)
    })
})