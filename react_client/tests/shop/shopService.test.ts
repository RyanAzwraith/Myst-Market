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
import type { SaleDetail } from '@/features/shop/shopSchemas'
import { useCategoriesQuery } from '@/features/shop/shopService'




