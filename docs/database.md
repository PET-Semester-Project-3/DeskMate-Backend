# Database Setup

This project uses Docker to run PostgreSQL and Prisma for database management.

## Docker Setup

### What's in docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine       # PostgreSQL 16
    container_name: deskmate-postgres
    ports:
      - '5432:5432'                 # Expose port 5432
    environment:
      POSTGRES_USER: postgres        # Username
      POSTGRES_PASSWORD: postgres    # Password
      POSTGRES_DB: deskmate_dev     # Database name
```

### Starting the Database

```bash
npm run docker:up
```

This starts PostgreSQL in the background. The database will:
- Run on `localhost:5432`
- Use credentials: `postgres/postgres`
- Create database: `deskmate_dev`

### Stopping the Database

```bash
npm run docker:down
```

This stops and removes the container. **Data persists** in a Docker volume.

### View Logs

```bash
npm run docker:logs
```

## Prisma Setup

### Schema Location

Database schema is in `prisma/schema.prisma`

### Connection String

In `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/deskmate_dev?schema=public"
```

Format: `postgresql://[user]:[password]@[host]:[port]/[database]?schema=public`

## Making Changes

### 1. Edit Schema

Edit `prisma/schema.prisma`:

```prisma
model NewModel {
  id         String   @id @default(uuid())
  name       String
  created_at DateTime @default(now())
}
```

### 2. Create Migration

```bash
npm run db:migrate
```

This will:
1. Prompt you for a migration name
2. Create SQL migration file in `prisma/migrations/`
3. Apply changes to database
4. Auto-generate Prisma Client types

### 3. Use in Code

Types are automatically available:

```typescript
import { prisma } from './db/prisma'

const item = await prisma.newModel.create({
  data: {
    name: 'Example'
  }
})
```

## Useful Commands

### Prisma Studio

Visual database browser:
```bash
npm run db:studio
```

Opens at `http://localhost:5555`

### Push Without Migration

For quick prototyping (skips migration files):
```bash
npm run db:push
```

### Reset Database

⚠️ **Deletes all data**:
```bash
docker-compose down -v
npm run docker:up
npm run db:migrate
```

## Troubleshooting

### "Can't connect to database"

1. Check if Docker is running: `docker ps`
2. Check if container is running: `docker ps | grep deskmate-postgres`
3. Restart: `npm run docker:down && npm run docker:up`

### "Port 5432 already in use"

Another PostgreSQL is running. Either:
- Stop it: `brew services stop postgresql`
- Change port in `docker-compose.yml` and `.env`

### "Prisma Client not found"

```bash
npm run db:generate
```

## Sharing Data with Your Team

**Important**: Data you add through the API is only in YOUR local database. Other team members won't see it.

To share demo/test data with your team:

1. Edit `prisma/seed.ts` and add the data you want everyone to have
2. Commit and push `prisma/seed.ts` to git
3. Team members pull and run: `npm run db:seed`

Now everyone has the same starting data in their local database.

## Production Notes

For production, use a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.) instead of Docker.

Update `.env`:
```
DATABASE_URL="postgresql://user:password@production-host:5432/prod_db?schema=public"
```

Then run:
```bash
npm run db:migrate:deploy
```
