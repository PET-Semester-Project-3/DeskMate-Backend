exports.shorthands = undefined

exports.up = (pgm) => {
  // Insert some sample users
  pgm.sql(`
    INSERT INTO users (id, created_at) VALUES
    (gen_random_uuid(), NOW()),
    (gen_random_uuid(), NOW()),
    (gen_random_uuid(), NOW())
  `)
}

exports.down = (pgm) => {
  // Delete all users (careful - this removes ALL users!)
  // In production, you'd want to be more specific about which users to delete
  pgm.sql('TRUNCATE TABLE users')
}
