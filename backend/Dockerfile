# --- Базовый образ ---
FROM python:3.9-slim

# Устанавливаем сетевые утилиты
RUN apt update && apt install -y iputils-ping telnet && rm -rf /var/lib/apt/lists/*

# --- Установка рабочей директории ---
# Используем /app как корень проекта
WORKDIR /app

# --- Копирование зависимостей ---
# Копируем из папки backend на хосте в текущую папку (/app) в контейнере
COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Копирование кода ---
# Важно: Копируем папку src целиком, чтобы работали импорты "from src.models"
COPY ./backend/src ./src
COPY ./backend/alembic.ini .

# Открываем порт
EXPOSE 8000

# Запуск: Сначала миграции, потом приложение
# Обратите внимание на "src.main:app" - теперь путь правильный
CMD ["sh", "-c", "alembic -c /app/alembic.ini upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000"]