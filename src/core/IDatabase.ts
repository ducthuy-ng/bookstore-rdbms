import { Book } from './Book';
import { AddBookResult } from './Usecases/AddBook';
import { DeleteBookResult } from './Usecases/DeleteBook';
import { SearchBookDto } from './Usecases/SearchBook';

interface IDatabase {
  search(queryBookName: string, pageNumber: number): Promise<SearchBookDto[]>;
  getBookByIsbn(bookIsbn: string): Promise<Book | null>;

  addNewBook(book: Book): Promise<AddBookResult>;
  deleteBook(bookIsbn: string): Promise<DeleteBookResult>;
}

export { IDatabase };
