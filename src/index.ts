import express, { Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import userRoutes from "./routes/userRoutes"
import deskRoutes from "./routes/deskRoutes"
import scheduledTaskRoutes from "./routes/scheduledTaskRoutes"
import permissionRoutes from "./routes/permissionRoutes"
import controllerRoutes from "./routes/controllerRoutes"
import userDeskRoutes from "./routes/userDeskRoutes"
import userPermissionRoutes from "./routes/userPermissionRoutes"
import deskMateRoutes from "./routes/deskMateRoutes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"]

// Middleware
app.use(express.json())

// Cors
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  })
)

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "DeskMate API - Ready" })
})

// API Routes
app.use("/api/users", userRoutes)
app.use("/api/desks", deskRoutes)
app.use("/api/scheduled-tasks", scheduledTaskRoutes)
app.use("/api/permissions", permissionRoutes)
app.use("/api/controllers", controllerRoutes)
app.use("/api/user-desks", userDeskRoutes)
app.use("/api/user-permissions", userPermissionRoutes)
app.use("/api/deskmates", deskMateRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
