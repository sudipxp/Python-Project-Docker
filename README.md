# Python API Application

A modern REST API application built with FastAPI.

## Features

- FastAPI framework for high performance
- Automatic API documentation (Swagger UI)
- Request/response validation with Pydantic
- CORS middleware enabled
- RESTful endpoints for CRUD operations
- Health check endpoint

## Running the Application

### Development Server

Run the application using uvicorn:

```bash
uvicorn main:app --reload
```

Or run directly:

```bash
python main.py
```

The API will be available at:
- **UI**: http://localhost:8000
- **API base**: http://localhost:8000/api
- **Health**: http://localhost:8000/api/health
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc

## Running with Docker

This project includes a `Dockerfile` that builds a single container for the FastAPI backend (serving both the API and the HTML UI).

### Build the image

From the project root:

```bash
docker build -t python-app .
```

### Run the container (with external MySQL)

The application expects a MySQL database. When running with plain Docker you must point it to an existing MySQL instance by setting environment variables:

```bash
docker run -d -p 8000:8000 ^
  -e DB_HOST=your-mysql-host ^
  -e DB_PORT=3306 ^
  -e DB_USER=app_user ^
  -e DB_PASSWORD=app_password ^
  -e DB_NAME=app_db ^
  --name python-app python-app
```

Then open:

- **UI**: http://localhost:8000
- **API base**: http://localhost:8000/api

## Running with Docker Compose (API + UI + MySQL)

For local development, use `docker-compose.yml` (named `Docker-Compose.yml` in this project) to start both the FastAPI app and a MySQL database.

### Start the stack

From the project root:

```bash
docker compose up --build
```

This will:

- Start a **MySQL 8** container with:
  - `MYSQL_DATABASE=app_db`
  - `MYSQL_USER=app_user`
  - `MYSQL_PASSWORD=app_password`
- Build and start the **`pyhton-app`** service (FastAPI + UI) with matching environment variables:
  - `DB_HOST=mysql`
  - `DB_PORT=3306`
  - `DB_USER=app_user`
  - `DB_PASSWORD=app_password`
  - `DB_NAME=app_db`
- Ensure the app waits for MySQL to be healthy before starting (via `depends_on` + healthcheck).

### Accessing the services

- **UI dashboard**: http://localhost:8000
- **API base**: http://localhost:8000/api
- **Health check**: http://localhost:8000/api/health
- **Swagger docs**: http://localhost:8000/docs

## API Endpoints

### Base Endpoints

- `GET /` - API information
- `GET /health` - Health check

### Items Endpoints

- `GET /items` - Get all items
- `GET /items/{item_id}` - Get item by ID
- `POST /items` - Create new item
- `PUT /items/{item_id}` - Update item
- `DELETE /items/{item_id}` - Delete item

## Example Usage

### Create an item
```bash
curl -X POST "http://localhost:8000/items" \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "description": "Gaming laptop", "price": 1299.99}'
```

### Get all items
```bash
curl "http://localhost:8000/items"
```

### Get item by ID
```bash
curl "http://localhost:8000/items/1"
```

### Update item
```bash
curl -X PUT "http://localhost:8000/items/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Laptop", "description": "Updated description", "price": 1199.99}'
```

### Delete item
```bash
curl -X DELETE "http://localhost:8000/items/1"
```

## Project Structure

```
.
├── main.py                 # FastAPI entry point (re-exports backend.app)
├── backend/                # Backend package (API, DB models, config)
├── ui/                     # HTML5/CSS/JS single-page UI
├── requirements.txt        # Python dependencies
├── Dockerfile              # Image for FastAPI app
├── Docker-Compose.yml      # Docker Compose stack (MySQL + app)
├── README.md               # Project documentation
└── .gitignore              # Git ignore file
```

## Next Steps

- Add database integration (SQLAlchemy, MongoDB, etc.)
- Add authentication and authorization
- Add request logging
- Add unit tests
- Add environment configuration
- Deploy to production (Docker, cloud services, etc.)


