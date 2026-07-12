import { describe, expect, vi, beforeEach, test } from "vitest"
import { screen } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter, 
    resetAuthState, 
    getByRole,
    getByText,
    expectIsNullByText,
} from "../utils";

import { AppRoutes } from '@/AppRoutes'
import { ServerException } from "@/core"
import { useCategoriesQuery } from '@/features/shop/shopService'
import type { details } from '@/features/shop/shopSchemas'
import { ShopPage } from '@/features/shop/ShopPage'
