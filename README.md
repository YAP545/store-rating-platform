# Full-Stack Store Rating Platform

A production-quality full-stack web application designed for users to discover, rate, and manage stores with Role-Based Access Control (RBAC).

---

## Fresh Database Setup

To set up and run the project from a completely fresh/empty MySQL database:

### 1. Prerequisites
- **Node.js**: v18.0.0+
- **npm**: v9.0.0+
- **MySQL Server**: v8.0+ running on `localhost:3306`

### 2. Clone & Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd store-rating-platform

# Configure Backend environment variables
cd backend
cp .env.example .env
# Edit .env to set DB_USERNAME and DB_PASSWORD if your local MySQL root password is not 'root'
```

### 3. Create Empty MySQL Database
Run in MySQL client / Workbench:
```sql
CREATE DATABASE store_rating_db;
```

### 4. Install Dependencies, Run Migrations & Seed
```bash
# Install backend dependencies
cd backend
npm install

# Run database migrations (creates users, stores, ratings, audit_logs tables)
npm run migration:run

# Seed demo accounts, stores, ratings, and audit logs
npm run seed

# Start NestJS backend server
npm run start:dev
```
Backend API server will start on: `http://localhost:3001`

### 5. Frontend Setup
Open a second terminal window:
```bash
cd frontend

# Install frontend dependencies
npm install

# Start React Vite dev server
npm run dev
```
Frontend web application will start on: `http://localhost:3000`

---

## Demo Accounts

The project includes seeded demo accounts for all application roles. You can log in with any of these credentials:

| Role | Email | Password | Role Description & Capabilities |
| :--- | :--- | :--- | :--- |
| **SYSTEM ADMIN** | `admin@demo.com` | `Admin@1234` | Full platform control: Manage users, manage stores, owner assignments, reports & analytics, settings, and system audit logs. |
| **STORE OWNER 1** | `owner1@demo.com` | `Owner@1234` | Manages "TechWorld Electronics Hub" & "BookHaven International Bookstore". Access to Owner Dashboard, store metrics, & customer rating logs. |
| **STORE OWNER 2** | `owner2@demo.com` | `Owner@234` | Manages "Organic Supermarket & Fresh Market". Access to Owner Dashboard & customer feedback analytics. |
| **NORMAL USER 1** | `user1@demo.com` | `User@1234` | Customer account. Browse stores directory, view details, submit 1–5 star ratings, & modify existing feedback. |
| **NORMAL USER 2** | `user2@demo.com` | `User@1234` | Customer account. Browse stores, rate stores, & manage personal account. |
| **NORMAL USER 3** | `user3@demo.com` | `User@1234` | Customer account. Browse stores, rate stores, & manage personal account. |

*(Note: `admin@storerating.com`, `owner1@storerating.com`, and `user1@storerating.com` are also available as backup seeded accounts with the same passwords).*

---

## Tech Stack

- **Frontend**: React.js (Vite), React Router v6, Axios, Lucide Icons, Glassmorphic Vanilla CSS.
- **Backend**: NestJS (TypeScript), TypeORM, Passport JWT, Bcrypt password hashing, Class Validator & Transformer.
- **Database**: MySQL 8.0+ with relational schema, foreign keys, indexes, and unique constraints.

---

## Database ER Diagram & Relational Schema

```
+------------------------------------+       +------------------------------------+
|               USERS                |       |               STORES               |
+------------------------------------+       +------------------------------------+
| id (PK, INT AUTO_INCREMENT)        |       | id (PK, INT AUTO_INCREMENT)        |
| name (VARCHAR 60)                  |   +---| ownerId (FK -> USERS.id, NULLABLE)|
| email (VARCHAR 255 UNIQUE)         |<--+   | name (VARCHAR 60)                  |
| password (VARCHAR 255 HASHED)      |       | email (VARCHAR 255)                |
| address (VARCHAR 400)              |       | address (VARCHAR 400)              |
| role (ENUM)                        |       | createdAt / updatedAt              |
| createdAt / updatedAt              |       +------------------------------------+
+------------------------------------+                         ^
                  ^                                            |
                  |          +----------------------+          |
                  +----------|       RATINGS        |----------+
                             +----------------------+
                             | id (PK, INT)         |
                             | userId (FK -> USERS) |
                             | storeId (FK -> STORES|
                             | rating (INT 1-5)     |
                             | UNIQUE(userId,storeId|
                             +----------------------+
```

---

## Key API Endpoints

### Auth (`/auth`)
- `POST /auth/register` — Public registration for normal users
- `POST /auth/login` — Authenticates & returns JWT token
- `POST /auth/change-password` — Protected password update

### Stores (`/stores`)
- `GET /stores` — Paginated store list with search, sorting, overall ratings, & user rating status
- `GET /stores/:id` — Single store details
- `POST /stores` — Admin store creation
- `PUT /stores/:id/owner` — Assign / Change store owner
- `DELETE /stores/:id/owner` — Remove store owner assignment (sets ownerId to NULL)
- `DELETE /stores/:id` — Delete store safely

### Ratings (`/ratings`)
- `POST /ratings` — Submit store rating (Normal User)
- `PUT /ratings/:id` — Modify existing rating (Normal User)

### Admin (`/admin`)
- `GET /admin/dashboard` — Statistics counters (`totalUsers`, `totalStores`, `totalRatings`)
- `GET /admin/users` — Paginated user directory with search/filters/sort
- `GET /admin/stores` — Paginated store directory with sortable ratings
- `DELETE /admin/users/:id` — Safely remove user account
- `GET /admin/reports` — Analytics and rating distribution metrics
- `GET /admin/logs` — Audit log trail

### Owner (`/owner`)
- `GET /owner/dashboard` — Owner store statistics, rating performance distribution, & customer feedback logs

---

## Building for Production

```bash
# Build Backend
cd backend
npm run build

# Build Frontend
cd frontend
npm run build
```
