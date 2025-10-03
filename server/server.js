// ------------------
// Imports & Setup
// ------------------
const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const csurf = require("csurf");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./db/index");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
require("dotenv").config();

// ------------------
// Routes Imports
// ------------------
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user.routes.js");
const productsRoutes = require("./routes/product.routes.js");
const cartRoutes = require("./routes/cart.routes.js");
const checkoutRoutes = require("./routes/checkout.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const countryRoutes = require("./routes/country.routes.js");
const newsletterRoutes = require("./routes/newsletter.routes.js");
const contactRoutes = require("./routes/contact.routes.js");
const brandRoutes = require("./routes/brand.routes");

// ------------------
// Passport Initialization
// ------------------
const initializePassport = require("./middlewares/passport-config");
initializePassport(passport);

// ------------------
// Security Middleware
// ------------------
app.set("trust proxy", 1); // Needed if behind a proxy (Heroku, etc.)
app.use(helmet()); // Set secure HTTP headers

// ------------------
// Rate Limiting
// ------------------
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use("/auth", authLimiter);

// ------------------
// CORS & Body Parsing
// ------------------
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());

// ------------------
// Session Setup
// ------------------
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
      sameSite: process.env.COOKIE_SAMESITE || "lax",
      secure: process.env.COOKIE_SECURE === "true", // True in production
      httpOnly: true,
    },
  })
);

// ------------------
// Passport Middleware
// ------------------
app.use(passport.initialize());
app.use(passport.session());

// ------------------
// CSRF Protection
// ------------------
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

// ------------------
// Routes Setup
// ------------------
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/orders", orderRoutes);
app.use("/countries", countryRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/contact", contactRoutes);
app.use("/brands", brandRoutes);

// ------------------
// Server Listener / Health Check
// ------------------
app.get("/", (req, res) => {
  res.send("Guitar Shop Backend is running.");
});

// ------------------
// Swagger / OpenAPI
// ------------------
const swaggerDocument = YAML.load("./openapi.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ------------------
// Error Handling
// ------------------
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// ------------------
// Server Listener
// ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
