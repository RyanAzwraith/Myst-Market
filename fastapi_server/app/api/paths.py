

class Paths:
    class App:
        stats = "/stats"
        performance = "/performance"  # Admin
        attention = "/attention"  # Admin
        graph = "/graph"  # Admin

    class Auth:
        refresh = "/refresh"
        login = "/login"
        logout = "/logout"

    class User:
        create = "/user"
        me = "/user/me"  # Authenticated
        password = "/user/me/password"  # Authenticated
        passwordEmail = "/user/me/password-email"  # Authenticated
        reviews = "/user/me/reviews"  # Authenticated
        order = lambda orderId: f"/user/orders/{orderId}"  # Authenticated
        orders = "/user/orders"  # Authenticated
        analytics = lambda userId: f"/users/{userId}/analytics"  # Admin

    class Users:
        searchAdmin = "/users/search-admin"  # Admin

    class Sale:
        create = "/sale"  # Admin
        byId = lambda id: f"/sale/{id}"  # Admin
        bySlug = lambda slug: f"/sale/{slug}"
        image = lambda id: f"/sale/{id}/image"
        medias = lambda id: f"/sale/{id}/media"
        analytics = lambda id: f"/sale/{id}/analytics"  # Admin

    class Sales:
        all = "/sales"  # Admin
        biggest = "/sales/biggest"
        searchAdmin = "/sales/search-admin"  # Admin

    class Product:
        create = "/product"  # Admin
        byId = lambda id: f"/products/{id}"  # Admin
        bySlug = lambda slug: f"/product/{slug}"
        image = lambda id: f"/product/{id}/image"
        medias = lambda id: f"/product/{id}/medias"
        reviews = lambda id: f"/product/{id}/reviews"
        analytics = lambda id: f"/products/{id}/analytics"  # Admin

    class Products:
        all = "/products"  # Admin
        featured = "/products/featured"
        popular = "/products/popular"
        newest = "/products/newest"
        mostSold = "/products/most-sold"
        search = "/products/search"  # Admin and unauthenticated
        searchAdmin = "/products/search-admin"  # Admin

    class Review:
        create = "/review"
        byId = lambda id: f"/review/{id}"  # Authenticated

    class Reviews:
        testimonials = "/reviews/testimonials"

    class Items:
        resolve = "/items/resolve"

    class Order:
        create = "/order"
        byId = lambda id: f"/orders/{id}"  # Authenticated
        user = lambda id: f"/orders/{id}/user"  # Admin
        status = lambda id: f"/orders/{id}/status"  # Admin

    class Orders:
        recent = "/orders/recent"  # Admin
        searchAdmin = "/orders/search-admin"  # Admin
        status = "/orders/status"  # Admin

    class Media:
        get = lambda entity_type, file_name: f"/media/{entity_type}/{file_name}"