const express = require('express')
const app = express()

app.use(cors({ origin: 'http://localhost:3000' }));

const user = require('./routes/user')
app.use('/users', user);

const port = process.env.PORT || 8080
app.listen(port, function() {
  console.log(`App listening on port ${port}`);
})

