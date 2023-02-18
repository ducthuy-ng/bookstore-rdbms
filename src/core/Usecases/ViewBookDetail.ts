import { Book } from '../Book';
import { IDatabase } from '../IDatabase';

export type ViewBookDetailQuery = {
  bookIsbn: string;
};

export async function viewBookDetail(db: IDatabase, query: ViewBookDetailQuery): Promise<Book> {
  return await db.getBookByIsbn(query.bookIsbn);
}
