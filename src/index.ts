import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

import { bookRouter } from './routes/books';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));

app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'Hey', body: 'Xin chào' });
});

app.use('/books', bookRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at port http://localhost:${port}`);
});
