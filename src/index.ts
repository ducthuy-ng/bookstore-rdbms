import bodyParser from 'body-parser';
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

hbs.registerPartials(path.join(__dirname + '/views/partials'));

app.get('/', (req: Request, res: Response) => {
  const queryBookName = req.query['book-name'] || '';

  database
    .search(String(queryBookName), 10, 0)
    .then((searchResults) => {
      res.render('index', { data: searchResults, queryBookName: queryBookName });
    })
    .catch((err) => {
      console.error(err);
      res.render('error');
    });
});

app.get('/add', (req, res) => {
  res.render('book-add');
});

app.post(
  '/add',
  (
    req: Request<
      unknown,
      unknown,
      {
        ISBN: string;
        title: string;
        author: string;
        file: string;
        page_num: string;
        year: string;
        price: string;
      }
    >,
    res
  ) => {
    database
      .addNewBook({
        isbn: String(req.body.ISBN || ''),
        name: String(req.body.title || ''),
        numOfPage: parseInt(req.body.page_num) || 0,
        author: String(req.body.author || ''),
        publishedYear: parseInt(req.body.year) || new Date().getFullYear(),
        coverUrl: String(req.body.file || ''),
        sellPrice: parseInt(req.body.price),
      })
      .then(() => {
        res.render('book-add', { displaySuccess: true });
      })
      .catch((err) => {
        console.error(err);
        res.render('error');
      });
  }
);

app.get('/charts', (req, res) => {
  database
    .countBookPerYear()
    .then((bookNumPerYear) => {
      res.render('charts', { bookNumPerYear: JSON.stringify(bookNumPerYear) });
    })
    .catch((err) => {
      console.error(err);
      res.render('error');
    });
});

app.get('/price-range', (req, res) => {
  const lowerPrice = parseInt(String(req.query.lower) || '0') || 0;
  const upperPrice = parseInt(String(req.query.upper) || '10000000') || 10000000;

  database
    .searchInPriceRange(upperPrice, lowerPrice)
    .then((bookDto) => {
      res.render('price-range', {
        bookDto: bookDto,
        lowerPrice: lowerPrice,
        upperPrice: upperPrice,
      });
    })
    .catch((err) => {
      console.error(err);
      res.render('error');
    });
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
});

app.post('/:isbn', (req: Request<{ isbn: string }>, res) => {
  database
    .deleteBook(req.params.isbn)
    .then((operationResult) => {
      if (!operationResult.success) {
        res.render('book-detail', { operationResult: operationResult });
      } else {
        res.redirect('/');
      }
    })
    .catch((err) => {
      console.error(err);
    });
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
