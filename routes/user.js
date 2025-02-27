const express = require('express');
const user = express.Router();
const cors = require('cors')

const connectToDatabase = require('../database')
require('dotenv').config()

user.get("/", async (req, res) => {
  try {
      const db = await connectToDatabase();
      const employees = await db.collection("employees").find().toArray();
      res.json(employees);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

user.post("/employees", async (req, res) => {
  try {
      const db = await connectToDatabase();
      const newEmployee = req.body;
      const result = await db.collection("employees").insertOne(newEmployee);
      res.status(201).json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = user;