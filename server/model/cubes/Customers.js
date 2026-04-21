cube('Customers', {
  sql_table: 'dim_customers',

  measures: {
    count: {
      type: 'count',
      title: 'Nombre de clients',
    },
  },

  dimensions: {
    customerId: {
      sql: 'customer_id',
      type: 'number',
      primary_key: true,
    },
    name: {
      sql: `CONCAT(first_name, ' ', last_name)`,
      type: 'string',
      title: 'Nom complet',
    },
    segment: {
      sql: 'segment',
      type: 'string',
      title: 'Segment client',
    },
  },
});