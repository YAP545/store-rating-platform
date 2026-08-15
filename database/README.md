# Database Setup & Documentation

This directory contains database documentation and reference SQL files for the **Store Rating Platform**.

## Database Overview
- **Database Engine**: MySQL 8.0+
- **ORM**: TypeORM
- **Database Name**: `store_rating_db`

## Relational Schema & Constraints
1. **`users` Table**:
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `name`: VARCHAR(60) (Validation: 20-60 characters)
   - `email`: VARCHAR(255) UNIQUE INDEX
   - `password`: VARCHAR(255) (Bcrypt hashed)
   - `address`: VARCHAR(400)
   - `role`: ENUM('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER')
   - **Indexes**: `email`, `name`, `address`, `role`

2. **`stores` Table**:
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `name`: VARCHAR(60)
   - `email`: VARCHAR(255)
   - `address`: VARCHAR(400)
   - `ownerId`: INT (FK -> `users.id`)
   - **Indexes**: `name`, `email`, `address`, `ownerId`

3. **`ratings` Table**:
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `userId`: INT (FK -> `users.id`)
   - `storeId`: INT (FK -> `stores.id`)
   - `rating`: INT (CHECK constraint: 1 to 5)
   - **Unique Constraint**: `UNIQUE(userId, storeId)` — guarantees a normal user can only submit one rating per store, but allows modification.
   - **Indexes**: `userId`, `storeId`

## Migration & Seed Commands
```bash
# Navigate to backend directory
cd backend

# Execute database migrations
npm run migration:run

# Execute database seed script
npm run seed
```
