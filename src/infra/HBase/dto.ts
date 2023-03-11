export type TableListDto = {
  table: [{ name: string }];
};

export type BookDto = {
  Row: { key: string; Cell: [CellObject] }[];
};

export type CellObject = {
  column: string;
  timestamp: number;
  $: string;
};
