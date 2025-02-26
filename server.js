const express = require('express')
// const mysql = require('mysql2')
const cors = require('cors')
const app = express()
// const connection = require('./database')
const connection = require('./database')
const connectToDatabase = require('./database')
const ping = require('./database')
const port = process.env.PORT || 8080
require('dotenv').config()

app.use(cors({ origin: 'http://localhost:3000' }));

// app.get('/employees', function (req, res) {
//   const sql = "SELECT * FROM EMPLOYEES";
//   connection.query(sql, function (err, results) {
//     if (err) {
//       return res.status(500).json({ error: err })
//     }
//     return res.status(200).json({ data: results })
//   });
// });

async function getEmployees(req, res) {
  try {
      const db = await connectToDatabase();
      const employees = await db.collection("employees").find().toArray();
      res.json(employees);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

app.get("/employees", getEmployees);

app.listen(port, function() {
  console.log(`App listening on port ${port}`);
//   connection.connect(function(err) {
//     if(err) throw err;
//     console.log('Database connected')
//   })
})

