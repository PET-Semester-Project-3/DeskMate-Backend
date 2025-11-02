exports.shorthands = undefined

exports.up = (pgm) => {
  // Enable pgcrypto extension for UUID generation
  pgm.createExtension('pgcrypto', { ifNotExists: true })

  // Create users table
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  })

  // Create index on created_at for efficient ordering
  pgm.createIndex('users', 'created_at')
}

exports.down = (pgm) => {
  pgm.dropTable('users')
  pgm.dropExtension('pgcrypto', { ifExists: true })
}
