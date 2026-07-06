
import { describe, it, beforeEach, expect, test } from "vitest"

import {useAuthState, type UserModel} from '@/features/user/authState'

const userModel:UserModel = {
    id: 4, 
    email:"some@mail.com", 
    name:"someone"
}
const accessToken = "ImAnAccessToken"


describe("AuthState", () => {

    beforeEach(() => {
        localStorage.clear()
        useAuthState.setState({
            accessToken: null,
            userModel: null
        })
    })

    it("writes to local storage", () => {
        useAuthState.setState({ userModel })
        expect(localStorage.getItem("auth-storage")).toContain(userModel?.email)
    })

    test("setUserModel", () => {
        useAuthState.getState().setUserModel(userModel.id, userModel.email, userModel.name)
        expect(useAuthState.getState().userModel?.id).toBe(userModel.id)
        expect(useAuthState.getState().userModel?.email).toBe(userModel.email)
        expect(useAuthState.getState().userModel?.name).toBe(userModel.name)
    })

    test("login", () => {
        useAuthState.setState({ accessToken, userModel })
        useAuthState.getState().login(accessToken, userModel)
        expect(useAuthState.getState().accessToken).toBe(accessToken)
        expect(useAuthState.getState().userModel).toBe(userModel)
    })

    test("logout", () => {
        useAuthState.getState().logout()
        expect(useAuthState.getState().accessToken).toBe(null)
        expect(useAuthState.getState().userModel).toBe(null)
    })

    test("refresh", () => {
        useAuthState.getState().refresh(accessToken)
        expect(useAuthState.getState().accessToken).toBe(accessToken)
    })
})