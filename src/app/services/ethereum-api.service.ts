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

  getTransactionsCount(blockNumber) {
    return this.http
      .get<Number>(
        `${environment.apiUrl}/transactionsCount?blockNumber=${blockNumber}`
      )
      .pipe(shareReplay());
  }

  searchTransactions(blockNumber, address, pageNumber) {
    return this.http
      .get<TransactionDto[]>(
        `${
          environment.apiUrl
        }/transactions?blockNumber=${blockNumber}&address=${(
          address ?? ''
        ).trim()}&pageNumber=${pageNumber}`
      )
      .pipe(shareReplay());
  }
}
