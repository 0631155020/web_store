# 🌙 Pajama Dream: Full-Stack E-Commerce Platform

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)

**Pajama Dream** is a comprehensive, full-stack e-commerce web application designed to sell premium pajamas. It serves as a showcase of my ability to design, develop, and deploy a complete web solution from the ground up, utilizing modern technologies and best practices.

This project demonstrates my proficiency in building responsive frontends, robust RESTful APIs, integrating third-party services (Telegram), and containerizing applications for reliable deployment.

Also this application is deployed on Digital ocean and can be accessed on https://www.pajamas585.com/

---

## ✨ Key Features & Technical Highlights

This application is built with a focus on user experience, performance, and maintainability.

### For Customers
*   **Dynamic Product Catalog:** Products are fetched asynchronously via REST API, providing a fast and seamless browsing experience.
*   **Intuitive Shopping Cart:** A robust, client-side shopping cart with dynamic total calculation and immediate UI updates.
*   **Multilingual Support (i18n):** The application is fully localized in English, Ukrainian, and Russian, demonstrating an understanding of globalized application design.
*   **Responsive Design:** A mobile-first approach ensures the store looks and functions perfectly on all devices, from smartphones to large desktop monitors.
*   **Streamlined Checkout Process:** A user-friendly checkout form with validation and dynamic delivery options (e.g., Nova Poshta integration).

### For Administrators
*   **Secure Admin Panel:** A dedicated interface for managing the product catalog.
*   **Media Management:** Capability to upload and manage product images, including main photos and size guides. Image uploads are handled efficiently using chunked streaming to optimize memory usage.
*   **Real-time Order Notifications (Telegram Integration):** Orders placed on the site instantly trigger a notification to a designated Telegram bot via background tasks, ensuring rapid order fulfillment without blocking the user's checkout experience.

### Architecture & Infrastructure
*   **Microservices-oriented Containerization:** The application is fully dockerized with separate containers for the backend (FastAPI), database (PostgreSQL), and web server/reverse proxy (Nginx).
*   **Database Migrations:** Alembic is used for version control of the database schema, ensuring smooth updates and consistency across environments.
*   **Efficient Static File Serving:** Nginx is configured to serve static frontend assets directly, offloading this task from the Python backend for improved performance.

---

## 🛠️ Technology Stack

**Frontend:**
*   HTML5, CSS3, JavaScript (ES6+)
*   Custom i18n implementation for dynamic translation management
*   Responsive, custom-built CSS architecture (no heavy CSS frameworks)

**Backend:**
*   **Python 3.9+**
*   **FastAPI:** Chosen for its high performance, automatic interactive API documentation (Swagger UI), and modern Python asynchronous features.
*   **SQLAlchemy (ORM):** For secure, efficient database interactions and modeling.
*   **Alembic:** For reliable database schema migrations.
*   **Pydantic:** For data validation and serialization.
*   **Uvicorn:** ASGI server for serving the FastAPI application.

**Database:**
*   **PostgreSQL 13:** A robust, scalable open-source relational database.

**Infrastructure & Deployment:**
*   **Docker & Docker Compose:** For isolated, reproducible development and production environments.
*   **Nginx:** Acting as a reverse proxy to route traffic and serve static content efficiently.

---

## 🚀 Getting Started

To run this project locally, you will need Docker and Docker Compose installed on your machine.

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Environment Configuration:**
    Create a `.env` file in the root directory and configure the necessary environment variables.
    ```bash
    touch .env
    # Example .env content:
    POSTGRES_USER=myuser
    POSTGRES_PASSWORD=mypassword
    POSTGRES_DB=mydatabase
    DATABASE_URL=postgresql://myuser:mypassword@db/mydatabase
    TELEGRAM_BOT_TOKEN=your_bot_token_here
    TELEGRAM_CHAT_ID=your_chat_id_here
    PGADMIN_DEFAULT_EMAIL=admin@admin.com
    PGADMIN_DEFAULT_PASSWORD=admin
    ```

3.  **Build and Run with Docker Compose:**
    Launch the entire application stack in detached mode:
    ```bash
    sudo docker compose up -d --build
    ```
    *(Note: Use `sudo` if your user is not in the `docker` group)*

4.  **Database Migrations:**
    The backend container is configured to automatically run `alembic upgrade head` on startup after waiting for the database to be ready.
    If you need to create a new migration manually:
    ```bash
    sudo docker compose exec backend alembic revision --autogenerate -m "description"
    sudo docker compose exec backend alembic upgrade head
    ```

5.  **Access the Application:**
    *   **Frontend Web App:** `http://localhost:8000` (Served via FastAPI StaticFiles for local dev, or Nginx in a full production setup)
    *   **Interactive API Docs (Swagger UI):** `http://localhost:8000/docs`
    *   **pgAdmin (Database Management):** `http://localhost:8080`

---

## 📁 Project Structure

```
├── backend/                  # FastAPI Backend application
│   ├── src/                  # Source code (routers, models, schemas, core logic)
│   ├── alembic/              # Database migration scripts
│   ├── Dockerfile            # Backend container definition
│   ├── requirements.txt      # Python dependencies
│   └── alembic.ini           # Alembic configuration
├── frontend/                 # Client-side web application
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript logic (cart, UI interactions, API calls)
│   ├── locales/              # i18n JSON translation files (en, ru, ua)
│   └── *.html                # HTML templates
├── uploads/                  # Shared volume for user-uploaded product images
├── docker-compose.yml        # Orchestration configuration for all services
└── README.md                 # Project documentation
```

---

## 🔮 Future Improvements

While this project is a fully functional e-commerce foundation, I have designed it with future scalability in mind. Potential enhancements include:

*   **Authentication & Authorization:** Implementing JWT-based authentication to secure the admin panel and allow customer accounts (order history, saved addresses).
*   **Payment Gateway Integration:** Integrating with a payment provider (e.g., Stripe, LiqPay) for seamless, secure online transactions.
*   **CI/CD Pipeline:** Implementing GitHub Actions or GitLab CI for automated testing, code quality checks, and continuous deployment.
*   **Comprehensive Testing:** Expanding the test suite with robust unit tests (pytest) and end-to-end tests (Playwright/Cypress) to ensure maximum reliability.

---

*Thank you for taking the time to review my work! I am eager to bring this level of dedication, technical skill, and product-focused mindset to a forward-thinking engineering team.*
