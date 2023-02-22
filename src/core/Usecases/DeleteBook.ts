import { IDatabase } from '../IDatabase';

export type DeleteBookQuery = {
  bookIsbn: string;
};

export type DeleteBookResult = {
  success: boolean;
  message: string;
};

export function deleteBook(db: IDatabase, query: DeleteBookQuery): Promise<DeleteBookResult> {
  return db.deleteBook(query.bookIsbn);
}
