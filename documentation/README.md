# Myst-Market

You one-stop shop for everything magical, dangerous, and mildly questionable.

## Tech Stack

- `fastapi_server`: FastAPI, SQLAlchemy, Alembic, SQLite, Stripe, and Resend
- `react_client`: React, TypeScript, Vite, Vitest, Testing Library, and Playwright

Stripe is configured for test mode. Resend email delivery is tied to the configured account and may not work for arbitrary recipients.

## Backend Setup

```powershell
cd fastapi_server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .dev.env
```

Edit `fastapi_server/.dev.env` and provide the required keys. The default development configuration uses SQLite and stores the database in `sqlite_database/myst_market_database.db`.

Start the API from `fastapi_server`:

```powershell
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`.

### Database

Apply existing migrations:

```powershell
alembic upgrade head
```

Generate a migration after changing the SQLAlchemy models:

```powershell
alembic revision --autogenerate -m "describe the change"
```

For development data, run the SQLite seed script from `fastapi_server`:

```powershell
python -m app.implementations.database.sqlite.dev_seed
```

### Backend Tests

```powershell
python -m pytest
```

## Frontend Setup

```powershell
cd react_client
npm install
Copy-Item .env.example .env.development
```

Set `VITE_SERVER_URL=http://localhost:8000` and a test `VITE_STRIPE_PUBLIC_KEY` in `.env.development`.

Start the frontend:

```powershell
npm run dev
```

The app is available at `http://localhost:5173`.

### Frontend Checks and Tests

```powershell
npm run typecheck
npm run test
npm run build
```

Run the end-to-end suite with the backend and frontend configuration in `.env.e2e`:

```powershell
npx playwright test
```

Playwright starts the Vite frontend and the test backend automatically. The test Stripe card number is `4242 4242 4242 4242`.
