import { describe, vi, test, expect, beforeEach,} from "vitest"
import { screen, waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter,
    resetAuthState, 
} from "../utils";

import {
    ProductReviewsComponent,
    ReviewCard,
    CreateReviewComponent,
    CreateReviewStarIcon,
} from '@/features/review/ProductReviewsComponent'

import type {
    GetProductReviewsResponse,
    PostReviewRequest,
    ReviewDetail,
    ReviewSummary,
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

const authState = {
    userModel: {
        id: 4, 
        email:"some@mail.com", 
        name:"someone"
    } as UserModel,
    accessToken: "ImAnAccessToken" 
} as AuthState

const now = new Date()

const reviewDetail = {
    reviewId: 1,
    userName: "mick",
    productId: 1,
    createdAt: now,
    rating: 4,
    description: "Really great product",
} as ReviewDetail

const reviewDetailNullDescription = {
    reviewId: 2,
    userName: "kim",
    productId: 1,
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

describe("ProductReviewsComponent", () => {

    test("children show",async () => {
        resetAuthState(authState)
        mockAuthRequest.mockResolvedValueOnce({
            reviewDetails: reviewDetails as ReviewDetail[],
            average: 4,
            userHasReview: false,
        } as GetProductReviewsResponse)
        renderWithRouter(<ProductReviewsComponent productId={1} />)

        expect(await screen.findByText('Reviews')).toBeVisible()
        expect(await screen.findAllByRole("article")).toBeTruthy()
        expect(await screen.findByPlaceholderText("description")).toBeVisible()
    })

    test("CreateReviewComponent not shown if logged out", async () => {
        resetAuthState()
        mockAuthRequest.mockResolvedValueOnce({
            reviewDetails: reviewDetails as ReviewDetail[],
            average: 4,
            userHasReview: false,
        } as GetProductReviewsResponse)
        renderWithRouter(<ProductReviewsComponent productId={1} />)

        expect(screen.queryByPlaceholderText("description")).not.toBeInTheDocument()
    })
        
    test("CreateReviewComponent not shown if not canReview", async () => {
        resetAuthState(authState)
        mockAuthRequest.mockResolvedValueOnce({
            reviewDetails: reviewDetails as ReviewDetail[],
            average: 0,
            userHasReview: true,
        } as GetProductReviewsResponse)
        
        renderWithRouter(<ProductReviewsComponent productId={1} />)

        await waitFor(() => 
            expect(screen.queryByPlaceholderText("description"))
                .not.toBeInTheDocument()
        )
    })
    
    test("Alt Message shows if canReview but not hasReviews", async () => {
        resetAuthState(authState)
        mockAuthRequest.mockResolvedValueOnce({
            reviewDetails: [],
            average: 0,
            userHasReview: false,
        } as GetProductReviewsResponse)
        renderWithRouter(<ProductReviewsComponent productId={1} />)

        expect(await screen.findByText(
            "Be the first to Review this Product:"
        )).toBeVisible()
    })
    
    test("Null if not canReview in and not has Reviews", async () => {
        resetAuthState()
        mockAuthRequest.mockResolvedValueOnce({
            reviewDetails: [],
            average: 0,
            userHasReview: false,
        } as GetProductReviewsResponse)
        renderWithRouter(<ProductReviewsComponent productId={1} />)

        expect(screen.queryByText(
            "Be the first to Review this Product:"
        )).not.toBeInTheDocument()
        expect(screen.queryByText("Reviews"))
            .not.toBeInTheDocument()
    })

}) 

describe("ReviewCard", () => {

    test("children are shown", async () => {
        renderWithRouter(<ReviewCard reviewDetail={reviewDetail} />)
        expect(await screen.findByText(reviewDetail.userName))
        expect(await screen.findByText(reviewDetail.createdAt.toString()))
        expect(await screen.findByText(reviewDetail.description ?? ''))
    })

    test("Handles Null Description", async () => {
        renderWithRouter( 
            <ReviewCard reviewDetail={reviewDetailNullDescription} />
        )
        expect(await screen.findByText(reviewDetailNullDescription.userName))
        expect(await screen.findByText(reviewDetailNullDescription.createdAt
            .toString()))
        expect(screen.getByRole("article").querySelectorAll("p")[2])
            .toHaveTextContent("")
    })
})


describe("CreateReviewComponent", () => {
    test("children are shown", async () => {
        renderWithRouter( <CreateReviewComponent productId={1} />)
        expect(await screen.findAllByLabelText("outlinestaricon"))
            .toHaveLength(5)
        expect(await screen.findByPlaceholderText("description"))
            .toBeVisible()
        expect(await screen.findByRole("button", {name: "Submit"}))
            .toBeVisible()
    })

    test("form works", async () => {
        const description= "i am description"
        const rating= 3
        renderWithRouter(<CreateReviewComponent productId={1} />)
        await user.click(
            (await screen.findAllByLabelText("outlinestaricon"))[rating-1]
        )
        expect(await screen.findAllByLabelText("solidstaricon"))
            .toHaveLength(rating)
        await user.type(
            await screen.findByPlaceholderText("description"), 
            description
        )
        await user.click(await screen.findByRole("button", {name: "Submit"}))
        await waitFor(() => expect(mockAuthRequest).toHaveBeenCalledWith(
            "/products/1/reviews", 
            {
                method: 'POST',
                body: JSON.stringify({
                    reviewSummary: {
                        rating: rating,
                        description: description,
                    } as ReviewSummary
                } as PostReviewRequest),
            }
        ))
    })

    test("rating necessary", async () => {
        renderWithRouter( <CreateReviewComponent productId={1} /> )
        await user.click(await screen.findByRole("button", {name: "Submit"}))
        await waitFor(() => expect(mockAuthRequest).not.toHaveBeenCalled())
    })

    test("description not needed", async () => {
        const rating= 3
        renderWithRouter(<CreateReviewComponent productId={1} />)
        await user.click(
            (await screen.findAllByLabelText("outlinestaricon"))[rating-1]
        )
        await user.click(await screen.findByRole("button", {name: "Submit"}))
        await waitFor(() => expect(mockAuthRequest).toHaveBeenCalledWith(
            "/products/1/reviews", 
            {
                method: 'POST',
                body: JSON.stringify({
                    reviewSummary: {
                        rating: rating,
                        description: "",
                    } as ReviewSummary
                } as PostReviewRequest),
            }
        ))
    })


    test("on submit refreshes query", async () => {
        resetAuthState(authState)
          const req = {
            reviewDetails: reviewDetails as ReviewDetail[],
            average: 4,
            userHasReview: false,
        } as GetProductReviewsResponse
        mockAuthRequest.mockResolvedValue(req)

        renderWithRouter(<ProductReviewsComponent productId={1} /> )
        await user.click(
            (await screen.findAllByLabelText("outlinestaricon"))[2]
        )
        await user.click(await screen.findByRole("button", {name: "Submit"}))
        await waitFor(() => expect(mockAuthRequest).toHaveBeenCalledTimes(3))
    })
})

describe("CreateReviewStarIcon", () => {
    test("solid or outlined", async () => {
        renderWithRouter( 
            <CreateReviewStarIcon 
            value={3} rating={4} setRating={() => null} 
            /> 
        )
        expect(await screen.findByLabelText("solidstaricon")).toBeVisible()
        renderWithRouter( 
            <CreateReviewStarIcon 
            value={3} rating={2} setRating={() => null} 
            /> 
        )
        expect(await screen.findByLabelText("outlinestaricon")).toBeVisible()
    })
    test("solid or outlined", async () => {
        const mockSetter = vi.fn()
        renderWithRouter( 
            <CreateReviewStarIcon 
            value={3} rating={2} setRating={mockSetter} 
            /> 
        )
        await user.click(await screen.findByLabelText("outlinestaricon"))
        expect(mockSetter).toHaveBeenCalledWith(3)
    })
})
