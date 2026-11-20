import "dotenv/config";
import express from "express";
import connectDB from "./db.js";
import healthRoutes from "./routes/health.js";
import lostRoutes from "./routes/lost.js";
import foundRoutes from "./routes/found.js";
import authRoutes from "./routes/auth.js"
import errorHandler from "./middleware/errorHandler.js";
import session from "express-session";
import { MongoStore } from "connect-mongo";

if (!process.env.SESSION_SECRET) {
  console.error("SESSION_SECRET is missing. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
app.use("/health", healthRoutes);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: process.env.MONGODB_URI}),
  cookie: {
    httpOnly: true, 
    sameSite:"lax",
    maxAge: 1000 * 60 * 60 * 24
  }
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(express.static("public"));
app.get("/", (req, res) => res.redirect("/lost"));
app.use("/lost", lostRoutes);
app.use("/found", foundRoutes);
app.use("/", authRoutes);

app.use(errorHandler);

try {
  await connectDB();
  app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
} catch (err) {
  console.error("Could not connect to MongoDB:", err.message);
  process.exit(1);
}
