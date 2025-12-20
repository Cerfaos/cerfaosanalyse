const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '../tmp/db.sqlite3'))

// Check if weather column exists
const tableInfo = db.prepare('PRAGMA table_info(activities)').all()
console.log('Activities table columns:')
tableInfo.forEach((col) => {
  console.log(`  - ${col.name} (${col.type})`)
})

// Check weather data in activities
console.log('\nActivities with weather data:')
const activities = db
  .prepare('SELECT id, date, weather FROM activities ORDER BY id DESC LIMIT 5')
  .all()
activities.forEach((activity) => {
  console.log(`\nActivity ID: ${activity.id}`)
  console.log(`Date: ${activity.date}`)
  console.log(`Weather: ${activity.weather ? activity.weather.substring(0, 100) + '...' : 'NULL'}`)
})

db.close()
