import { Book } from '../../core/Book';
import { BookCountInYear, IDatabase, OperationResult, SearchBookDto } from '../../core/IDatabase';

import axios, { AxiosError } from 'axios';
import { FailedToCreateDb, InvalidEnvVariable } from '../DatabaseBuilder';
import { CellObject, HBaseBookDto, HBaseRow, TableListDto } from './dto';
import {
  BookTableNotExistsInHBase,
  FailedToConnectToHBase,
  FailedToCreateNewScanner,
  IsbnNotExist,
} from './exceptions';

export class HBaseDB implements IDatabase {
  private static DELIMITER = '@@@';
  private static NUM_OF_BOOK_PER_PAGE = 10;

  private hbaseUrl = '';

  private rowKeyOfPageEndCache: string[] = [];

  constructor(hostname: string, port: number) {
    this.setUrl(hostname, port);
    console.log(`[hbase]: Created HBase instance: ${this.hbaseUrl}`);
  }

  private setUrl(hostname: string, port: number) {
    this.hbaseUrl = `http://${hostname}:${port}`;
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

  private async checkConnection(): Promise<OperationResult> {
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
      return { success: true, message: 'Connect successfully to HBase instance' };
    } catch (err) {
      if (err instanceof AxiosError || err instanceof TypeError)
        return { success: false, message: `Failed to connect to HBase ${this.hbaseUrl}` };

      console.error(err);
      return { success: false, message: `Unknown error ${String(err)}` };
    }
  }

  async addNewBook(book: Book): Promise<OperationResult> {
    const rowKey = `${book.isbn}${HBaseDB.DELIMITER}${book.name}`;
    const infoBasic = `${book.isbn}${HBaseDB.DELIMITER}${book.name}${HBaseDB.DELIMITER}${book.publishedYear}${HBaseDB.DELIMITER}${book.coverUrl}`;
    const infoDetails = `${book.numOfPage}${HBaseDB.DELIMITER}${book.author}${HBaseDB.DELIMITER}${book.sellPrice}`;

    const encodedRowKey = this.encodeBase64(rowKey);

    const encodedBook: HBaseBookDto = {
      Row: [
        {
          key: encodedRowKey,
          Cell: [
            {
              column: 'aW5mbzpiYXNpYw==',
              $: this.encodeBase64(infoBasic),
            },
            {
              column: 'aW5mbzpkZXRhaWxz',
              $: this.encodeBase64(infoDetails),
            },
          ],
        },
      ],
    };

    try {
      await axios.put(`${this.hbaseUrl}/book/${encodedRowKey}`, encodedBook, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });

      console.log('added book with ISBN', book.isbn);

      return { success: true, message: 'Add book successfully' };
    } catch (err) {
      console.error(err);

      if (err instanceof Error) return { success: false, message: err.message };
      return { success: false, message: 'Unknown error' };
    }
  }

  async deleteBook(isbn: string): Promise<OperationResult> {
    try {
      const key = await this.getKeyOfIsbn(isbn);
      await axios.delete(`${this.hbaseUrl}/book/${key}`);

      console.log('deleted book with ISBN', isbn);

      return { success: true, message: 'Deleted successfully' };
    } catch (err) {
      console.error(err);

      if (err instanceof IsbnNotExist) return { success: false, message: 'Invalid ISBN' };
      if (err instanceof AxiosError) return { success: false, message: err.message };
      return { success: false, message: 'Internal error' };
    }
  }

  async getBookByIsbn(isbn: string): Promise<Book | null> {
    let key: string;
    try {
      key = await this.getKeyOfIsbn(isbn);
    } catch (err) {
      if (err instanceof IsbnNotExist) return null;
      throw err;
    }

    const resp = await axios.get<HBaseBookDto>(`${this.hbaseUrl}/book/${key}`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });

    if (resp.data['Row'].length !== 1) {
      return null;
    }

    const parsedCellObjects = resp.data['Row'][0].Cell.map((cell) => this.decodeCellObject(cell));

    let basicColValue = [
      '0',
      'Unknown',
      'https://media.istockphoto.com/photos/blank-book-cover-isolated-on-white-picture-id478720334',
      '0',
    ].join(HBaseDB.DELIMITER);
    let detailsColValue = ['0', 'Unknown', '0'].join(HBaseDB.DELIMITER);

    parsedCellObjects.forEach((cellObject) => {
      if (cellObject.column === 'info:basic') basicColValue = cellObject.$;
      if (cellObject.column === 'info:details') detailsColValue = cellObject.$;
    });

    const [, name, publishedYear, coverUrl] = basicColValue.split(HBaseDB.DELIMITER);
    const [numOfPage, author, sellPrice] = detailsColValue.split(HBaseDB.DELIMITER);

    return {
      isbn: isbn,
      name: name,
      publishedYear: this.parseIntWithSeparator(publishedYear),
      coverUrl: coverUrl,
      numOfPage: this.parseIntWithSeparator(numOfPage),
      author: author,
      sellPrice: this.parseIntWithSeparator(sellPrice),
    };
  }

  async search(queryBookName: string, pageNumber: number): Promise<SearchBookDto[]> {
    const scannerRequestXML = `
    <Scanner 
      batch="${pageNumber * HBaseDB.NUM_OF_BOOK_PER_PAGE}"
      maxVersions="1">
      <column>aW5mbzpiYXNpYw==</column>
      <filter>
        {
          "op":"EQUAL",
          "type":"RowFilter",
          "family":"ZGV0YWlscw",
          "qualifier":"aW5mbw==",
          "comparator": {
            "value": "${queryBookName}", 
            "type": "SubstringComparator"
          }
        }
      </filter>
    </Scanner>`;

    const searchBooks = await this.performScanRequest(scannerRequestXML);

    if (searchBooks === null) return [];

    const resultList = searchBooks['Row'].slice((pageNumber - 1) * HBaseDB.NUM_OF_BOOK_PER_PAGE);
    return resultList.map((row) => this.parseBasic(row));
  }

  // TODO
  countBookPerYear(): Promise<BookCountInYear> {
    throw new Error('Method not implemented.');
  }

  // TODO
  searchInPriceRange(upperPrice: number, lowerPrice: number): Promise<SearchBookDto[]> {
    throw new Error('Method not implemented.');
  }

  private decodeCellObject(cell: CellObject): CellObject {
    return {
      column: Buffer.from(cell.column, 'base64').toString(),
      timestamp: cell.timestamp,
      $: Buffer.from(cell.$, 'base64').toString(),
    };
  }

  private parseIntWithSeparator(rawString: string | undefined) {
    if (rawString === undefined) {
      rawString = '0';
    }

    return parseInt(rawString.replace(/,/g, ''));
  }

  private async performScanRequest(scannerRequestXML: string): Promise<HBaseBookDto | null> {
    try {
      const resp = await axios.put<string>(`${this.hbaseUrl}/book/scanner`, scannerRequestXML, {
        headers: { 'Content-Type': 'text/xml', Accept: 'text/xml' },
      });

      const scannerUrl = String(resp.headers['location']);

      if (resp.status !== 201 || scannerUrl === '') {
        throw new FailedToCreateNewScanner();
      }

      const queryResp = await axios.get<HBaseBookDto>(scannerUrl, {
        headers: { Accept: 'application/json' },
      });

      await axios.delete(scannerUrl);

      if (!queryResp.data) return null;

      return queryResp.data;
    } catch (err) {
      console.error(err);
      throw new FailedToCreateNewScanner();
    }
  }

  private parseBasic(hbaseDto: HBaseRow): SearchBookDto {
    const result = hbaseDto.Cell[0];
    const rawCombinedInfos = this.decodeBase64(result.$);
    const [isbn, bookName, publishedYearInString, coverUrl] = rawCombinedInfos.split(
      HBaseDB.DELIMITER
    );

    return {
      isbn: isbn,
      name: bookName,
      publishedYear: parseInt(publishedYearInString),
      coverUrl: coverUrl,
    };
  }

  private decodeBase64(value: string): string {
    return Buffer.from(value, 'base64').toString();
  }

  private encodeBase64(value: string): string {
    return Buffer.from(value).toString('base64');
  }

  /**
   * throws IsbnNotExist
   */
  async getKeyOfIsbn(isbn: string): Promise<string> {
    // Shell script: scan 'book', {FILTER => "( PrefixFilter('1234567890') )"}
    const encodedIsbn = this.encodeBase64(isbn);

    const prefixFilterScannerString = `
    <Scanner batch="1" maxVersions="1">
      <column>aW5mbw==</column>
      <filter>
        {
          "type":"PrefixFilter",
          "value":"${encodedIsbn}"
        }
      </filter>
    </Scanner>`;

    const result = await this.performScanRequest(prefixFilterScannerString);

    if (result === null || result['Row'].length !== 1) throw new IsbnNotExist(isbn);

    const key = this.decodeBase64(result['Row'][0].key);
    return key;
  }
}
