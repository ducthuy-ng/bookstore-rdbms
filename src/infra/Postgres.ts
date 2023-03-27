import { Book } from '../core/Book';
import { Pool } from 'pg';
import { BookCountInYear, IDatabase, OperationResult, SearchBookDto } from '../core/IDatabase';

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
    } catch (error: any) {
      const ans = { success: false, message: error.message };
      return ans;
    }
  }
  async deleteBook(bookIsbn: string): Promise<OperationResult> {
    const query = `DELETE FROM book WHERE isbn = '${bookIsbn}'`;
    try {
      await this.client.connect(); // creates connection
      await this.client.query(query); // sends query
      await this.client.end();
      return { success: true, message: 'OK' };
    } catch (error: any) {
      const ans = { success: false, message: error.message };
      return ans;
    }
  }

  countBookPerYear(): Promise<BookCountInYear> {
    throw new Error('Method not implemented.');
  }

  async searchInPriceRange(upperPrice: number, lowerPrice: number): Promise<SearchBookDto[]> {
    const query = `SELECT * FROM book WHERE sellPrice <= ${upperPrice} AND sellPrice >= ${lowerPrice}`;
    try {
      await this.client.connect();
      const { rows } = await this.client.query(query);
      this.client.end();
      const ans: any = [];
      for (let i = 0; i < rows.length; i++) {
        ans.push({
          isbn: rows[i].isbn,
          name: rows[i].name,
          publishedYear: rows[i].published_year,
          coverUrl: rows[i].coverUrl,
        });
      }
      return ans;
    } catch (error: any) {
      return [];
    }
  }

  async search(queryBookName: string, pageNumber: number): Promise<SearchBookDto[]> {
    const query = `SELECT * FROM book WHERE name = '${queryBookName}' AND numofpage = ${pageNumber}`;
    try {
      await this.client.connect();
      const { rows } = await this.client.query(query);
      this.client.end();
      const ans: any = [];
      for (let i = 0; i < rows.length; i++) {
        ans.push({
          isbn: rows[i].isbn,
          name: rows[i].name,
          publishedYear: rows[i].published_year,
          coverUrl: rows[i].coverUrl,
        });
      }
      return ans;
    } catch (error: any) {
      return [];
    }
  }

  async getBookByIsbn(bookIsbn: string): Promise<Book | null> {
    const query = `SELECT * FROM book WHERE isbn = '${bookIsbn}'`;
    try {
      await this.client.connect();
      const { rows } = await this.client.query(query);
      this.client.end();
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error: any) {
      return null;
    }
  }
}
