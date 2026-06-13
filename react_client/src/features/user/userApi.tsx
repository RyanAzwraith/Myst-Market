import { request } from "@/api";


//  Routes
//    PATCH /user/me
//    DELETE /user/me
//    DELETE /users/{user_id}
//    POST /auth/login
//    GET /auth/logout
//    GET /auth/refresh
//   PUT /auth/register

// sub types
type UserResponse = {
	id: number;
	email: string;
	isAdmin: boolean;
	isRegistered: boolean;
	name: string;
};

// PATCH /user/me
type UserPatchRequest = {
	email?: string;
	password?: string;
	name?: string;
};
type UserPatchResponse = UserResponse

async function patch_user_route(data: UserPatchRequest) {
	return request<UserPatchResponse>("/user/me", {
		method: "PATCH",
		body: JSON.stringify(data),
	});
}

// DELETE /user/me
async function delete_user_route() {
	return request("/user/me", {
		method: "DELETE",
	});
}

// DELETE /admin/users/{user_id}
async function admin_delete_user_route(user_id: number) {
	return request(`/admin/users/${user_id}`, {
		method: "DELETE",
	});
}

// POST /auth/login
type LoginRequest = {
	email: string;
	password: string;
};
type LoginResponse = {
	accessToken: string;
	userResponse: UserResponse;
};
async function login_route(data: LoginRequest) {
	return request<LoginResponse>("/auth/login", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

// GET /auth/logout
async function logout_route() {
	return request("/auth/logout", {
		method: "GET",
	});
}

// GET /auth/refresh
type RefreshResponse = {
	accessToken: string;
};
async function refresh_route() {
	return request<RefreshResponse>("/auth/refresh", {
		method: "GET",
	});
}

// PUT /auth/register
type RegisterRequest = {
	email: string;
	password: string;
	name: string;
}
type RegisterResponse = LoginResponse
async function register_route(data: RegisterRequest) {
	return request<RegisterResponse>("/auth/register", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export {
	admin_delete_user_route,
	delete_user_route,
	login_route,
	logout_route,
	patch_user_route,
	refresh_route,
	register_route,
};
