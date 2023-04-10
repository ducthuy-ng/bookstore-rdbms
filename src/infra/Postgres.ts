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

type YearDto = {
  published_year: number;
  count: number;
};

export class PostgresSQL implements IDatabase {
  private hostname = 'localhost';
  private port = 5432;
  private username = 'postgres';
  private password = '123456';
  private db = 'postgres';
  private client: Pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '123456',
    port: 5432,
    database: 'postgres',
  });

  constructor() {
    console.log(`[PostgreSQL]: Created PostgreSQL instance: http://${this.hostname}:${this.port}`);
  }

  public static async createInstance(env: NodeJS.ProcessEnv): Promise<IDatabase> {
    const pgInstance = new PostgresSQL();
    pgInstance.client = new Pool({
      user: 'postgres',
      host: 'localhost',
      password: '123456',
      port: 5432,
      database: 'postgres',
    });

    await pgInstance.client.connect();

    return pgInstance;
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

  async countBookPerYear(): Promise<BookCountInYear[]> {
    const query = `SELECT published_year, COUNT(*) FROM book GROUP BY published_year ORDER BY published_year`;
    try {
      const { rows } = await this.client.query<YearDto>(query);
      const ans: BookCountInYear[] = [];
      for (let i = 0; i < rows.length; i++) {
        ans.push({
          year: rows[i].published_year,
          bookNum: rows[i].count,
        });
      }
      return ans;
    } catch (error) {
      return [];
    }
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
      const ans: Book = {
        isbn: rows[0].isbn,
        name: rows[0].name,
        numOfPage: rows[0].numofpage,
        author: rows[0].authors,
        publishedYear: rows[0].published_year,
        coverUrl: rows[0].coverUrl,
        sellPrice: rows[0].sellPrice,
      };
      return ans;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
