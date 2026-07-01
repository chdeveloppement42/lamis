const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    connectionString: 'postgresql://postgres:0000@localhost:5432/postgres?schema=public'
  });
  
  try {
    await client.connect();
    console.log('Connected to default postgres database.');
    
    // Check if database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'immo_lamis'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE immo_lamis');
      console.log('Database immo_lamis created.');
    } else {
      console.log('Database immo_lamis already exists.');
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
}

createDb();
