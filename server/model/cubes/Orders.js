cube('Orders', {
  sql_table: 'fact_orders',

  joins: {
    Products: {
      sql: `${Orders}.product_id = ${Products}.product_id`,
      relationship: 'many_to_one',
    },
    Customers: {
      sql: `${Orders}.customer_id = ${Customers}.customer_id`,
      relationship: 'many_to_one',
    },
    Regions: {
      sql: `${Orders}.region_id = ${Regions}.region_id`,
      relationship: 'many_to_one',
    },
    Calendar: {
      sql: `${Orders}.date_id = ${Calendar}.date_id`,
      relationship: 'many_to_one',
    },
  },

  measures: {
    count: {
      type: 'count',
      title: 'Nombre de commandes',
    },
    totalRevenue: {
      sql: 'revenue',
      type: 'sum',
      title: 'Chiffre d\'affaires',
      format: 'currency',
    },
    totalProfit: {
      sql: 'profit',
      type: 'sum',
      title: 'Profit total',
      format: 'currency',
    },
    totalCost: {
      sql: 'cost',
      type: 'sum',
      title: 'Coût total',
      format: 'currency',
    },
    avgOrderValue: {
      sql: 'revenue',
      type: 'avg',
      title: 'Panier moyen',
      format: 'currency',
    },
    profitMargin: {
      sql: `ROUND(SUM(${Orders}.profit) / NULLIF(SUM(${Orders}.revenue), 0) * 100, 2)`,
      type: 'number',
      title: 'Marge (%)',
    },
    returnRate: {
      sql: `ROUND(
        COUNT(CASE WHEN ${Orders}.status = 'returned' THEN 1 END)::numeric
        / NULLIF(COUNT(*), 0) * 100, 2)`,
      type: 'number',
      title: 'Taux de retour (%)',
    },
  },

  dimensions: {
    orderId: {
      sql: 'order_id',
      type: 'number',
      primary_key: true,
    },
    status: {
      sql: 'status',
      type: 'string',
      title: 'Statut',
    },
    orderDate: {
      sql: 'date_id',
      type: 'time',
      title: 'Date de commande',
    },
  },

  // pre_aggregations: {
  //   // Pré-agrégation mensuelle — charge instantanée sur le dashboard
  //   monthlyRevenue: {
  //     measures: [totalRevenue, totalProfit, count],
  //     time_dimension: orderDate,
  //     granularity: 'month',
  //   },
  //   // Par statut
  //   byStatus: {
  //     measures: [count, totalRevenue],
  //     dimensions: [status],
  //     time_dimension: orderDate,
  //     granularity: 'month',
  //   },
  // },
});