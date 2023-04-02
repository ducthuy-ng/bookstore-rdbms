import { Book } from './src/core/Book';
const { Pool } = require('pg');
const client = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'postgres',
  port: 5432,
  db: 'postgres',
});

type BookCountInYear = { year: number; bookNum: number };

const getBookByIsbn = async (bookIsbn: string): Promise<Book | null> => {
  const query = 'CREATE INDEX isbn_name ON book(isbn)';
  const query2 = `SELECT * FROM book WHERE isbn = '${bookIsbn}'`;
  try {
    await client.query(query);
    const { rows } = await client.query(query2);

    if (rows.length === 0) {
      return null;
    }
    var ans: Book = {
      isbn: rows[0].isbn,
      name: rows[0].name,
      numOfPage: rows[0].numofpage,
      author: rows[0].authors,
      publishedYear: rows[0].published_year,
      coverUrl: rows[0].coverUrl,
      sellPrice: rows[0].sellPrice,
    };
    return ans;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const main = async () => {
  const start = Date.now();
  const rows = await getBookByIsbn('9786270541001');
  const timeTaken = Date.now() - start;
  console.log('Total time taken : ' + timeTaken + ' milliseconds');
  if (!rows) console.log(1);
  else console.log(rows);
};

main();
