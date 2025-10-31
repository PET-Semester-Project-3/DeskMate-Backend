const notImplemented = (action) => (req, res) => {
  res.status(501).json({ message: `${action} handler not implemented yet.` })
}

module.exports = {
  getItems: notImplemented("GET /api/items"),
  createItem: notImplemented("POST /api/items"),
  updateItem: notImplemented("PUT /api/items/:id"),
  deleteItem: notImplemented("DELETE /api/items/:id"),
}
