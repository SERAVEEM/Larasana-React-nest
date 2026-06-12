# LARASANA Microservice Backend Deployment Plan

## Goal

Deploy the LARASANA project using a single cloud VM with Docker Compose.

The deployment should support:

- React frontend
- NestJS API Gateway
- NestJS microservices
- Database
- Internal service-to-service communication
- Public HTTPS access through Caddy or Nginx
- Future Cloudflare R2 integration for image/file storage

---

## Recommended Architecture

```txt
User Browser
    ↓
Domain / Public IP
    ↓
Caddy Reverse Proxy
    ↓
Frontend Static Site
    ↓
/api route
    ↓
API Gateway
    ↓
Internal Microservices
    ↓
Database
```

Only the frontend/reverse proxy should be exposed publicly.

Internal services should communicate through Docker service names, not `localhost`.

Example:

```txt
api-gateway → users-service:3001
api-gateway → commerce-service:3002
api-gateway → notification-service:3003
```

---

## Phase 1 — Prepare the Project Locally

### 1. Confirm project structure

Recommended structure:

```txt
larasana/
├── frontend/
├── backendV2/
├── docker-compose.yml
├── Caddyfile
└── .env
```

### 2. Confirm backend services

Check the actual NestJS app names and build outputs.

Example:

```txt
dist/apps/api-gateway/src/main.js
dist/apps/users-service/src/main.js
dist/apps/commerce-service/src/main.js
dist/apps/notification-service/src/main.js
```

Important: the `command` in Docker Compose must match the real compiled file path.

### 3. Confirm database type

The LARASANA backend uses **MySQL** (configured with the `mysql2` driver and defined in `database.module.ts`). 

Configure the MySQL container and credentials in your environment files to match this setup.

---

## Phase 2 — Add Docker Files

### Backend Dockerfile

Create this file:

```txt
backendV2/Dockerfile
```

Example:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["node", "dist/apps/api-gateway/src/main.js"]
```

The default `CMD` can be overridden in `docker-compose.yml` for each service.

---

### Frontend Deployment (Vercel)

The React frontend is deployed directly on Vercel. Therefore:
* No Dockerfile is required for the frontend.
* No Nginx server configuration is needed on the VM.
* Vercel will build the frontend automatically from your GitHub repository and handle SPA routing.

---

## Phase 3 — Create Docker Compose

Create this file in the root folder:

```txt
docker-compose.yml
```

Recommended version using MySQL:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: larasana-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: larasana
      MYSQL_ALLOW_EMPTY_PASSWORD: 'yes'
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - larasana-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  api-gateway:
    build: ./backendV2
    container_name: larasana-api-gateway
    restart: unless-stopped
    command: node dist/apps/api-gateway/src/main.js
    env_file:
      - ./backendV2/.env
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - larasana-network

  users-service:
    build: ./backendV2
    container_name: larasana-users-service
    restart: unless-stopped
    command: node dist/apps/users-service/src/main.js
    env_file:
      - ./backendV2/.env
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - larasana-network

  commerce-service:
    build: ./backendV2
    container_name: larasana-commerce-service
    restart: unless-stopped
    command: node dist/apps/commerce-service/src/main.js
    env_file:
      - ./backendV2/.env
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - larasana-network

  notification-service:
    build: ./backendV2
    container_name: larasana-notification-service
    restart: unless-stopped
    command: node dist/apps/notification-service/src/main.js
    env_file:
      - ./backendV2/.env
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - larasana-network

  caddy:
    image: caddy:alpine
    container_name: larasana-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - api-gateway
    networks:
      - larasana-network

volumes:
  mysql_data:
  caddy_data:
  caddy_config:

networks:
  larasana-network:
    driver: bridge
```
```

---

## Phase 4 — Add Caddy Reverse Proxy

Create this file in the root folder:

```txt
Caddyfile
```

For domain deployment:

```caddyfile
api.yourdomain.com {
    reverse_proxy api-gateway:3000
}
```

For public IP testing without domain:

```caddyfile
:80 {
    reverse_proxy api-gateway:3000
}
```

Recommended final setup:

```txt
https://larasana-iota.vercel.app → Frontend (Vercel)
https://api.yourdomain.com/api   → API Gateway (VM)
```
```

---

Inside backend `.env`, avoid `localhost` or hardcoded `127.0.0.1` for container-to-container service communication. Update `clients.module.ts` to read service hosts from env.

Wrong (if hardcoded inside containerized microservices):

```env
# Docker container trying to reach localhost won't find other containers
USERS_SERVICE_HOST=127.0.0.1
COMMERCE_SERVICE_HOST=127.0.0.1
NOTIFICATION_SERVICE_HOST=127.0.0.1
```

Correct (using Docker Compose DNS service names):

```env
USERS_SERVICE_HOST=users-service
COMMERCE_SERVICE_HOST=commerce-service
NOTIFICATION_SERVICE_HOST=notification-service
```

Database example for MySQL:

```env
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=larasana
```

Frontend API Base URL (Configure this in the **Vercel Project Settings Dashboard**, not on the VM):

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

For local testing without domain (where Vercel or React dev server runs locally):

```env
VITE_API_BASE_URL=http://localhost/api/v1
```
```

---

## Phase 6 — Test Locally First

From the root folder:

```bash
docker compose build
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

Check logs:

```bash
docker compose logs api-gateway
docker compose logs users-service
docker compose logs commerce-service
docker compose logs notification-service
docker compose logs mysql
docker compose logs caddy
```

Open:

```txt
http://localhost
http://localhost/api
```

Fix local Docker issues before deploying to the VM.

---

## Phase 7 — Prepare Oracle Cloud VM

### 1. Create VM

Recommended VM:

```txt
Oracle Cloud Always Free
Ampere A1 ARM
Ubuntu
4 OCPU
24 GB RAM
```

### 2. Open ports

Allow these ports in Oracle Cloud security list:

```txt
22   SSH
80   HTTP
443  HTTPS
```

Do not publicly expose:

```txt
3000
3001
3002
3003
5432
```

Those should stay internal.

---

## Phase 8 — Install Docker on VM

SSH into the VM:

```bash
ssh ubuntu@your_server_ip
```

Install Docker:

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo usermod -aG docker $USER
```

Apply Docker group permission:

```bash
exit
```

Then SSH again.

Check installation:

```bash
docker --version
docker compose version
```

---

## Phase 9 — Deploy Project to VM

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

Create or update `.env` files:

```bash
nano backendV2/.env
nano frontend/.env
```

Build and run:

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
```

Check logs:

```bash
docker compose logs -f
```

---

## Phase 10 — Domain and HTTPS

### 1. Point domain DNS to VM

Create DNS record:

```txt
Type: A
Name: @
Value: your_server_ip
```

Optional:

```txt
Type: CNAME
Name: www
Value: yourdomain.com
```

### 2. Update Caddyfile

```caddyfile
yourdomain.com {
    reverse_proxy /api/* api-gateway:3000

    reverse_proxy frontend:80
}
```

Restart Caddy:

```bash
docker compose restart caddy
```

Caddy should automatically handle HTTPS.

---

## Phase 11 — Database Schema & Data Initialization

Since synchronization is disabled in production and the project uses standard SQL schema scripts rather than NestJS TypeORM migration commands, initialize the database by importing the local SQL file.

Run this command from the root of your project directory:

```bash
docker exec -i larasana-mysql mysql -u root larasana < backendV2/larasana_db.sql
```

---

## Phase 12 — R2 Integration

Do this after Docker deployment is stable.

### R2 should be used for:

- Product images
- Artisan images
- Storytelling content images
- Uploadable media

### Backend should store:

```txt
image_url
image_key
bucket_name
```

### Recommended flow:

```txt
Frontend upload request
    ↓
API Gateway
    ↓
Storage/R2 service
    ↓
Cloudflare R2
    ↓
Public image URL saved to database
```

### Environment variables:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

---

## Phase 13 — Debugging Commands

View all containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f api-gateway
```

Restart one service:

```bash
docker compose restart api-gateway
```

Rebuild one service:

```bash
docker compose up -d --build api-gateway
```

Enter backend container:

```bash
docker compose exec api-gateway sh
```

Enter database container:

```bash
docker compose exec mysql mysql -u root larasana
```

Stop all services:

```bash
docker compose down
```

Stop and remove database volume:

```bash
docker compose down -v
```

Be careful: `-v` deletes database data.

---

## Deployment Checklist

### Local

- [ ] Backend builds successfully
- [ ] Frontend builds and deploys successfully on Vercel
- [ ] Docker Compose runs locally
- [ ] API Gateway can connect to microservices
- [ ] Microservices can connect to database
- [ ] Frontend can call Backend API successfully (CORS resolved)
- [ ] No service depends on `localhost` incorrectly

### VM

- [ ] Oracle VM created
- [ ] SSH works
- [ ] Ports 22, 80, 443 opened
- [ ] Docker installed
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] Docker Compose runs successfully
- [ ] Logs show no fatal errors
- [ ] API endpoints accessible from public IP or subdomain (e.g. api.yourdomain.com)

### Production-ish Setup

- [ ] Domain connected
- [ ] HTTPS active
- [ ] Database volume enabled
- [ ] Only reverse proxy exposed publicly
- [ ] R2 integrated after deployment works
- [ ] Secrets are not committed to GitHub

---

## Recommended Order of Work

Do not deploy everything at once.

Use this order:

```txt
1. Dockerize backend only
2. Configure dynamic CORS in api-gateway
3. Deploy frontend to Vercel and configure env variables
4. Add MySQL database container
5. Add Docker Compose networking
6. Add Caddy reverse proxy for backend
7. Test locally
8. Deploy backend to Oracle VM
9. Add subdomain and HTTPS
10. Add R2 integration
```

This prevents debugging chaos.

---

## Presentation Explanation

For software architecture presentation, explain it like this:

> Our deployment uses a hybrid architecture: the React frontend is deployed serverlessly on Vercel for fast loading and automatic scaling, while the NestJS microservices and MySQL database are deployed on a single cloud VM using Docker Compose. The services communicate internally over a private Docker network, and public API requests are securely routed through Caddy with automatic SSL. This gives us zero-maintenance frontend hosting coupled with a secure, containerized microservices backend.

---

## Final Notes

This setup is enough for:

- University project demo
- MVP deployment
- Small-scale real user testing
- Architecture presentation

It is not yet full enterprise production, but it is a strong and realistic deployment approach for LARASANA.
