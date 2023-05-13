import { Book } from '../../core/Book';
import { BookCountInYear, IDatabase, OperationResult, SearchBookDto } from '../../core/IDatabase';

import axios, { AxiosError } from 'axios';
import { FailedToCreateDb, InvalidEnvVariable } from '../DatabaseBuilder';
import { TableListDto } from './dto';
import { BookTableNotExistsInHBase, FailedToConnectToHBase } from './exceptions';

export class HBaseDB implements IDatabase {
  private static DELIMITER = '@@@';
  private static NUM_OF_BOOK_PER_PAGE = 10;

  private hbaseUrl = '';
  private extendedRestApiServer = '';

  constructor(hostname: string, port: number) {
    this.setUrl(hostname, port);
    console.log(`[hbase]: Created HBase instance: ${this.hbaseUrl}`);
  }

  private setUrl(hostname: string, port: number, extendedRestApiPort = 4000) {
    this.hbaseUrl = `http://${hostname}:${port}`;
    this.extendedRestApiServer = `http://${hostname}:${extendedRestApiPort}`;
  }

  public static async createInstance(env: NodeJS.ProcessEnv): Promise<IDatabase> {
    if (env.HBASE_HOSTNAME === undefined) {
      throw new InvalidEnvVariable('HBASE_HOSTNAME');
    }

    if (env.HBASE_PORT === undefined) {
      throw new InvalidEnvVariable('HBASE_PORT');
    }

    const portNumber = parseInt(env.HBASE_PORT);
    if (isNaN(portNumber)) {
      throw new InvalidEnvVariable('HBASE_PORT');
    }

    const newHbaseInstance = new HBaseDB(env.HBASE_HOSTNAME, portNumber);
    const connectionResult = await newHbaseInstance.checkConnection();

    if (!connectionResult.success) throw new FailedToCreateDb(connectionResult.message);

    return newHbaseInstance;
  }

  private checkConnection(): Promise<OperationResult> {
    return Promise.resolve({
      success: true,
      message: 'Connect successfully to HBase instance',
    });
  }

  async addNewBook(book: Book): Promise<OperationResult> {
    const response = await axios.post(`${this.extendedRestApiServer}/books`, book, {
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: String(response.data),
      };
    }

    return {
      success: true,
      message: 'Add book successfully',
    };
  }

  async deleteBook(isbn: string): Promise<OperationResult> {
    const response = await axios.delete(`${this.extendedRestApiServer}/books/${isbn}`, {
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: String(response.data),
      };
    }

    return {
      success: true,
      message: 'Deleted successfully',
    };
  }

  async getBookByIsbn(isbn: string): Promise<Book | null> {
    const response = await axios.get<Book>(`${this.extendedRestApiServer}/books/${isbn}`, {
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  }

  async search(queryBookName: string, limit: number, offset: number): Promise<SearchBookDto[]> {
    const response = await axios.get<SearchBookDto[]>(`${this.extendedRestApiServer}/books`, {
      params: {
        queryBookName: queryBookName,
        limit: limit,
        offset: offset,
      },
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      return [];
    }

    return response.data;
  }

  async countBookPerYear(): Promise<BookCountInYear[]> {
    const resp = await axios.get<BookCountInYear[]>(`${this.extendedRestApiServer}/years`, {
      validateStatus: () => true,
    });

    return resp.data;
  }

  async searchInPriceRange(upperPrice: number, lowerPrice: number): Promise<SearchBookDto[]> {
    const resp = await axios.get<SearchBookDto[]>(`${this.extendedRestApiServer}/search-price`, {
      params: { lower: lowerPrice, upper: upperPrice },
      validateStatus: () => true,
    });

    return resp.data;
  }
}
