//export knex postgres connection

import knex from 'knex';
const configs = require('../../knexfile');

const environment: string = process.env.NODE_ENV || 'development';

interface Config {
  [key: string]: knex.Knex.Config;
}

const Dev_Config: knex.Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

const Prod_Config: knex.Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

const Staging_Config: knex.Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

const config: Config = {
  development: Dev_Config,
  production: Prod_Config,
  staging: Staging_Config,
};

const db = knex(configs[environment]);
//const db = knex(config[environment]);

//test connection and print out the result
db.raw('select 1+1 as result')
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
  });

export default db;
