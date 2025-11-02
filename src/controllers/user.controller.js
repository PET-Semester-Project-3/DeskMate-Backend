const pool = require("../config/database")

const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC")
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    })
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    })
  }
}

module.exports = {
  getUsers,
  getUserById,
}
