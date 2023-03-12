import { HBaseDB } from '.';
import { FailedToConnectToHBase } from './exceptions';

describe('Test HBase create', () => {
  test('Create correct connection should success', async () => {
    await expect(HBaseDB.createInstance('localhost', 8080)).resolves.not.toThrow();
  });

  test('Create incorrect hostname connection should throw FailedToConnectToHBase', () => {
    HBaseDB.createInstance('localhost', 9091).catch((error) =>
      expect(error).toBeInstanceOf(FailedToConnectToHBase)
    );
  });

  test('Connect to an existing REST API server, but not a HBase one', () => {
    HBaseDB.createInstance('localhost', 8085).catch((error) =>
      expect(error).toBeInstanceOf(FailedToConnectToHBase)
    );
  });

  // TODO
  // test("Connect to an existing REST API server, but missing table 'Book'", () => {
  //   expect(async () => {
  //     const testHBase = HBaseDB.createInstance('localhost', 8080);
  //   }).toThrow(BookTableNotExistsInHBase);
  // });
});

describe('Test GetBookByIsbn', () => {
  let hbase: HBaseDB;

  beforeAll(async () => {
    hbase = await HBaseDB.createInstance('localhost', 8080);
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
