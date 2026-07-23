import { request, authRequest, actionRequest } from "@/api";

// Routes
//   POST /login
//   POST /logout
//   GET /refresh
//   PUT /register
//   POST /user/me/set-password-email
//   PATCH /user/me
//   PATCH /user/me/password
//   DELETE /users/{user_id}
//   DELETE /user/me

// sub types
type UserResponse = {
	id: number;
	email: string;
	name: string;
};

// POST /login
type LoginRequest = {
	email: string;
	password: string;
};
type LoginResponse = {
	accessToken: string;
	userResponse: UserResponse;
};
async function loginRoute(data: LoginRequest) {
	return request<LoginResponse>("/login", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

// POST /logout
async function logoutRoute() {
	return request("/logout", {
		method: "POST",
	});
}

// GET /refresh
type RefreshResponse = {
	accessToken: string;
};
async function refreshRoute() {
	return request<RefreshResponse>("/refresh", {
		method: "GET",
	});
}

// PUT /register
type RegisterRequest = {
	email: string;
	name: string;
}
async function registerRoute(data: RegisterRequest) {
	return request("/register", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

// POST /user/me/set-password-email

async function postSetPasswordEmailRoute() {
	return authRequest("/user/me/set-password-email", {
		method: "POST",
	});
}

// PATCH /user/me
type UserPatchRequest = {
	email?: string;
	name?: string;
};
type UserPatchResponse = UserResponse

async function patchUserRoute(data: UserPatchRequest) {
	return authRequest<UserPatchResponse>("/user/me", {
		method: "PATCH",
		body: JSON.stringify(data),
	});
}

// PATCH /user/me/password
type UserPatchPasswordRequest = {
	password: string;
}

type UserPatchPasswordResponse = LoginResponse
async function patchUserPasswordRoute(data: UserPatchPasswordRequest){
	return actionRequest<UserPatchPasswordResponse>("/user/me/password", {
		method: "PATCH",
		body: JSON.stringify(data),
	});
}


// DELETE /user/me
async function deleteUserRoute() {
	return authRequest("/user/me", {
		method: "DELETE",
	});
}

// DELETE /users/{user_id}
async function adminDeleteUserRoute(user_id: number) {
	return authRequest(`/users/${user_id}`, {
		method: "DELETE",
	});
}

export {
	adminDeleteUserRoute,
	deleteUserRoute,
	loginRoute,
	logoutRoute,
	patchUserRoute,
	refreshRoute,
	registerRoute,
	postSetPasswordEmailRoute,
	patchUserPasswordRoute
}

export type {
	RegisterRequest
}
