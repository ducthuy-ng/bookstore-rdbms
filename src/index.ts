import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import path from 'path';
import { IDatabase } from './core/IDatabase';

import { HBaseDB } from './infra/HBase';
import { PostgresSQL } from './infra/Postgres';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

let database: IDatabase;

app.use('/public', express.static(path.join(__dirname, '../public')));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));

app.get('/', (req: Request, res: Response) => {
  
  database
    .search('', 1)
    .then((searchResults) => {
      res.render('index', { data: searchResults });
    })
    .catch((err) => {
      console.error(err);
      res.render('error');
    });
});

app.get('/add', (req, res) => {
  res.render('book-add');
});

app.post('/add', (req, res) => {
  res.send(`Add book`);
});

// app.get('/:isbn', (req: Request<{ isbn: string }>, res) => {
//   const viewBookQuery: ViewBookDetailQuery = {
//     bookIsbn: req.params.isbn,
//   };

//   // const book = viewBookDetail(database, viewBookQuery);
//   const book: Book = {
//     isbn: '123',
//     name: 'ABC',
//     numOfPage: 0,
//     author: '',
//     publishedYear: 0,
//     coverUrl: '',
//     sellPrice: 0,
//   };
//   console.log('[server] book-detail');

//   res.render('book-detail', { book: book });
// });

app.delete('/:isbn', (req: Request<{ isbn: string }>, res) => {
  res.send(`Delete record ${req.params.isbn}`);
});

async function startServers() {
  if (process.env.DB_TYPE === 'hbase') {
    database = await HBaseDB.createInstance(process.env);
  } else if (process.env.DB_TYPE === 'postgres') {
    database = await PostgresSQL.createInstance(process.env);
  }

  app.listen(port, () => {
    console.log(`[server]: Server is running at port http://localhost:${port}`);
  });
}

startServers().catch((err) => {
  console.error(err);
});
