

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
// GET /products/{product_id}/reviews
// POST /products/{product_id}/reviews
// GET /user/me/reviews
// DELETE /reviews/{review_id}  

type GetProductReviewsResponse = {
    reviewDetails: ReviewDetail[],
    average: number,
    userHasReview:boolean,
}

type PostProductReviewRequest = {
    reviewSummary: ReviewSummary
}

type GetUserReviewsResponse = {
    reviewDetails: ReviewDetail[],
}

export type {
    ReviewDetail,
    GetProductReviewsResponse,
    PostProductReviewRequest,
    GetUserReviewsResponse,
    ReviewSummary
}
