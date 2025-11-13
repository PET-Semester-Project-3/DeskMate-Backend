# DeskMate Backend

TypeScript backend for DeskMate desk management system.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   ```

3. **Start database**
   ```bash
   npm run docker:up
   ```

4. **Run migrations**
   ```bash
   npm run db:migrate
   ```
   Name it "init" when prompted.

5. **Seed demo data (optional)**
   ```bash
   npm run db:seed
   ```
   This adds demo users that everyone on your team will have.

6. **Start the server**
   ```bash
   npm run dev
   ```

API runs at `http://localhost:3000`

## Commands

### Development
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm start` - Run production build

### Database
- `npm run db:migrate` - Create and apply migration
- `npm run db:generate` - Generate Prisma types
- `npm run db:studio` - Open database GUI

### Docker
- `npm run docker:up` - Start database
- `npm run docker:down` - Stop database
- `npm run docker:logs` - View database logs

## API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (body: `{email, password}`)
- `PUT /api/users/:id` - Update user (body: `{email?, password?}`)
- `DELETE /api/users/:id` - Delete user

## Changing the Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Prisma Client types auto-update

## Project Structure

```
src/
├── controllers/    # Business logic
├── routes/         # API routes
├── db/             # Database client
└── index.ts        # App entry point
```
