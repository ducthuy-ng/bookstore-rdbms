export class FailedToConnectToHBase implements Error {
  name = 'FailedToConnectToHBase';
  message: string;

  constructor(hbaseUrl: string) {
    this.message = `Failed to connect to HBase instance: ${hbaseUrl}`;
  }
}

export class BookTableNotExistsInHBase implements Error {
  name = 'BookTableNotExistsInHBase';
  message = "Table 'Book' not exists in this HBase instance. Please create it first";
}

export class FailedToCreateNewScanner implements Error {
  name = 'FailedToCreateNewScanner';
  message = 'Failed to create new scanner instances';
}

export class IsbnNotExist implements Error {
  name = 'IsbnNotExist';
  message: string;

  constructor(isbn: string) {
    this.message = `Book ISBN not exists: ${isbn}`;
  }
}
