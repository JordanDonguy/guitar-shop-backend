BEGIN;

-- Drop dependent tables first to avoid FK errors
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.shopping_cart CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.address CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.countries CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

------------------------------------------------
-- Users table
------------------------------------------------
CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(100),
    first_name character varying(100),
    last_name character varying(100),
    phone_number character varying(15),
    created_at timestamp with time zone DEFAULT now(),
    google_id character varying(255)
);

-- Create sequence for users.id
CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.users
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id),
    ADD CONSTRAINT "Users_email_key" UNIQUE (email),
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);

-- Link sequence ownership
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

-------------------------------------------------
-- Countries table
-------------------------------------------------
CREATE TABLE public.countries (
    code character(2) NOT NULL,
    name text NOT NULL
);

-- Constraints
ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (code);

-------------------------------------------------
-- Address table
-------------------------------------------------
CREATE TABLE public.address (
    id integer NOT NULL,
    user_id integer,
    street character varying(200) NOT NULL,
    city character varying(200) NOT NULL,
    state character varying(200) NOT NULL,
    postal_code character varying(10) NOT NULL,
    country character(2) NOT NULL
);

-- Create sequence for address.id
CREATE SEQUENCE IF NOT EXISTS public.address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.address ALTER COLUMN id SET DEFAULT nextval('public.address_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id),
    ADD CONSTRAINT address_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    ADD CONSTRAINT address_country_fkey FOREIGN KEY (country) REFERENCES public.countries(code);

-- Link sequence ownership
ALTER SEQUENCE public.address_id_seq OWNED BY public.address.id;
-------------------------------------------------
-- Brands table
-------------------------------------------------
CREATE TABLE public.brands (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);

-- Create sequence for brands.id
CREATE SEQUENCE IF NOT EXISTS public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);

-- Link sequence ownership
ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;

-------------------------------------------------
-- Categories table
-------------------------------------------------
CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);

-- Create sequence for categories.id
CREATE SEQUENCE IF NOT EXISTS public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

-- Link sequence ownership
ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;

-------------------------------------------------
-- Newsletter subscribers table
-------------------------------------------------
CREATE TABLE public.newsletter_subscribers (
    id integer NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

-- Create sequence for newsletter_subscribers.id
CREATE SEQUENCE IF NOT EXISTS public.newsletter_subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.newsletter_subscribers ALTER COLUMN id SET DEFAULT nextval('public.newsletter_subscribers_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id),
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);

--------------------------------------------------
-- Products table
--------------------------------------------------
CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    category_id integer,
    brand_id integer,
    image_url text,
    image_url2 text,
    video_url text,
    CONSTRAINT products_stock_check CHECK ((stock >= 0))
);

-- Create sequence for products.id
CREATE SEQUENCE IF NOT EXISTS public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id),
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


------------------------------------------------------
-- Shopping cart table
------------------------------------------------------
CREATE TABLE public.shopping_cart (
    id integer NOT NULL,
    user_id integer,
    created_at timestamp without time zone DEFAULT now()
);

-- Create sequence for shopping_cart.id
CREATE SEQUENCE IF NOT EXISTS public.shopping_cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.shopping_cart ALTER COLUMN id SET DEFAULT nextval('public.shopping_cart_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.shopping_cart
    ADD CONSTRAINT shopping_cart_pkey PRIMARY KEY (id),
    ADD CONSTRAINT shopping_cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    ADD CONSTRAINT unique_user_id UNIQUE (user_id);


------------------------------------------------------
-- Cart items table
------------------------------------------------------
CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer,
    product_id integer,
    quantity integer DEFAULT 1 NOT NULL,
    added_at timestamp without time zone DEFAULT now()
);

-- Create sequence for cart_items.id
CREATE SEQUENCE IF NOT EXISTS public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id),
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.shopping_cart(id) ON DELETE CASCADE,
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);

-------------------------------------------------------
-- Orders table
-------------------------------------------------------
CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    payment_method character varying(50) DEFAULT 'Credit Card'::character varying,
    shipping_address_id integer,
    total_price numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);

-- Create sequence for orders.id
CREATE SEQUENCE IF NOT EXISTS public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id),
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    ADD CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.address(id);


-------------------------------------------------------
-- Order items table
-------------------------------------------------------
CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED
);

-- Create sequence for order_items.id
CREATE SEQUENCE IF NOT EXISTS public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id),
    ADD CONSTRAINT unique_order_product UNIQUE (order_id, product_id),
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


-------------------------------------------------------
-- Password reset tokens table
-------------------------------------------------------
CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

-- Create sequence for password_reset_tokens.id
CREATE SEQUENCE IF NOT EXISTS public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Make id column use the sequence
ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);

-- Constraints
ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
    ADD CONSTRAINT password_reset_tokens_user_id_key UNIQUE (user_id),
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

COMMIT;
