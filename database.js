require('dotenv').config();
// const mysql = require("mysql2")
// const port = process.env.PORT || 8080
// const hostname = process.env.HOST_NAME
// const connection = mysql.createConnection({
//   host: 'localhost',
//   database: 'test_database',
//   user: 'root',
//   password: 'Mtd19092001@'
// })

// module.exports = connection;

const { MongoClient } = require("mongodb");
require('dotenv').config();

let _db = null;

async function connectToDatabase() {
    if (!_db) {
        const connectionString = process.env.DB_URL;
        const dbName = process.env.DB_NAME;

        const client = new MongoClient(connectionString); // Không cần truyền thêm options
        await client.connect();
        _db = client.db(dbName);
    }
    return _db;
}

async function ping() {
    const db = await connectToDatabase();
    await db.command({ ping: 1 });
    console.log('Pinged the database');
}

ping();

module.exports = connectToDatabase;
module.exports.ping = ping;