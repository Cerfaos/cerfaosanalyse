import Database from 'better-sqlite3'
const db = new Database('tmp/db.sqlite3')

try {
  const users = db.prepare('SELECT id, email, password FROM users').all()
  console.log('Users found:', users.length)
  users.forEach((user) => {
    console.log(
      `ID: ${user.id}, Email: ${user.email}, Password Hash: ${user.password.substring(0, 20)}...`
    )
  })
} catch (error) {
  console.error('Error reading users:', error.message)
}
