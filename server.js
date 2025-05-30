const express = require('express')
const app = express()
const cors = require('cors')
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const connectToDatabase = require("./src/config/database"); 
require('dotenv').config();

app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Passport serialize user - lưu id vào session
passport.serializeUser(function(user, done) {
  done(null, user);
});

// Passport deserialize user - lấy user từ session
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://backend-practice-production-66bb.up.railway.app/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    const db = await connectToDatabase();
  const users = db.collection("users");

  // Tìm user theo googleId
  let user = await users.findOne({ googleId: profile.id });

  if (!user) {
    // Tạo user mới
    user = {
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
    };
    await users.insertOne(user);
  }
  return done(null, profile);
}));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

const userRoutes = require('./src/routes/user')
const authRoutes = require('./src/routes/auth')
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

const port = process.env.PORT || 8080
app.listen(port, function() {
  console.log(`App listening on port ${port}`);
})

