cube('Calendar', {
  sql_table: 'dim_calendar',

  measures: {
    count: {
      type: 'count',
    },
  },

  dimensions: {
    dateId: {
      sql: 'date_id',
      type: 'time',
      primary_key: true,
    },
    year: {
      sql: 'year',
      type: 'number',
      title: 'Année',
    },
    quarter: {
      sql: 'quarter',
      type: 'number',
      title: 'Trimestre',
    },
    month: {
      sql: 'month',
      type: 'number',
      title: 'Mois',
    },
    isWeekend: {
      sql: 'is_weekend',
      type: 'boolean',
      title: 'Week-end',
    },
  },
});