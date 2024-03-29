import { Book } from '../core/Book';
import { Pool } from 'pg';
import { BookCountInYear, IDatabase, OperationResult, SearchBookDto } from '../core/IDatabase';
import { InvalidEnvVariable } from './DatabaseBuilder';

type PostgresDto = {
  isbn: string;
  name: string;
  num_of_page: number;
  authors: string;
  published_year: number;
  cover_url: string;
  sell_price: number;
};

type YearDto = {
  published_year: number;
  count: number;
};

export class PostgresSQL implements IDatabase {
  private client: Pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    port: 5432,
    database: 'postgres',
  });

  public static async createInstance(env: NodeJS.ProcessEnv): Promise<IDatabase> {
    const pgInstance = new PostgresSQL();

    if (env.PG_HOSTNAME === undefined) {
      throw new InvalidEnvVariable('PG_HOSTNAME');
    }

    if (env.PG_PORT === undefined) {
      throw new InvalidEnvVariable('PG_PORT');
    }
    const portNumber = parseInt(env.PG_PORT);
    if (isNaN(portNumber)) {
      throw new InvalidEnvVariable('PG_PORT');
    }

    if (env.PG_USER === undefined) {
      throw new InvalidEnvVariable('PG_USER');
    }

    if (env.PG_PASSWORD === undefined) {
      throw new InvalidEnvVariable('PG_PASSWORD');
    }

    if (env.PG_DATABASE === undefined) {
      throw new InvalidEnvVariable('PG_DATABASE');
    }

    pgInstance.client = new Pool({
      host: env.PG_HOSTNAME,
      port: portNumber,
      user: env.PG_USER,
      password: env.PG_PASSWORD,
      database: env.PG_DATABASE,
    });

    await pgInstance.client.connect();

    console.log(
      `[PostgreSQL]: Created PostgreSQL instance: http://${env.PG_HOSTNAME}:${portNumber}`
    );

    return pgInstance;
  }

  async addNewBook(book: Book): Promise<OperationResult> {
    const query = 'INSERT INTO book VALUES ($1, $2, $3, $4, $5, $6, $7);';
    try {
      await this.client.query(query, [
        book.isbn,
        book.name,
        book.numOfPage,
        book.author,
        book.publishedYear,
        book.coverUrl,
        book.sellPrice,
      ]); // sends query

      return { success: true, message: 'OK' };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) return { success: false, message: error.message };
      return { success: false, message: 'Internal Server Error' };
    }
  }

  async deleteBook(bookIsbn: string): Promise<OperationResult> {
    try {
      await this.client.query('DELETE FROM book WHERE isbn = $1', [bookIsbn]); // sends query
      return { success: true, message: 'OK' };
    } catch (error) {
      console.error(error);
      if (error instanceof Error) return { success: false, message: error.message };
      return { success: false, message: 'Internal Server Error' };
    }
  }

  async countBookPerYear(): Promise<BookCountInYear[]> {
    try {
      const { rows } = await this.client.query<YearDto>(
        'SELECT published_year, COUNT(*) FROM book GROUP BY published_year ORDER BY published_year'
      );
      const ans: BookCountInYear[] = [];
      for (let i = 0; i < rows.length; i++) {
        ans.push({
          year: rows[i].published_year,
          bookNum: rows[i].count,
        });
      }
      return ans;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async searchInPriceRange(upperPrice: number, lowerPrice: number): Promise<SearchBookDto[]> {
    try {
      const { rows } = await this.client.query<PostgresDto>(
        'SELECT * FROM book WHERE sell_price >= $1 AND sell_price <= $2 LIMIT 10',
        [lowerPrice, upperPrice]
      );

      const ans: SearchBookDto[] = [];

      for (let i = 0; i < rows.length; i++) {
        ans.push({
          isbn: rows[i].isbn,
          name: rows[i].name,
          publishedYear: rows[i].published_year,
          coverUrl: rows[i].cover_url,
        });
      }
      return ans;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async search(queryBookName: string, limit: number, offset: number): Promise<SearchBookDto[]> {
    try {
      queryBookName = `%${queryBookName}%`;
      const { rows } = await this.client.query<PostgresDto>(
        'SELECT * FROM book WHERE name ILIKE $1 OFFSET $2 LIMIT $3;',
        [queryBookName, offset, limit]
      );

      const ans: SearchBookDto[] = [];
      for (let i = 0; i < rows.length; i++) {
        ans.push({
          isbn: rows[i].isbn,
          name: rows[i].name,
          publishedYear: rows[i].published_year,
          coverUrl: rows[i].cover_url,
        });
      }
      return ans;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getBookByIsbn(bookIsbn: string): Promise<Book | null> {
    try {
      const { rows } = await this.client.query<PostgresDto>('SELECT * FROM book WHERE isbn = $1', [
        bookIsbn,
      ]);

      if (rows.length === 0) {
        return null;
      }
      const ans: Book = {
        isbn: rows[0].isbn,
        name: rows[0].name,
        numOfPage: rows[0].num_of_page,
        author: rows[0].authors,
        publishedYear: rows[0].published_year,
        coverUrl: rows[0].cover_url,
        sellPrice: rows[0].sell_price,
      };
      return ans;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
