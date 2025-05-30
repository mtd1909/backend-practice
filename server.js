const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./src/routes/user')
const authRoutes = require('./src/routes/auth')
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

const port = process.env.PORT || 8080
app.listen(port, function() {
  console.log(`App listening on port ${port}`);
})

