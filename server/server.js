if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
};

const express = require('express');
const app = express();
const bcrpyt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');

const initializePassport = require('./middlewares/passport-config');
initializePassport(passport);

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

app.use('/user', userRoutes);

app.use('/products', productsRoutes);

app.use('/cart' , cartRoutes);

app.get('/', (req, res) => {
    res.render('../views/index.ejs')
})

app.listen(3000);