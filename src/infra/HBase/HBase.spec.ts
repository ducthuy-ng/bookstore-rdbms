import { HBaseDB } from '.';
import { Book } from '../../core/Book';

describe('Test GetBookByIsbn', () => {
  let hbase: HBaseDB;

  beforeAll(() => {
    hbase = new HBaseDB('localhost', 8080);
  });

  test('Get existing book should success', async () => {
    const isbn = '9788368625353';
    const book = await hbase.getBookByIsbn(isbn);

    expect(book).not.toBeNull();
    expect(book).toEqual({
      isbn: isbn,
      name: 'Master of the Game',
      numOfPage: 489,
      author: 'Sidney Sheldon',
      publishedYear: 1982,
      coverUrl:
        'http://books.google.com/books/content?id=TkTYp-Tp6_IC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      sellPrice: 1351404,
    });
  });

  test('Get non-existing book should be null', async () => {
    const isbn = '1234567890';
    const book = await hbase.getBookByIsbn(isbn);

    expect(book).toBeNull();
  });
});

describe('Test fuzzy search book name', () => {
  let hbase: HBaseDB;

  beforeAll(() => {
    hbase = new HBaseDB('localhost', 8080);
  });

  test('Test simple fetch', async () => {
    const books = await hbase.search('the', 1);
    expect(books).toHaveLength(10);
    console.log(books);

    books.forEach((book) => {
      expect(book.name).toMatch(/The/i);
    });
  });

  test('Test fetch page 2 should different than page 1', async () => {
    const booksInPage1 = await hbase.search('the', 1);
    const booksInPage2 = await hbase.search('the', 2);

    booksInPage1.forEach((book1) => {
      expect(booksInPage2).not.toContainEqual(book1);
    });
  });
});

describe('Book insertion and deletion', () => {
  let hbase: HBaseDB;

  beforeAll(() => {
    hbase = new HBaseDB('localhost', 8080);
  });

  test('insert then delete', async () => {
    const randomIsbn = '1234567890';
    const book: Book = {
      isbn: randomIsbn,
      name: 'abc',
      numOfPage: 10,
      author: 'Tom',
      publishedYear: 2023,
      coverUrl: 'google.com',
      sellPrice: 0,
    };

    const insertResult = await hbase.addNewBook(book);
    expect(insertResult.success).toBeTruthy();

    const result = await hbase.search('abc', 1);
    console.log(result);

    const searchBook = await hbase.getBookByIsbn(randomIsbn);
    expect(searchBook).toStrictEqual(book);

    const deleteResult = await hbase.deleteBook(randomIsbn);
    expect(deleteResult).toBeTruthy();

    const searchDeletedBook = await hbase.getBookByIsbn(randomIsbn);
    expect(searchDeletedBook).toBeNull();
  });
});
