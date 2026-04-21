const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Client } = require('pg');
const { faker } = require('@faker-js/faker');

console.log('--- TEST DES VARIABLES ---');
console.log('Utilisateur:', process.env.POSTGRES_USER); 
console.log('Password:', process.env.POSTGRES_PASSWORD);
console.log('--------------------------');

// ── Config ────────────────────────────────────────────────
const client = new Client({
  host:     'localhost',
  port:     process.env.POSTGRES_PORT || 5444,
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// ── Constantes ────────────────────────────────────────────
const START_DATE  = new Date('2023-01-01');
const END_DATE    = new Date('2024-12-31');
const N_CUSTOMERS = 500;
const N_PRODUCTS  = 80;
const N_ORDERS    = 20000;

const REGIONS = [
  { city: 'Paris',      region: 'Île-de-France', country: 'France' },
  { city: 'Lyon',       region: 'Auvergne-Rhône-Alpes', country: 'France' },
  { city: 'Marseille',  region: 'PACA',           country: 'France' },
  { city: 'Bordeaux',   region: 'Nouvelle-Aquitaine', country: 'France' },
  { city: 'Lille',      region: 'Hauts-de-France', country: 'France' },
  { city: 'Toulouse',   region: 'Occitanie',       country: 'France' },
];

const CATEGORIES = [
  { cat: 'Électronique',  subs: ['Smartphones', 'Laptops', 'Accessoires'] },
  { cat: 'Vêtements',     subs: ['Homme', 'Femme', 'Enfant'] },
  { cat: 'Maison',        subs: ['Cuisine', 'Décoration', 'Jardin'] },
  { cat: 'Sport',         subs: ['Running', 'Fitness', 'Outdoor'] },
];

const SEGMENTS  = ['New', 'Loyal', 'VIP'];
const STATUSES  = ['completed', 'completed', 'completed', 'returned', 'cancelled'];

// ── Helpers ───────────────────────────────────────────────
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function toDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── Génération du calendrier ──────────────────────────────
function generateCalendar(start, end) {
  const dates = [];
  const cur   = new Date(start);
  while (cur <= end) {
    const d = new Date(cur);
    dates.push({
      date_id:     toDateStr(d),
      day:         d.getDate(),
      month:       d.getMonth() + 1,
      quarter:     Math.ceil((d.getMonth() + 1) / 3),
      year:        d.getFullYear(),
      week:        getWeekNumber(d),
      day_of_week: d.getDay(),
      is_weekend:  d.getDay() === 0 || d.getDay() === 6,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// ── Main ──────────────────────────────────────────────────
async function seed() {
  await client.connect();
  console.log('✅ Connecté à PostgreSQL');

  // 1. Calendrier
  console.log('📅 Insertion du calendrier...');
  const calendar = generateCalendar(START_DATE, END_DATE);
  for (const row of calendar) {
    await client.query(
      `INSERT INTO dim_calendar VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      [row.date_id, row.day, row.month, row.quarter, row.year, row.week, row.day_of_week, row.is_weekend]
    );
  }
  console.log(`   → ${calendar.length} jours insérés`);

  // 2. Régions
  console.log('🗺️  Insertion des régions...');
  const regionIds = [];
  for (const r of REGIONS) {
    const res = await client.query(
      `INSERT INTO dim_regions (city, region, country) VALUES ($1,$2,$3) RETURNING region_id`,
      [r.city, r.region, r.country]
    );
    regionIds.push(res.rows[0].region_id);
  }
  console.log(`   → ${regionIds.length} régions insérées`);

  // 3. Clients
  console.log('👥 Insertion des clients...');
  const customerIds = [];
  for (let i = 0; i < N_CUSTOMERS; i++) {
    const regionId = regionIds[Math.floor(Math.random() * regionIds.length)];
    const segment  = SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)];
    const res = await client.query(
      `INSERT INTO dim_customers (first_name, last_name, email, segment, region_id, created_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING customer_id`,
      [
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        segment,
        regionId,
        toDateStr(randomDate(new Date('2022-01-01'), START_DATE)),
      ]
    );
    customerIds.push(res.rows[0].customer_id);
  }
  console.log(`   → ${customerIds.length} clients insérés`);

  // 4. Produits
  console.log('📦 Insertion des produits...');
  const products = [];
  for (let i = 0; i < N_PRODUCTS; i++) {
    const catObj     = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const sub        = catObj.subs[Math.floor(Math.random() * catObj.subs.length)];
    const unitPrice  = parseFloat(randomBetween(10, 800).toFixed(2));
    const costPrice  = parseFloat((unitPrice * randomBetween(0.4, 0.7)).toFixed(2));
    const res = await client.query(
      `INSERT INTO dim_products (name, category, sub_category, unit_price, cost_price)
       VALUES ($1,$2,$3,$4,$5) RETURNING product_id, unit_price, cost_price`,
      [faker.commerce.productName(), catObj.cat, sub, unitPrice, costPrice]
    );
    products.push(res.rows[0]);
  }
  console.log(`   → ${products.length} produits insérés`);

  // 5. Commandes
  console.log('🛒 Insertion des commandes...');
  for (let i = 0; i < N_ORDERS; i++) {
    const product    = products[Math.floor(Math.random() * products.length)];
    const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
    const regionId   = regionIds[Math.floor(Math.random() * regionIds.length)];
    const dateId     = toDateStr(randomDate(START_DATE, END_DATE));
    const quantity   = Math.floor(randomBetween(1, 6));
    const discount   = [0, 0, 0, 0.05, 0.10, 0.15, 0.20][Math.floor(Math.random() * 7)];
    const unitPrice  = parseFloat(product.unit_price);
    const costPrice  = parseFloat(product.cost_price);
    const revenue    = parseFloat((quantity * unitPrice * (1 - discount)).toFixed(2));
    const cost       = parseFloat((quantity * costPrice).toFixed(2));
    const profit     = parseFloat((revenue - cost).toFixed(2));
    const status     = STATUSES[Math.floor(Math.random() * STATUSES.length)];

    await client.query(
      `INSERT INTO fact_orders
         (date_id, customer_id, product_id, region_id, quantity, unit_price, discount, revenue, cost, profit, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [dateId, customerId, product.product_id, regionId, quantity, unitPrice, discount, revenue, cost, profit, status]
    );

    if ((i + 1) % 2000 === 0) console.log(`   → ${i + 1}/${N_ORDERS} commandes...`);
  }

  console.log('✅ Seed terminé avec succès !');
  await client.end();
}

seed().catch(err => {
  console.error('❌ Erreur seed :', err);
  process.exit(1);
});