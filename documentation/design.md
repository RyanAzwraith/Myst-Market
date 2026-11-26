# Design

## Customer Flows

### Browse and Shop

1. The root route redirects to the catalogue.
2. Browse the shop, search products, or view featured, popular, newest, and most-sold products.
3. Open a product or sale detail page and view images, related media, and product reviews.
4. Add products to the cart and adjust quantities.

### Checkout and Payment

1. Review the cart and open checkout.
2. Enter shipping and payment details.
3. Create an order and complete payment through Stripe test mode.
4. Handle the success page or return to checkout when payment is not completed.
5. View the order after signing in, or create/claim an account from the checkout flow.

### Account and Orders

1. Register or log in from the account flow.
2. Set or reset a password using the password email flow.
3. View and update profile details.
4. View the order list and open an individual order.
5. View and manage personal product reviews.

### Administration

Administrators can access the dashboard to view statistics, performance, alerts, and graphs. They can also search and manage users, products, sales, and orders, including order status updates and product or sale media.

Admin pages are protected by the frontend auth guard and redirect unauthorized users to the catalogue.

## Interfaces and Implementations

The application separates contracts from runtime implementations:

```text
React page or feature
	-> typed Server interface
	-> HTTP or mock server implementation
	-> FastAPI feature route and service
	-> Database and MediaSystem interfaces
	-> configured concrete implementation
```

### Frontend

- `src/interfaces/server.ts` defines the typed client contract for app, auth, users, products, sales, reviews, items, and orders.
- `src/implementations/server/http` calls the FastAPI API.
- `src/implementations/server/mock` provides a mock server for local development or isolated tests.
- `src/features/*` contains feature schemas and client-side behavior.
- `src/pages` contains route-level screens. `src/app/PageRoutes.tsx` defines public, authenticated, and admin routes.

### Backend

- `app/features/*` groups API routes, schemas, and services by domain.
- `app/interfaces/database.py` defines the database contract and entity query access.
- `app/interfaces/media_system.py` defines the contract for storing, retrieving, listing, and deleting media.
- `app/implementations/database/sqlite` provides the SQLite database implementation and seed data.
- `app/implementations/media_system/root_folder.py` provides file-based media storage.
- `app/core/implementations.py` selects implementations from environment configuration.

## File Structure

```text
documentation/       Project documentation and design notes
fastapi_server/
	app/
		api/              Router, middleware, dependencies, and exception handling
		core/             Configuration, logging, and implementation wiring
		features/         Backend domains and API behavior
		interfaces/       Database, media, and schema contracts
		implementations/  SQLite database and root-folder media storage
		utils/            Shared backend helpers
	migrations/         Alembic migration history
	tests/              Backend unit and integration tests
react_client/
	src/
		app/              Application shell and page routing
		core/             Frontend configuration
		features/         Feature schemas and client behavior
		implementations/  HTTP and mock server implementations
		interfaces/       Typed client contracts
		pages/             Customer, account, checkout, and admin screens
		shared/            Reusable UI components
		styles/            Global and domain styles
		hooks/             Shared React hooks
		utils/             Shared frontend helpers
	tests/              Vitest and Testing Library tests
	e2e/                Playwright end-to-end tests
sqlite_database/      Local SQLite database files
Media/                Product and sale media assets
```
