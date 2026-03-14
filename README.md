  **run ptoject with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
     
     
get API on http://localhost:8000


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
