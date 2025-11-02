const userRouter = require("express").Router()
const { getUsers, getUserById } = require("../controllers/user.controller")

userRouter.get("/", getUsers)
userRouter.get("/:id", getUserById)

module.exports = userRouter
