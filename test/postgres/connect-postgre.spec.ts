const { Pool } = require('pg');
const client = new Pool({
  user: 'postgres',
  host: '0.0.0.0',
  password: 'postgres',
  port: 5432,
  db: 'postgres',
});

const printDatabasesSizes = async () => {
  const query = `
      SELECT * FROM book LIMIT 10
  `;
  try {
    await client.connect(); // creates connection
    const { rows } = await client.query(query); // sends query
    console.table(rows);
  } catch (error: any) {
    console.error(error.stack);
    return false;
  } finally {
    await client.end(); // closes connection
  }
};

printDatabasesSizes();
