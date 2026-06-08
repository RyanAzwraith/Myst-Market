# Myst-Market
You one-stop shop for everything magical, dangerous, and mildly questionable.

---

# Tech Stack
- /fastAPI_Server: python fastapi, SQLAlchemy, Alembic, stripe
    - Stripe is in test mode
    - SQLite is used by default
- /react_client: typescript, React, Vite

---

# Setup and Run

## fastAPI_Server
Setup:
1. > cd fastapi_server
2. > python -m venv venv
3. > venv\Scripts\activate
4. > pip install -r requirements.txt
5. create .env

Run server:
> uvicorn app.main:app --reload

create migration:
> alembic revision --autogenerate -m "message"
run migration:
> alembic upgrade head

test Strip card number: 4242 4242 4242 4242

## /react_client
Setup:
1. > cd react_client
2. > npm install
3. create .env

Run Server:
> npm run dev