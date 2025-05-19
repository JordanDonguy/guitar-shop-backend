# 🎸 Guitar Shop Backend

This is the backend for the **Guitar Shop** e-commerce application. Built with **Node.js**, **Express**, and **PostgreSQL** (hosted on Supabase), it handles product management, user authentication, cart logic, and order checkout.

> ⚠️ This backend is configured to only accept requests from the deployed frontend:  
[https://guitar-shop-frontend.netlify.app](https://guitar-shop-frontend.netlify.app)

---

## 🚀 Live API

🔗 [https://guitar-shop-backend.onrender.com](https://guitar-shop-backend.onrender.com)

---

## ✨ Features

- 📦 **Product Management** — Fetch individual or multiple products
- 🧾 **Checkout System** — Create orders with cart contents and user info
- 🛒 **Cart Handling** — Add/remove/update cart items
- 🔐 **Session-Based Auth** — Login, logout, and persistent sessions via cookies
- 🛡️ **CSRF Protection** — All POST requests are protected with CSRF tokens
- ✅ **Input Validation** — Secure and validated inputs with `express-validator`
- 🌐 **CORS Config** — Only allows frontend domain access

---

## 🛠️ Tech Stack

- **Node.js** – Runtime environment
- **Express** – Web framework
- **PostgreSQL** – Relational database (via Supabase)
- **express-session** – Session management
- **Passport.js** – Authentication middleware (session-based)
- **cors** – Controlled cross-origin access between front and back ends
- **helmet** – Sets secure HTTP headers for protection
- **bcrypt** – Password hashing
- **csurf** – CSRF protection
- **express-validator** – Input sanitization and validation
- **Render** – Backend hosting platform
- **Supabase** – Hosting for the PostgreSQL DB

---

## 📁 Project Structure

<pre lang="md">
guitar-shop-backend/
├── controllers/            # Route handler logic (auth, cart, orders, products)
├── middleware/             # CSRF setup and CORS settings
├── models/                 # SQL queries and database helpers
├── routes/                 # Express route definitions
├── validators/             # express-validator middleware
├── .env                    # Environment variables (not tracked)
├── .gitignore
├── package.json
├── server.js               # App entry point
└── README.md               # This file
</pre>


## 🧪 API Endpoints

### 🛍️ Products
| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| GET    | `/products`          | Get all products          |
| GET    | `/products/:id`      | Get a specific product    |

### 👤 Users
| Method | Endpoint         | Description                      |
|--------|------------------|----------------------------------|
| GET    | `/user`          | Get currently logged-in user    |
| PATCH  | `/user/:id`      | Update user info (address etc.) |

### 🛒 Cart
| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | `/cart`                    | Get user's cart                    |
| POST   | `/cart/add`                | Add product to cart                |
| POST   | `/cart/updateQuantity`     | Update quantity of an item         |
| DELETE | `/cart/:id`                | Remove item from cart              |

### 🧾 Orders
| Method | Endpoint           | Description                       |
|--------|--------------------|-----------------------------------|
| POST   | `/checkout`        | Submit an order with cart info    |
| GET    | `/orders`          | Get all orders for current user   |
| GET    | `/orders/items`    | Get detailed items for each order |

### 🔐 Authentication
| Method | Endpoint            | Description                         |
|--------|---------------------|-------------------------------------|
| POST   | `/auth/register`    | Register a new user                 |
| GET    | `/auth/register`    | Get list of countries (for form)    |
| POST   | `/auth/login`       | Log in a user                       |
| POST   | `/auth/logout`      | Log out the current session         |

### 🛡️ CSRF
| Method | Endpoint           | Description                    |
|--------|--------------------|--------------------------------|
| GET    | `/csrf-token`      | Fetch CSRF token for secure POST requests |

  
Most POST routes require a CSRF token via the csrf-token header.
  
## 🧷 CSRF Protection
All forms or API calls from the frontend must include a CSRF token.
You can fetch it from:

## 📄 License
This project is for educational and portfolio purposes only.
Please do not reuse or redistribute the code without permission.

## 👤 Author
Developed by Jordan Donguy
