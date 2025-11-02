const router = require("express").Router()
const itemRouter = require("./item.routes")
const userRouter = require("./user.routes")

router.use("/items", itemRouter)
router.use("/users", userRouter)

module.exports = router
