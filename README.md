# Проект для загрузки фотографий одежды

Это веб-приложение для загрузки и просмотра фотографий одежды, разработанное на FastAPI и контейнеризированное с помощью Docker.

## Структура проекта

- `backend/`: Исходный код FastAPI-приложения.
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


**to instal docker in vm**

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

create new migration
```bash
docker compose exec backend alembic revision --autogenerate -m "initial_migration"
```

apply migration
```bash
docker compose exec backend alembic upgrade head
```

edit conf file of nginx
```bash
sudo nano /etc/nginx/sites-available/default
```
