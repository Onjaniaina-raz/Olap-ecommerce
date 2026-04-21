cube('Products', {
  sql_table: 'dim_products',

  measures: {
    count: {
      type: 'count',
    },
  },

  dimensions: {
    productId: {
      sql: 'product_id',
      type: 'number',
      primary_key: true,
    },
    name: {
      sql: 'name',
      type: 'string',
      title: 'Produit',
    },
    category: {
      sql: 'category',
      type: 'string',
      title: 'Catégorie',
    },
    subCategory: {
      sql: 'sub_category',
      type: 'string',
      title: 'Sous-catégorie',
    },
    unitPrice: {
      sql: 'unit_price',
      type: 'number',
      title: 'Prix unitaire',
    },
  },
});