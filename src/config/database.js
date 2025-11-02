const { Pool } = require("pg")

// Support both DATABASE_URL and individual environment variables
const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.POSTGRES_USER || "postgres",
      host: process.env.POSTGRES_HOST || "localhost",
      database: process.env.POSTGRES_DB || "deskmate",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      port: process.env.POSTGRES_PORT || 5432,
    }

const pool = new Pool(config)

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database")
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
  process.exit(-1)
})

module.exports = pool
