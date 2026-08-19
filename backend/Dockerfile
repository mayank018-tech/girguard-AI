# GirGuard AI - Backend Dockerfile
# Designed for IBM Cloud Code Engine / Container Registry deployment

FROM python:3.11-slim

# Set environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app/
COPY run.py .
COPY seed.py .

# IBM Cloud / production - do not copy .env files into image
# All secrets come from environment variables at runtime

EXPOSE 5000

# Use gunicorn for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--timeout", "120", "--access-logfile", "-", "app:create_app()"]
