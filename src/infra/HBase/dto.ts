export type TableListDto = {
  table: [{ name: string }];
};

export type HBaseRow = {
  key: string;
  Cell: CellObject[];
};

export type HBaseBookDto = {
  Row: HBaseRow[];
};

export type CellObject = {
  column: string;
  timestamp?: number;
  $: string;
};
