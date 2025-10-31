const itemRouter = require("express").Router()


// Just simple CRUD endpoints left empty for now. We can change 'item' later.
itemRouter.get("/", async (req, res) => {

})
itemRouter.post("/", async (req, res) => {

})
itemRouter.put("/:id", async (req, res) => {

})
itemRouter.delete("/:id", async (req, res) => {

})

module.exports = itemRouter
