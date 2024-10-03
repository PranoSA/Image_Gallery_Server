import type { Knex } from 'knex';

import path from 'path';
// Update with your config settings.

//the path to sqllite
//should be from the root of the project
const dbPath = path.join(__dirname, 'dev.sqlite3');

const config: { [key: string]: Knex.Config } = {
  /*development: {
    client: 'sqlite3',
    connection: {
      filename: dbPath, //'./dev.sqlite3',
    },
  },*/
  development: {
    client: 'postgresql',
    connection: {
      database: 'gis_images',
      user: 'gis_images_migrations',
      password: 'gis-images-migrations', //versus query
      host: 'localhost',
      port: 5432,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations_pg'),
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

module.exports = config;
