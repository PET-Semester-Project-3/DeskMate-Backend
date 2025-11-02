# Database Setup and Migrations

This project uses PostgreSQL with `node-pg-migrate` for database schema management.

## Initial Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your database credentials**

3. **Start the database with Docker:**
   ```bash
   docker-compose up -d db
   ```

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

## Migration Commands

- **Run pending migrations:**
  ```bash
  npm run migrate
  ```

- **Rollback last migration:**
  ```bash
  npm run migrate:down
  ```

- **Create a new migration:**
  ```bash
  npm run migrate:create your-migration-name
  ```

## Database Schema

### Users Table
- `id` (UUID) - Primary key, auto-generated
- `created_at` (TIMESTAMPTZ) - Timestamp with timezone, defaults to now()

## Connection Details

The application connects to PostgreSQL using environment variables:
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `POSTGRES_HOST` - Database host (default: localhost)
- `POSTGRES_PORT` - Database port (default: 5432)

For migrations, use the `DATABASE_URL` environment variable in the format:
```
postgresql://user:password@host:port/database
```

## PgAdmin (Optional)

Access PgAdmin at `http://localhost:5050` (or your configured `PGADMIN_EXPOSED_PORT`)
- Email: `admin@example.com`
- Password: `admin_pw`

## Development Workflow

1. Start database: `docker-compose up -d db`
2. Run migrations: `npm run migrate`
3. Start development server: `npm run dev`
