cube('Regions', {
  sql_table: 'dim_regions',

  measures: {
    count: {
      type: 'count',
    },
  },

  dimensions: {
    regionId: {
      sql: 'region_id',
      type: 'number',
      primary_key: true,
    },
    city: {
      sql: 'city',
      type: 'string',
      title: 'Ville',
    },
    region: {
      sql: 'region',
      type: 'string',
      title: 'Région',
    },
    country: {
      sql: 'country',
      type: 'string',
      title: 'Pays',
    },
  },
});