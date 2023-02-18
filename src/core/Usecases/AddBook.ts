import { Book } from '../Book';
import { IDatabase } from '../IDatabase';

export type AddBookQuery = Book;

export type AddBookResult = {
  success: boolean;
  message: string;
};

export function addBook(db: IDatabase, query: AddBookQuery): Promise<AddBookResult> {
  return db.addNewBook(query);
}
