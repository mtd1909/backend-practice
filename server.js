const express = require('express')
const mysql = require('mysql2')
const app = express()
const connection = require('./database')
const port = process.env.PORT || 8080
require('dotenv').config()
app.get('/', function (req, res) {
  const sql = "SELECT * FROM EMPLOYEES";
  connection.query(sql, function (err, results) {
    if (err) {
      return res.status(500).json({ error: err })
    }
    return res.status(200).json({ data: results })
  });
});
app.listen(port, function() {
  console.log(`App listening on port ${port}`);
  connection.connect(function(err) {
    if(err) throw err;
    console.log('Database connected')
  })
})