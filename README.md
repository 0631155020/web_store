# Проект для загрузки фотографий одежды

Это веб-приложение для загрузки и просмотра фотографий одежды, разработанное на FastAPI и контейнеризированное с помощью Docker.

## Структура проекта

- `backend/`: Исходный код FastAPI-приложения.
- `data/`: JSON-файлы для хранения данных (`photos.json`, `users.json`).
- `uploads/`: Директория для хранения загруженных изображений.
- `docker-compose.yml`: Файл для запуска проекта с помощью Docker Compose.

## Требования

- Docker
- Docker Compose

## Инструкция по запуску

1.  **Склонируйте репозиторий:**
    ```bash
    git clone <URL репозитория>
    cd <имя папки>
    ```

2.  **Запустите проект с помощью Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    Эта команда соберёт Docker-образ и запустит контейнер с приложением. API будет доступно по адресу `http://localhost:8000`.

## Примеры использования API

Вы можете использовать `curl` или любой другой HTTP-клиент для взаимодействия с API.

### 1. Загрузка фотографии

- **Команда:**
  ```bash
  curl -X POST "http://localhost:8000/photos?description=Крутая%20футболка" -F "file=@/путь/к/вашему/фото.jpg"
  ```
- **Описание:**
  - Замените `/путь/к/вашему/фото.jpg` на реальный путь к файлу изображения.
  - Параметр `description` опционален.
- **Пример успешного ответа:**
  ```json
  {
    "id": "e9b1c7a0-9c2b-4f3d-8b6e-3e4a2c1b0f3d",
    "filename": "my-tshirt.jpg",
    "description": "Крутая футболка",
    "path": "/uploads/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6.jpg"
  }
  ```

### 2. Получение списка всех фотографий

- **Команда:**
  ```bash
  curl -X GET http://localhost:8000/photos
  ```
- **Пример успешного ответа:**
  ```json
  [
    {
      "id": "e9b1c7a0-9c2b-4f3d-8b6e-3e4a2c1b0f3d",
      "filename": "my-tshirt.jpg",
      "description": "Крутая футболка",
      "path": "/uploads/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6.jpg"
    }
  ]
  ```

### 3. Получение информации о конкретной фотографии

- **Команда:**
  ```bash
  curl -X GET http://localhost:8000/photos/{photo_id}
  ```
- **Описание:**
  - Замените `{photo_id}` на реальный ID фотографии из ответа на предыдущие запросы.
- **Пример успешного ответа:**
  ```json
  {
    "id": "e9b1c7a0-9c2b-4f3d-8b6e-3e4a2c1b0f3d",
    "filename": "my-tshirt.jpg",
    "description": "Крутая футболка",
    "path": "/uploads/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6.jpg"
  }
  ```
to build with docker 
```bush
docker-compose up --build
```
to delete container
```bush
docker-compose down
```

## Email Configuration

To enable email notifications for new orders, you need to configure the SMTP server settings. Create a `.env` file in the `backend` directory by copying the `backend/.env.example` file and filling in your credentials.

```bash
cp backend/.env.example backend/.env
```

Then, edit `backend/.env` with your SMTP server details:

```
SMTP_SERVER=your_smtp_server
SMTP_PORT=your_smtp_port
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_password
NOVA_POSHTA_API_KEY=your_api_key
```


to instal docker in vm

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
```

to get rid off sudo
```bash
sudo usermod -aG docker $USER && newgrp docker
```
touch .env to add file
ls -a to check hiden files 
nano .env to edit file
