#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🎨 Collecting static files for WhiteNoise..."
python manage.py collectstatic --no-input

echo "🗄️ Applying database migrations..."
python manage.py migrate

echo "🌱 Seeding initial academic data..."
python seed_data.py || true

echo "✅ Build completed successfully!"
