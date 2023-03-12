import { IDatabase } from '../IDatabase';

export type SearchBookQuery = {
  queryBookName: string;
  pageNumber: number;
};

export type SearchBookDto = {
  isbn: string;
  name: string;
  publishedYear: number;
  coverUrl: string;
};

export function searchBook(db: IDatabase, query: SearchBookQuery): Promise<SearchBookDto[]> {
  return db.search(query.queryBookName, query.pageNumber);
}
