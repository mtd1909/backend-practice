const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./src/routes/user')
app.use('/users', userRoutes);

const port = process.env.PORT || 8080
app.listen(port, function() {
  console.log(`App listening on port ${port}`);
})

