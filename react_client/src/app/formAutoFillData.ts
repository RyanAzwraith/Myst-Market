import { config } from "@/core/config"

export const isDemoEnvironment = !["TEST", "E2E"]
    .includes(config.VITE_LAUNCH_TYPE)

export const mockFormData = {
    name: "Admin User",
    email: "admin@mail.demo",
    password: "password",
    address: {
        countryCode: "AU",
        postcode: "3000",
        state: "VIC",
        city: "Mock City",
        street: "123 Mock Street",
        deliveryNotes: "Leave at the front door",
    },
    product: {
        name: "Mock Product",
        categoryName: "artifacts",
        rarityName: "rare",
        priceAudCent: 2500,
        slug: "mock-product",
        description: "A mock product for exploring the demo.",
        stock: 10,
    },
    sale: {
        name: "Mock Sale",
        slug: "mock-sale",
        description: "A mock sale for exploring the demo.",
        startAt: "2026-01-01",
        endAt: "2026-12-31",
        discountPerc: 20,
    },
    review: {
        rating: 5,
        description: "A mock review for exploring the demo.",
    },
} as const