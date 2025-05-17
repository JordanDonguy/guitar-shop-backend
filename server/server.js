if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const csurf = require("csurf");
const pgSession = require("connect-pg-simple")(session);
const pool = require("../db/index");

const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productsRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");
const ordersRoutes = require("./routes/orders");

// Initialize passport
const initializePassport = require("./middlewares/passport-config");
initializePassport(passport);

// Express setup
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
};

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "session",
      errorLog: console.error,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(helmet());
app.use(csurf());
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next(err);
});
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use("/auth", authLimiter);

// Routes setup
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/orders", ordersRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
