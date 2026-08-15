# REST API Reference Documentation

This document provides complete documentation for the backend API endpoints of the **Store Rating Platform**.

---

## Base Configuration

- **Default Base URL**: `http://localhost:3001`
- **Content Type**: `application/json`
- **Authentication Header**: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
- **Description**: Registers a new customer account (`NORMAL_USER`).
- **Auth Required**: No (Public)
- **Role Required**: None
- **Request Body**:
  ```json
  {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "Password@1234",
    "address": "123 Main Street, City, State 12345"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 35,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "address": "123 Main Street, City, State 12345",
      "role": "NORMAL_USER"
    }
  }
  ```

---

### `POST /auth/login`
- **Description**: Authenticates user credentials and issues a JWT token.
- **Auth Required**: No (Public)
- **Role Required**: None
- **Request Body**:
  ```json
  {
    "email": "admin@demo.com",
    "password": "Admin@1234"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "System Administrator Account",
      "email": "admin@demo.com",
      "role": "SYSTEM_ADMIN"
    }
  }
  ```

---

### `POST /auth/change-password`
- **Description**: Updates the password of the currently authenticated user.
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`, `STORE_OWNER`, `NORMAL_USER`
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPassword@1234",
    "newPassword": "NewPassword@1234"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

---

## 2. Stores Endpoints (`/stores`)

### `GET /stores`
- **Description**: Retrieves a paginated directory of registered stores with average ratings and current user's rating.
- **Auth Required**: Yes
- **Query Parameters**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
  - `search` (optional, filters by store name, address, or email)
  - `sortBy` (optional: `name`, `email`, `address`, `createdAt`, `rating`)
  - `sortOrder` (optional: `ASC`, `DESC`)
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": 7,
        "name": "TechWorld Electronics Hub",
        "email": "contact@techworld.com",
        "address": "45 Tech Plaza, San Francisco, CA 94107",
        "ownerId": 26,
        "overallRating": "4.0",
        "totalRatings": 4,
        "userRating": { "id": 12, "rating": 5 }
      }
    ],
    "meta": { "total": 3, "page": 1, "limit": 10, "totalPages": 1 }
  }
  ```

---

### `GET /stores/:id`
- **Description**: Retrieves details for a specific store.
- **Auth Required**: Yes
- **Response `200 OK`**:
  ```json
  {
    "id": 7,
    "name": "TechWorld Electronics Hub",
    "email": "contact@techworld.com",
    "address": "45 Tech Plaza, San Francisco, CA 94107",
    "owner": { "id": 26, "name": "Robert Vance Store Owner One", "email": "owner1@demo.com" },
    "overallRating": "4.0",
    "totalRatings": 4
  }
  ```

---

### `POST /stores`
- **Description**: Registers a new platform store.
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`
- **Request Body**:
  ```json
  {
    "name": "Fresh Harvest Organics",
    "email": "contact@freshharvest.com",
    "address": "77 Market Way, Suite 10, Austin, TX 78701",
    "ownerId": 27
  }
  ```

---

### `PUT /stores/:id`
- **Description**: Updates store profile (Name, Email, Address).
- **Auth Required**: Yes
- **Role Required**: `STORE_OWNER` (must own store) or `SYSTEM_ADMIN`
- **Request Body**:
  ```json
  {
    "name": "TechWorld Electronics & Mobile Hub",
    "email": "support@techworld.com",
    "address": "45 Tech Plaza, Silicon Valley, CA 94107"
  }
  ```

---

### `PUT /stores/:id/owner`
- **Description**: Assigns or reassigns a store owner to a store.
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`
- **Request Body**:
  ```json
  {
    "ownerId": 27
  }
  ```

---

### `DELETE /stores/:id/owner`
- **Description**: Removes store owner assignment (sets `ownerId` to `null`).
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`

---

### `DELETE /stores/:id`
- **Description**: Deletes a store and its associated ratings safely.
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`

---

## 3. Ratings Endpoints (`/ratings`)

### `POST /ratings`
- **Description**: Submits a 1–5 star rating for a store.
- **Auth Required**: Yes
- **Role Required**: `NORMAL_USER`
- **Request Body**:
  ```json
  {
    "storeId": 7,
    "rating": 5
  }
  ```

---

### `PUT /ratings/:id`
- **Description**: Modifies an existing rating.
- **Auth Required**: Yes
- **Role Required**: `NORMAL_USER` (must own rating)
- **Request Body**:
  ```json
  {
    "rating": 4
  }
  ```

---

## 4. Store Owner Endpoints (`/owner`)

### `GET /owner/dashboard`
- **Description**: Retrieves dashboard data for stores assigned to the authenticated owner.
- **Auth Required**: Yes
- **Role Required**: `STORE_OWNER`
- **Response `200 OK`**:
  ```json
  {
    "stores": [
      { "id": 7, "name": "TechWorld Electronics Hub", "averageRating": "4.0", "totalRatings": 4 },
      { "id": 10, "name": "BookHaven International Bookstore", "averageRating": "4.3", "totalRatings": 3 }
    ],
    "storesCount": 2,
    "ratingUsers": { "data": [...], "meta": { "total": 7, "page": 1, "limit": 10 } }
  }
  ```

---

### `GET /owner/export-ratings`
- **Description**: Exports rating records for the owner's assigned stores filtered by date range.
- **Auth Required**: Yes
- **Role Required**: `STORE_OWNER`
- **Query Parameters**:
  - `fromDate` (optional ISO date `YYYY-MM-DD`)
  - `toDate` (optional ISO date `YYYY-MM-DD`)
  - `storeId` (optional store ID filter)

---

### `GET /owner/analytics`
- **Description**: Retrieves multi-store performance comparison metrics and month-to-month deltas.
- **Auth Required**: Yes
- **Role Required**: `STORE_OWNER`

---

## 5. System Admin Endpoints (`/admin`)

### `GET /admin/dashboard`
- **Description**: Retrieves platform-wide summary statistics (`totalUsers`, `totalStores`, `totalRatings`, `storeOwnersCount`, `averageRating`).
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`

---

### `GET /admin/users`
- **Description**: Retrieves paginated user directory with role filters and search.
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`

---

### `DELETE /admin/users/:id`
- **Description**: Deletes a user account cleanly.
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`

---

### `GET /admin/reports`
- **Description**: Retrieves platform analytics, rating score breakdown, score distribution, and top performing stores.
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`

---

### `GET /admin/logs`
- **Description**: Retrieves platform system audit log entries.
- **Auth Required**: Yes
- **Role Required**: `SYSTEM_ADMIN`
