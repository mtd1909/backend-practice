const express = require('express')
const app = express()

const user = require('./routes/user')
app.use('/users', user);

const port = process.env.PORT || 8080
app.listen(port, function() {
  console.log(`App listening on port ${port}`);
})

