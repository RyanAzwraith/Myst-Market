# Myst-Market
You one-stop shop for everything magical, dangerous, and mildly questionable.

---

# Tech Stack
- /fastAPI_Server: python fastapi, SQLAlchemy, Alembic, stripe, resend
    - Stripe is in test mode
    - Resend only works with my email
    - SQLite is used by default
- /react_client: typescript, React, Vite, playwright

---

# Setup and Run

## fastAPI_Server
Setup:
1. > cd fastapi_server
2. > python -m venv venv
3. > venv\Scripts\activate
4. > pip install -r requirements.txt
5. create .env file

Run server:
> uvicorn app.main:app --reload

migratation:
> alembic revision --autogenerate -m "message"
> alembic upgrade head

seeding:
1. edit run_seed.py
2. > python -m app.db.seeds.run_seed --clear
    - --clear is optional

testing:
> python -m pytest

## /react_client
Setup:
1. > cd react_client
2. > npm install
3. create .env file

Run Server:
> npm run dev

test Strip card number: 4242 4242 4242 4242

testing:
> npm run test

Playwright testing:
> npx playwright test --ui
- automatically runs backend server