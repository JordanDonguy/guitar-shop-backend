# 🎸 Guitar Shop Backend

This is the backend for the **Guitar Shop** e-commerce application. Built with **Node.js**, **Express**, and **PostgreSQL** (hosted on Supabase), it handles product management, user authentication, cart logic, and order checkout.

> ⚠️ The backend only allows requests from CLIENT_ORIGIN. Make sure your frontend uses that URL in .env when running locally.

---

## 🚀 Live API

🔗 [API Documentation (Swagger / OpenAPI)](https://api.guitar-shop.store/api-docs)

> ⚠️ Note: API endpoints cannot be tested directly from the browser due to cross-origin restrictions. Use your frontend or a tool like Postman to make requests.


---

## 💻 Frontend repo
🔗 [https://github.com/JordanDonguy/guitar-shop-frontend](https://github.com/JordanDonguy/guitar-shop-frontend)


---

## ✨ Features

- ```📦 Product Management```  
  _&emsp;→ Fetch individual or multiple products from the database._
- ```🧾 Checkout System```  
  _&emsp;→ Create and store orders based on cart contents and user information._
- ```🛒 Cart Handling```  
  _&emsp;→ Add, remove, and update items in a user's cart._
- ```🔐 Session-Based Authentication```  
  _&emsp;→ User login, logout, and persistent sessions via secure HTTP-only cookies._
- ```🔐 Google OAuth 2.0 Authentication```  
  _&emsp;→ Login using Google accounts with secure token handling (via Passport.js or custom implementation)._
- ```🔒 Password Reset via Email```  
  _&emsp;→ Users can request a password reset link sent by email with a secure, time-limited token._
- ```📰 Newsletter Subscription```  
  _&emsp;→ Visitors can subscribe to newsletters via Nodemailer; handles input validation and confirmation emails._
- ```🛡️ CSRF Protection```  
  _&emsp;→ All sensitive POST requests include CSRF tokens for cross-site request forgery protection._
- ```✅ Input Validation```  
  _&emsp;→ All user inputs are validated and sanitized using express-validator._
- ```🌐 CORS Configuration```  
  _&emsp;→ Strict Cross-Origin Resource Sharing to only allow requests from the frontend domain._

---

## 🛠️ Tech Stack


- ```Node.js``` – Runtime environment  
- ```Express``` – Web framework  
- ```PostgreSQL``` – Relational database (via Supabase)  
- ```express-session``` – Session management  
- ```Passport.js``` – Authentication middleware (session-based)  
- ```google-passport-oauth2.0``` – Google OAuth 2.0 strategy for Passport.js  
- ```nodemailer``` – Sending transactional emails (password reset, newsletter, etc.)  
- ```cors``` – Controlled cross-origin access between front and back ends  
- ```helmet``` – Sets secure HTTP headers for protection  
- ```bcrypt``` – Password hashing  
- ```csurf``` – CSRF protection  
- ```express-validator``` – Input sanitization and validation  
- ```Prettier``` – Code formatter for consistent styling  
- ```ESLint``` – Linting tool to catch bugs and enforce code quality  
- ```Northflank``` – Backend hosting platform  
- ```Supabase``` – Hosting for the PostgreSQL DB
- ```Cloudflare``` – DNS management, CDN caching, SSL, and security 

---

## 📁 Project Structure

<pre lang="md">
guitar-shop-backend/
├── server
| |── data/                  # Db create tables and seeding scripts
| ├── db/                    # Pool connection config to db
│ ├── middleware/            # Passport setup, checkAuth and express-validator
| |── models/                # SQL queries and database helpers
│ ├── routes/                # Express route definitions
│ ├── utils/                 # Helper functions
│ └── server.js
├── .env                     # Environment variables (not tracked)
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.mjs
├── openapi.yaml
├── package.json
└── README.md                # This file
</pre>

## 🧪 API Endpoints

### 🛍️ Products

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| GET    | `/products`     | Get all products       |
| GET    | `/products/:id` | Get a specific product |

### 👤 Users

| Method | Endpoint    | Description                     |
| ------ | ----------- | ------------------------------- |
| GET    | `/user`     | Get currently logged-in user    |
| PATCH  | `/user/:id` | Update user info (address etc.) |

### 🛒 Cart

| Method | Endpoint               | Description                |
| ------ | ---------------------- | -------------------------- |
| GET    | `/cart`                | Get user's cart            |
| POST   | `/cart/add`            | Add product to cart        |
| POST   | `/cart/updateQuantity` | Update quantity of an item |
| DELETE | `/cart/:id`            | Remove item from cart      |

### 🧾 Orders

| Method | Endpoint        | Description                       |
| ------ | --------------- | --------------------------------- |
| POST   | `/checkout`     | Submit an order with cart info    |
| GET    | `/orders`       | Get all orders for current user   |
| GET    | `/orders/items` | Get detailed items for each order |

### 🔐 Authentication

| Method | Endpoint                       | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| POST   | `/auth/register`               | Register a new user               |
| GET    | `/auth/register`               | Get list of countries (for form)  |
| POST   | `/auth/login`                  | Log in a user                     |
| POST   | `/auth/logout`                 | Log out the current session       |
| GET    | `/auth/google`                 | Initiate Google OAuth2.0 login    |
| GET    | `/auth/google/callback`        | Google OAuth2.0 callback URL      |
| POST   | `/auth/reset-password/request` | Request a password reset email    |
| POST   | `/auth/reset-password/confirm` | Confirm password reset with token |

### ✉️ Newsletter

| Method | Endpoint                        | Description                       |
| ------ | ------------------------------- | --------------------------------- |
| POST   | `/newsletter/subscribe`         | Subscribe to the newsletter       |
| GET    | `/newsletter/unsubscribe/:token`| Unsubscribe from the newsletter   |

### 🛡️ CSRF

| Method | Endpoint      | Description                               |
| ------ | ------------- | ----------------------------------------- |
| GET    | `/csrf-token` | Fetch CSRF token for secure POST requests |

## 🧷 CSRF Protection

All forms or API calls from the frontend must include a CSRF token.


# 🧑‍💻 Local Setup

Follow these steps to get the project running locally:

1. **Clone the repository**

```bash
git clone https://github.com/your-username/guitar-shop-backend.git
cd guitar-shop-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

* Open `.env` and replace the placeholder values with your local settings.

4. **Initialize the database**

```bash
npm run db:init
```

5. **Seed the database**

```bash
npm run db:seed
```

6. **Start the development server**

```bash
npm run dev
```

The backend should now be running at `http://localhost:3000`.  
If you need the frontend, you can get the repo [here](https://github.com/JordanDonguy/guitar-shop-frontend).


## 📄 License

This project is for educational and portfolio purposes only.
Please do not reuse or redistribute the code without permission.

## 👤 Author

Developed by Jordan Donguy
