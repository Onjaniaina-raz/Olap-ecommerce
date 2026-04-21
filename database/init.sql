-- ============================================================
-- DIMENSIONS
-- ============================================================

-- Dimension Calendrier (pré-remplie par le seed)
CREATE TABLE IF NOT EXISTS dim_calendar (
    date_id       DATE PRIMARY KEY,
    day           INT,
    month         INT,
    quarter       INT,
    year          INT,
    week          INT,
    day_of_week   INT,
    is_weekend    BOOLEAN
);

-- Dimension Région
CREATE TABLE IF NOT EXISTS dim_regions (
    region_id   SERIAL PRIMARY KEY,
    city        VARCHAR(100),
    region      VARCHAR(100),
    country     VARCHAR(100)
);

-- Dimension Client
CREATE TABLE IF NOT EXISTS dim_customers (
    customer_id   SERIAL PRIMARY KEY,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    email         VARCHAR(150) UNIQUE,
    segment       VARCHAR(50),   -- 'New', 'Loyal', 'VIP'
    region_id     INT REFERENCES dim_regions(region_id),
    created_at    DATE
);

-- Dimension Produit
CREATE TABLE IF NOT EXISTS dim_products (
    product_id    SERIAL PRIMARY KEY,
    name          VARCHAR(150),
    category      VARCHAR(100),  -- 'Electronics', 'Clothing', etc.
    sub_category  VARCHAR(100),
    unit_price    NUMERIC(10,2),
    cost_price    NUMERIC(10,2)
);

-- ============================================================
-- TABLE DE FAITS
-- ============================================================

CREATE TABLE IF NOT EXISTS fact_orders (
    order_id      SERIAL PRIMARY KEY,
    date_id       DATE REFERENCES dim_calendar(date_id),
    customer_id   INT  REFERENCES dim_customers(customer_id),
    product_id    INT  REFERENCES dim_products(product_id),
    region_id     INT  REFERENCES dim_regions(region_id),

    -- Mesures
    quantity      INT,
    unit_price    NUMERIC(10,2),
    discount      NUMERIC(4,2),   -- ex: 0.10 = 10%
    revenue       NUMERIC(10,2),  -- quantity * unit_price * (1 - discount)
    cost          NUMERIC(10,2),  -- quantity * cost_price
    profit        NUMERIC(10,2),  -- revenue - cost

    status        VARCHAR(50)     -- 'completed', 'returned', 'cancelled'
);

-- ============================================================
-- INDEX (performance des requêtes OLAP)
-- ============================================================

CREATE INDEX idx_orders_date     ON fact_orders(date_id);
CREATE INDEX idx_orders_customer ON fact_orders(customer_id);
CREATE INDEX idx_orders_product  ON fact_orders(product_id);
CREATE INDEX idx_orders_region   ON fact_orders(region_id);
CREATE INDEX idx_orders_status   ON fact_orders(status);