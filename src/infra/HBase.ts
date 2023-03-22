import { Book } from '../core/Book';
import { BookCountInYear, IDatabase, OperationResult, SearchBookDto } from '../core/IDatabase';

export class HBaseDB implements IDatabase {
  private hostname = 'localhost';
  private port = 8080;

  constructor(hostname = '', port = '') {
    if (hostname) {
      this.hostname = hostname;
    }

    if (port && !Number.isNaN(parseInt(port))) {
      this.port = parseInt(port);
    }

    console.log(`[hbase]: Created HBase instance: http://${this.hostname}:${this.port}`);
  }
  addNewBook(book: Book): Promise<OperationResult> {
    throw new Error('Method not implemented.');
  }
  deleteBook(bookIsbn: string): Promise<OperationResult> {
    throw new Error('Method not implemented.');
  }
  countBookPerYear(): Promise<BookCountInYear> {
    throw new Error('Method not implemented.');
  }
  searchInPriceRange(upperPrice: number, lowerPrice: number): Promise<SearchBookDto[]> {
    throw new Error('Method not implemented.');
  }

  search(queryBookName: string, pageNumber: number): Promise<SearchBookDto[]> {
    throw new Error('Method not implemented.');
  }

  getBookByIsbn(bookIsbn: string): Promise<Book | null> {
    throw new Error('Method not implemented.');
  }
}
