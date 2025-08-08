const express = require("express");
const app = express();
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const connectToDatabase = require("./src/config/database");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { getDefaultUserData } = require('./src/models/user');
const socketHandler = require('./src/sockets/index')
const { Server } = require("socket.io"); 
const http = require('http');
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
// 	session({
// 		secret: process.env.SESSION_SECRET,
// 		resave: false,
// 		saveUninitialized: false,
// 		cookie: { secure: false },
// 	})
// );

// app.get('/', (req, res) => {
//   res.send('Hello from Express + Socket.IO!');
// })

// Initialize passport and session
app.use(passport.initialize());
// app.use(passport.session());

// Passport serialize user - lưu id vào session
// passport.serializeUser(function (user, done) {
// 	done(null, user);
// });

// // Passport deserialize user - lấy user từ session
// passport.deserializeUser(function (user, done) {
// 	done(null, user);
// });

// Google OAuth Strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "https://backend-practice-production-66bb.up.railway.app/auth/google/callback",
		},
		async (accessToken, refreshToken, profile, done) => {
			const db = await connectToDatabase();
			const users = db.collection("users");
			let user = await users.findOne({ googleId: profile.id });
			if (!user) {
        const overrides = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value || null,
          avatar: profile.photos?.[0]?.value || null,
          fullName: profile.displayName || null,
        };
        const newUser = getDefaultUserData(overrides);
				await users.insertOne(newUser);
        user = newUser;
			}
			const jwtToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
			user.jwtToken = jwtToken;
			return done(null, user);
		}
	)
);

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
app.get("/auth/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const token = req.user.jwtToken;
  if (!token) return res.status(500).json({ message: "No token generated" });
	res.redirect(`https://appchat-mtd.vercel.app?access_token=${token}`);
});

const userRoutes = require("./src/routes/user");
const authRoutes = require("./src/routes/auth");
const mediasRoutes = require("./src/routes/medias");
const messageRoutes = require("./src/routes/message");
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/medias", mediasRoutes);
app.use("/message", messageRoutes);

const port = process.env.PORT || 8080;

socketHandler(io);

server.listen(port, () => {
  console.log(`🚀 Server + Socket.IO running at http://localhost:${port}`);
});
