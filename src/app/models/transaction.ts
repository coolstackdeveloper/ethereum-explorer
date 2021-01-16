export interface TransactionDto {
  hash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  gas: string;
  value: string;
}


export interface TransactionsDtoResponse {
  transactions: TransactionDto[];
}
