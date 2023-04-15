import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import hbs from 'hbs';
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
app.set('views', path.join(__dirname, '/views'));

hbs.registerPartials(path.join(__dirname + '/views/partials'));

app.get('/', (req: Request, res: Response) => {
  database
    .search('', 10, 0)
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

app.get('/:isbn', (req: Request<{ isbn: string }>, res) => {
  database
    .getBookByIsbn(req.params.isbn)
    .then((book) => {
      res.render('book-detail', { book: book });
    })
    .catch(() => {
      res.sendStatus(500);
    });

  // const book: Book = {
  //   isbn: '123',
  //   name: 'ABC',
  //   numOfPage: 0,
  //   author: '',
  //   publishedYear: 0,
  //   coverUrl: 'public/images/missing_book_cover.jpeg',
  //   sellPrice: 0,
  // };
});

app.delete('/:isbn', (req: Request<{ isbn: string }>, res) => {
  res.send(`Delete record ${req.params.isbn}`);
});

async function startServers() {
  switch (process.env.DB_TYPE) {
    case 'hbase':
      database = await HBaseDB.createInstance(process.env);
      break;
    case 'postgres':
      database = await PostgresSQL.createInstance(process.env);
      break;
    default:
      throw new Error('Invalid config. `DB_TYPE` must be `hbase` or `postgres`');
  }

  app.listen(port, () => {
    console.log(`[server]: Server is running at port http://localhost:${port}`);
  });
}

startServers().catch((err) => {
  console.error(err);
});
