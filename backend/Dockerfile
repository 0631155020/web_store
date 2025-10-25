# --- Базовый образ ---
FROM python:3.9-slim

# --- Установка рабочей директории ---
WORKDIR /app

# --- Копирование файлов зависимостей ---
COPY ./backend/requirements.txt /app/

# --- Установка зависимостей ---
RUN pip install --no-cache-dir -r requirements.txt

# --- Копирование кода приложения ---
COPY ./backend /app/

# --- Указание порта и команды для запуска ---
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
