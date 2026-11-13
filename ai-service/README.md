# CareerLens AI - AI Microservice

This is the dedicated FastAPI AI microservice for **CareerLens AI**.
In Phase 1, it provides the service scaffolding, CORS configuration, Swagger/OpenAPI documentation, and health check monitoring endpoint. Future phases will integrate advanced resume parsing, skill matching, and career recommendation models into this service.

## Prerequisites
- Python 3.10+ (Tested with Python 3.14)
- `pip`

## Setup & Installation

1. Navigate to the `ai-service` directory:
   ```bash
   cd ai-service
   ```

2. (Recommended) Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   # Copy example environment file
   copy .env.example .env    # Windows
   cp .env.example .env      # Linux / macOS
   ```

## Running the Service

Start the FastAPI development server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Or run directly with Python:
```bash
python -m app.main
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/health` | Microservice health check |
| GET    | `/docs`   | Interactive Swagger UI API documentation |
| GET    | `/redoc`  | ReDoc OpenAPI documentation |

### Health Check Response (`GET /health`)
```json
{
  "status": "healthy",
  "service": "CareerLens AI",
  "message": "AI service is running"
}
```

