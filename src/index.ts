import express, { Request, Response } from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes"
import deskRoutes from "./routes/deskRoutes"
import scheduledTaskRoutes from "./routes/scheduledTaskRoutes"
import permissionRoutes from "./routes/permissionRoutes"
import controllerRoutes from "./routes/controllerRoutes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "DeskMate API - Ready" })
})

// API Routes
app.use("/api/users", userRoutes)
app.use("/api/desks", deskRoutes)
app.use("/api/scheduledTasks", scheduledTaskRoutes)
app.use("/api/permissions", permissionRoutes)
app.use("/api/controllers", controllerRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
