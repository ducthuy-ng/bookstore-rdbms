import { Book } from '../core/Book';
import { IDatabase } from '../core/IDatabase';
import { AddBookResult } from '../core/Usecases/AddBook';
import { DeleteBookResult } from '../core/Usecases/DeleteBook';
import { SearchBookDto } from '../core/Usecases/SearchBook';

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

  search(queryBookName: string, pageNumber: number): Promise<SearchBookDto[]> {
    throw new Error('Method not implemented.');
  }

  getBookByIsbn(bookIsbn: string): Promise<Book | null> {
    throw new Error('Method not implemented.');
  }
  addNewBook(book: Book): Promise<AddBookResult> {
    throw new Error('Method not implemented.');
  }
  deleteBook(bookIsbn: string): Promise<DeleteBookResult> {
    throw new Error('Method not implemented.');
  }
}
