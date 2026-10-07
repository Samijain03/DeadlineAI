FROM python:3.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-eng && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python ocr_smoke_test.py && python manage.py test api --noinput
RUN SECRET_KEY=build-only python manage.py collectstatic --noinput
CMD ["sh", "-c", "python manage.py migrate --noinput && exec gunicorn deadline_ai.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 2 --timeout 60"]
