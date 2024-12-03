// src/infrastructure/config/PostgresDB.ts
import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({
 user: config.postgres.user,
 host: config.postgres.host,
 database: config.postgres.database,
 password: config.postgres.password,
 port: config.postgres.port,
});

export async function initDB() {
  try {
    console.log('Inicializando base de datos...');
    const client = await pool.connect();

    await client.query(`
      DROP TABLE IF EXISTS comments CASCADE;
      
      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        publication_id VARCHAR(24) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_comments_publication_id ON comments(publication_id);
    `);

    console.log('Base de datos inicializada correctamente');
    client.release();
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    throw error;
  }
}