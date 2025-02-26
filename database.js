const mysql = require("mysql2")
const port = process.env.PORT || 8080
const hostname = process.env.HOST_NAME
require('dotenv').config()
const connection = mysql.createConnection({
  host: 'localhost',
  database: 'test_database',
  user: 'root',
  password: 'Mtd19092001@'
})

module.exports = connection;