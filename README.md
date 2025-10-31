# DeskMate Backend

## Overview

Simple Express server skeleton with items API routes ready for future PostgreSQL integration.

## Getting Started

```bash
npm install
npm run dev
```

The development script runs nodemon on `src/server.js` and reloads on file changes.

## Project Structure

```
src/
	app.js
	server.js
	routes/
		index.js
		item.routes.js
```

- `app.js` wires middleware and mounts API routers.
- `server.js` starts the HTTP server.
- `routes/index.js` aggregates API routers.
- `routes/item.routes.js` defines empty CRUD handlers.

## API Routes

`/api/items`

- `GET /` — List all items
- `POST /` — Create an item
- `PUT /:id` — Update an item by id
- `DELETE /:id` — Delete an item by id

