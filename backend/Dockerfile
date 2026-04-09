# --- Базовый образ ---
FROM python:3.9-slim

# --- НОВЫЙ ШАГ ---
# Устанавливаем необходимые сетевые утилиты (ping)
RUN apt update && apt install -y iputils-ping telnet && rm -rf /var/lib/apt/lists/*
# ------------------

# --- Установка рабочей директории ---
WORKDIR /app/backend

# --- Копирование файлов зависимостей ---
COPY ./backend/requirements.txt /app/backend/

# --- Установка зависимостей ---
RUN pip install --no-cache-dir -r requirements.txt

# --- Копирование кода бэкенда ---
COPY ./backend/src /app/src

# --- Копирование конфигурации Alembic ---
COPY ./backend/alembic.ini /app/
COPY ./backend/alembic /app/alembic

# # --- Копирование кода фронтенда ---
# COPY ./frontend /app/frontend

# --- Указание порта и команды для запуска ---
EXPOSE 8000

# First run a python script to init db (waits for db), then upgrade alembic, then start uvicorn
CMD ["sh", "-c", "python -c 'from src.database import init_db; init_db()' && alembic upgrade head && exec uvicorn src.main:app --host 0.0.0.0 --port 8000"]
