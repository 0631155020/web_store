# --- Базовый образ ---
FROM python:3.9-slim

# --- Установка рабочей директории ---
WORKDIR /app

# --- Копирование файлов зависимостей ---
COPY ./backend/requirements.txt /app/

# --- Установка зависимостей ---
RUN pip install --no-cache-dir -r requirements.txt

# --- Копирование кода бэкенда ---
COPY ./backend /app/

# --- Копирование кода фронтенда ---
COPY ./frontend /app/frontend

# --- Указание порта и команды для запуска ---
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
