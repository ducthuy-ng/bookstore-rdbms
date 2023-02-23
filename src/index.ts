import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import path from 'path';
import { DatabaseBuilder } from './infra/DatabaseBuilder';
import { ViewBookDetailQuery } from './core/Usecases/ViewBookDetail';
import { Book } from './core/Book';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

const dbBuilder = new DatabaseBuilder();
dbBuilder.setEnvironmentVariables(process.env);

const database = dbBuilder.getDatabaseInstance();

app.use('/public', express.static(path.join(__dirname, '../public')));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));

app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'Hey', body: 'Xin chào' });
});

app.get('/add', (req, res) => {
  res.render('book-add');
});

app.post('/add', (req, res) => {
  res.send(`Add book`);
});

app.get('/:isbn', (req: Request<{ isbn: string }>, res) => {
  const viewBookQuery: ViewBookDetailQuery = {
    bookIsbn: req.params.isbn,
  };

  // const book = viewBookDetail(database, viewBookQuery);
  const book: Book = {
    isbn: '123',
    name: 'ABC',
    numOfPage: 0,
    author: '',
    publishedYear: 0,
    coverUrl: '',
    sellPrice: 0,
  };
  console.log('[server] book-detail');

  res.render('book-detail', { book: book });
});

app.delete('/:isbn', (req: Request<{ isbn: string }>, res) => {
  res.send(`Delete record ${req.params.isbn}`);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at port http://localhost:${port}`);
});
