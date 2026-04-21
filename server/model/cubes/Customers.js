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
    firstName: {
      sql: 'first_name',
      type: 'string',
    },
    lastName: {
      sql: 'last_name',
      type: 'string',
    },
    segment: {
      sql: 'segment',
      type: 'string',
      title: 'Segment client',
    },
  },
});