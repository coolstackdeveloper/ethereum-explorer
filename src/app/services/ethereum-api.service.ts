import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
import { TransactionDto } from '../models/transaction';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EthereumApiService {
  constructor(private http: HttpClient) {}

  getTransactionCountByBlockNumber(blockNumber) {
    return this.http
      .get<Number>(
        `${environment.apiUrl}/blocks/${blockNumber}/transactionCount`
      )
      .pipe(shareReplay());
  }

  searchTransactionsByBlockNumber(blockNumber, pageNumber) {
    return this.http
      .get<TransactionDto[]>(
        `${environment.apiUrl}/blocks/${blockNumber}/transactions?pageNumber=${pageNumber}`
      )
      .pipe(shareReplay());
  }

  searchTransactionsByBlockNumberAndAddress(blockNumber, address, pageNumber) {
    return this.http
      .get<TransactionDto[]>(
        `${environment.apiUrl}/transactions?blockNumber=${blockNumber}&address=${address}&pageNumber=${pageNumber}`
      )
      .pipe(shareReplay());
  }
}
