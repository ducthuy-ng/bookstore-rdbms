import { Book } from './Book';

type OperationResult = {
  success: boolean;
  message: string;
};

type SearchBookDto = {
  isbn: string;
  name: string;
  publishedYear: number;
  coverUrl: string;
};

type BookCountInYear = { year: number; bookNum: number };

interface IDatabase {
  search(queryBookName: string, limit: number, offset: number): Promise<SearchBookDto[]>;
  getBookByIsbn(bookIsbn: string): Promise<Book | null>;

  addNewBook(book: Book): Promise<OperationResult>;
  deleteBook(bookIsbn: string): Promise<OperationResult>;

  countBookPerYear(): Promise<BookCountInYear[]>;
  searchInPriceRange(upperPrice: number, lowerPrice: number): Promise<SearchBookDto[]>;
}

export { IDatabase, OperationResult, SearchBookDto, BookCountInYear };
