# abadpukur-high-school/backend/Dockerfile
FROM python:3.12-slim

# Prevent Python from generating .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for PostgreSQL (psycopg) and Image processing (Pillow)
RUN apt-get update && apt-get install -y \
    libpq-dev gcc python3-dev \
    libjpeg-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

COPY . .

# Ensure media and static directories exist
RUN mkdir -p /app/media/students/photos /app/media/teachers/photos /app/static

EXPOSE 8000

# Run migrations and collectstatic at runtime, then start Gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120"]