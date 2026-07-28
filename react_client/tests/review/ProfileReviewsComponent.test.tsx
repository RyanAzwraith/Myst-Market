import { describe, vi, test, expect, beforeEach,} from "vitest"
import { screen, waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter,
    resetAuthState, 
} from "../utils";

import {
    ProfileReviewsComponent,
    ReviewCard
} from '@/features/review/ProfileReviewsComponent'

import type {
    GetUserReviewsResponse,
    ReviewDetail,
} from "@/features/review/ReviewSchemas"
import { type AuthState, type UserModel } from "@/features/user/authState";

const mockAuthRequest = vi.hoisted(() => vi.fn())
vi.mock('@/api', async () => ({
    authRequest: mockAuthRequest 
}))

let user: UserEvent

beforeEach(() => {
    user = userEvent.setup()
})

const name="someone"

const authState = {
    userModel: {
        id: 4, 
        email:"some@mail.com", 
        name:name
    } as UserModel,
    accessToken: "ImAnAccessToken" 
} as AuthState

const now = new Date()

const reviewDetail = {
    reviewId: 1,
    userName: name,
    productId: 1,
    createdAt: now,
    rating: 4,
    description: "Really great product",
} as ReviewDetail

const reviewDetailNullDescription = {
    reviewId: 2,
    userName: name,
    productId: 2,
    createdAt: now,
    rating: 2,
} as ReviewDetail   

const reviewDetails = [
    reviewDetail, 
    reviewDetailNullDescription, 
    reviewDetailNullDescription,
    reviewDetailNullDescription,
    reviewDetailNullDescription, 
] as ReviewDetail[]


beforeEach(() => {
    resetAuthState(authState)
    mockAuthRequest.mockResolvedValue({
        reviewDetails: reviewDetails as ReviewDetail[],
    } as GetUserReviewsResponse)
})          

describe("ProfileReviewsComponent", () => {
    test("children show",async () => {
        renderWithRouter(<ProfileReviewsComponent userId={1} />)
        expect(await screen.findByText('Reviews')).toBeVisible()
        expect(await screen.findAllByRole("article")).toBeTruthy()
    })
})

describe("ReviewCard", () => {
    test("children are shown", async () => {
        renderWithRouter(<ReviewCard reviewDetail={reviewDetail} />)
        expect(await screen.findByText(reviewDetail.userName))
        expect(await screen.findByText(reviewDetail.createdAt.toString()))
        expect(await screen.findByText(reviewDetail.description ?? ''))
        expect(await screen.findAllByLabelText('xmarkicon'))
    })

    test("Handles Null Description", async () => {
        renderWithRouter( 
            <ReviewCard reviewDetail={reviewDetailNullDescription} />
        )
        expect(await screen.findByText(reviewDetailNullDescription.userName))
        expect(screen.getByRole("article").querySelectorAll("p")[2])
            .toHaveTextContent("")
    })

    test("Delete works", async () => {
        renderWithRouter( <ReviewCard reviewDetail={reviewDetail} />)
        await user.click((await screen.findByLabelText('xmarkicon')))
        await user.click((await screen.findByRole('button', {name: "Yes"})))
        await waitFor(() => expect(mockAuthRequest).toHaveBeenCalledWith(
            "/reviews/1",
            {
                method: 'DELETE'
            }
        ))

    })
})