import knex, { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Knex | null = null;

  // Método para obtener la instancia única
  public static getInstance(): Knex {
    if (!Database.instance) {
      Database.instance = knex({
        client: 'mysql2',
        connection: {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        },
      });

      // Verificación y creación de la tabla 'users' si no existe
      Database.instance.schema.hasTable('users').then((exists) => {
        if (!exists) {
          return Database.instance?.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('uuid').notNullable().unique();
            table.string('Nombre').notNullable();
            table.string('Apellido').notNullable();
            table.string('Correo').notNullable().unique();
            table.string('contraseña').notNullable();
            table.string('Foto_perfil');
            table.string('telefono'); // Nuevo campo
            table.boolean('isActive').defaultTo(true);
          }).then(() => console.log('Tabla "users" creada.'))
            .catch((error) => console.error('Error al crear la tabla "users":', error));
        } else {
          console.log('La tabla "users" ya existe.');
        }
      }).catch((error) => console.error('Error al verificar la tabla "users":', error));
    }

    return Database.instance;
  }

  // Método para cerrar la conexión
  public static async closeConnection() {
    if (Database.instance) {
      await Database.instance.destroy();
      Database.instance = null;
    }
  }
}

export { Database };
