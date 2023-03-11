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
