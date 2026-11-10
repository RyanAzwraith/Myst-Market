from http.cookies import SimpleCookie


def get_response_cookie(response, name: str):
    cookies = SimpleCookie()
    if hasattr(response.headers, "get_list"):
        headers = response.headers.get_list("set-cookie")
    else:
        headers = response.headers.getlist("set-cookie")
    for header in headers:
        cookies.load(header)
    return cookies[name]


def assert_error_response(
    response,
    status_code: int,
    name: str,
    message: str,
) -> None:
    assert response.status_code == status_code
    body = response.json()
    assert body["name"] == name
    assert body["message"] == message