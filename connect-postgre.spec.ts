import { Book } from './src/core/Book';
const { Pool } = require('pg');
const client = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'postgres',
  port: 5432,
  db: 'postgres',
});

const getBookByIsbn = async (bookIbsn: string): Promise<Book | null> => {
  const query = `SELECT * FROM book WHERE isbn = '${bookIbsn}'`;
  try {
    await client.connect(); // creates connection
    const { rows } = await client.query(query); // sends query
    console.log(rows);
    client.end();
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error: any) {
    console.error(error.stack);
    return null;
  }
};

const main = async () => {
  const rows = await getBookByIsbn('9786270541001');
  if (!rows) console.log(1);
  else console.log(rows);
};
main();
