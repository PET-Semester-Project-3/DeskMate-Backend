const router = require("express").Router()
const itemRouter = require("./item.routes")

router.use("/items", itemRouter)

module.exports = router
