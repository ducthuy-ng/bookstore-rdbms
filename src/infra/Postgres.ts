import { Book } from '../core/Book';
import { Pool } from 'pg';
import { BookCountInYear, IDatabase, OperationResult, SearchBookDto } from '../core/IDatabase';

type PostgresDto = {
  isbn: string;
  name: string;
  numofpage: number;
  authors: string;
  published_year: number;
  coverUrl: string;
  sellPrice: number;
};

export class PostgresSQL implements IDatabase {
  private hostname = 'localhost';
  private port = 5432;
  private username = 'postgres';
  private password = 'postgres';
  private db = 'postgres';
  private client = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    port: 5432,
    database: 'postgres',
  });

  constructor() {
    console.log(`[PostgreSQL]: Created PostgreSQL instance: http://${this.hostname}:${this.port}`);
  }

  async addNewBook(book: Book): Promise<OperationResult> {
    const query = `INSERT INTO (isbn,name,numofpage,author,published_year,coverUrl,sellPrice) 
    VALUES ('${book.isbn}', '${book.name}', ${book.numOfPage}, '${book.author}', ${book.publishedYear}, '${book.coverUrl}', ${book.sellPrice})`;
    try {
      await this.client.connect(); // creates connection
      await this.client.query(query); // sends query
      await this.client.end();
      return { success: true, message: 'OK' };
    } catch (error) {
      console.error(error);

      if (error instanceof Error) return { success: false, message: error.message };
      return { success: false, message: 'Internal Server Error' };
    }
  }

  async deleteBook(bookIsbn: string): Promise<OperationResult> {
    const query = `DELETE FROM book WHERE isbn = '${bookIsbn}'`;
    try {
      await this.client.connect(); // creates connection
      await this.client.query(query); // sends query
      await this.client.end();
      return { success: true, message: 'OK' };
    } catch (error) {
      console.error(error);

      if (error instanceof Error) return { success: false, message: error.message };
      return { success: false, message: 'Internal Server Error' };
    }
  }

  countBookPerYear(): Promise<BookCountInYear> {
    throw new Error('Method not implemented.');
  }

  async searchInPriceRange(upperPrice: number, lowerPrice: number): Promise<SearchBookDto[]> {
    const query = `SELECT * FROM book WHERE sellPrice <= ${upperPrice} AND sellPrice >= ${lowerPrice}`;
    try {
      const { rows } = await this.client.query<PostgresDto>(query);

      const ans: SearchBookDto[] = [];
      for (let i = 0; i < rows.length; i++) {
        ans.push({
          isbn: rows[i].isbn,
          name: rows[i].name,
          publishedYear: rows[i].published_year,
          coverUrl: rows[i].coverUrl,
        });
      }
      return ans;
    } catch (error) {
      return [];
    }
  }

  async search(queryBookName: string, pageNumber: number): Promise<SearchBookDto[]> {
    const query = `SELECT * FROM book WHERE name = '${queryBookName}' AND numofpage = ${pageNumber}`;
    try {
      const { rows } = await this.client.query<PostgresDto>(query);

      const ans: SearchBookDto[] = [];
      for (let i = 0; i < rows.length; i++) {
        ans.push({
          isbn: rows[i].isbn,
          name: rows[i].name,
          publishedYear: rows[i].published_year,
          coverUrl: rows[i].coverUrl,
        });
      }
      return ans;
    } catch (error) {
      return [];
    }
  }

  async getBookByIsbn(bookIsbn: string): Promise<Book | null> {
    const query = `SELECT * FROM book WHERE isbn = '${bookIsbn}'`;
    try {
      const { rows } = await this.client.query<PostgresDto>(query);

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (error) {
      console.error(error);

      return null;
    }
  }
}
