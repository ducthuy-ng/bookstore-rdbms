import { Book } from '../../core/Book';
import { IDatabase } from '../../core/IDatabase';
import { AddBookResult } from '../../core/Usecases/AddBook';
import { DeleteBookResult } from '../../core/Usecases/DeleteBook';

import axios, { AxiosError } from 'axios';
import { SearchBookDto } from '../../core/Usecases/SearchBook';
import { BookDto, CellObject, TableListDto } from './dto';
import { BookTableNotExistsInHBase, FailedToConnectToHBase } from './exceptions';

export class HBaseDB implements IDatabase {
  private hbaseUrl = '';

  private constructor(hostname: string, port: number) {
    this.setUrl(hostname, port);
    console.log(`[hbase]: Created HBase instance: ${this.hbaseUrl}`);
  }

  static async createInstance(hostname: string, port: number): Promise<HBaseDB> {
    const dbInstance = new HBaseDB(hostname, port);
    await dbInstance.checkConnection();
    return dbInstance;
  }

  private setUrl(hostname: string, port: number) {
    this.hbaseUrl = `http://${hostname}:${port}`;
  }

  public async checkConnection() {
    try {
      const resp = await axios.get<TableListDto>(`${this.hbaseUrl}/`);

      if (resp.status !== 200) {
        throw new FailedToConnectToHBase(this.hbaseUrl);
      }

      const tableNames = resp.data.table;

      if (!tableNames.some((table) => table.name === 'book')) {
        throw new BookTableNotExistsInHBase();
      }

      console.log('[hbase]: Connect successfully to HBase instance');
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new FailedToConnectToHBase(this.hbaseUrl);
      }

      if (error instanceof TypeError) {
        throw new FailedToConnectToHBase(this.hbaseUrl);
      }

      throw error;
    }
  }

  private decodeCellObject(cell: CellObject): CellObject {
    return {
      column: Buffer.from(cell.column, 'base64').toString(),
      timestamp: cell.timestamp,
      $: Buffer.from(cell.$, 'base64').toString(),
    };
  }

  private decodeCellList(cellList: CellObject[]): CellObject[] {
    return cellList.map((cell) => this.decodeCellObject(cell));
  }

  private mapCellListToBook(cellList: CellObject[]) {
    return new Map(cellList.map((cell) => [cell.column, cell.$]));
  }

  private parseFloatWithSeperator(rawString: string | undefined) {
    if (rawString === undefined) {
      rawString = '0';
    }

    return parseFloat(rawString.replace(/,/g, ''));
  }

  search(queryBookName: string, pageNumber: number): Promise<SearchBookDto[]> {
    throw new Error('Method not implemented.');
  }

  async getBookByIsbn(bookIsbn: string): Promise<Book | null> {
    try {
      const resp = await axios.get<BookDto>(`${this.hbaseUrl}/book/${bookIsbn}`);

      if (resp.data.Row.length === 0) return null;

      for (const row of resp.data.Row) {
        const isbn = Buffer.from(row.key, 'base64').toString();

        if (isbn !== bookIsbn) continue;

        const decodedCellList = this.decodeCellList(row.Cell);
        const mappedCell = this.mapCellListToBook(decodedCellList);
        return {
          isbn: bookIsbn,
          name: mappedCell.get('details:name') || '',
          author: mappedCell.get('details:authors') || '',
          numOfPage: parseInt(mappedCell.get('details:pageNum') || '0') || 0,
          coverUrl: mappedCell.get('details:coverUrl') || '/public/images/missing_book_cover.jpeg',
          publishedYear: parseInt(mappedCell.get('details:publishedYear') || '0') || 0,
          sellPrice: this.parseFloatWithSeperator(mappedCell.get('details:sellPrice')),
        };
      }

      return null;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) return null;

        throw new FailedToConnectToHBase(this.hbaseUrl);
      }

      throw error;
    }
  }

  addNewBook(book: Book): Promise<AddBookResult> {
    throw new Error('Method not implemented.');
  }

  deleteBook(bookIsbn: string): Promise<DeleteBookResult> {
    throw new Error('Method not implemented.');
  }
}
