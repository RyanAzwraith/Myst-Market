

type ReviewDetail = {
    reviewId: number,
    userName: string,
    productId: number,
    createdAt: Date,
    rating: number,
    description?: string | null,
}

type ReviewSummary = {
    rating: number,
    description?: string | null
}

// Routes
// GET /products/productId/reviews
// POST /products/productId/reviews`
// GET /users/userId/reviews
// DELETE /reviews/orderId


type GetProductReviewsResponse = {
    reviewDetails: ReviewDetail[],
    average: number,
    userHasReview:boolean,
}

type PostReviewRequest = {
    reviewSummary: ReviewSummary
}

type GetUserReviewsResponse = {
    reviewDetails: ReviewDetail[],
}

export type {
    ReviewDetail,
    GetProductReviewsResponse,
    PostReviewRequest,
    GetUserReviewsResponse,
    ReviewSummary
}
