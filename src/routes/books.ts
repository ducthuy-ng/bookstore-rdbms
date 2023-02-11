import express from 'express';

const bookRouter = express.Router();

bookRouter.get('/', (req, res) => {
  res.render('book/index', { title: 'Book', body: 'Book page' });
});

bookRouter.get('/all', (req, res) => {
  res.redirect('/books');
});

export { bookRouter };
