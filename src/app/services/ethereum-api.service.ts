import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
import { TransactionsDtoResponse } from '../models/transaction';
import { ToastNotificationService } from './toast-notification.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EthereumApiService {
  constructor(private http: HttpClient) {}

  searchByAddress(address, pageNumber) {
    return this.http
      .get<TransactionsDtoResponse>(
        `${environment.apiUrl}/addresses/${address}/transactions?pageNumber=${pageNumber}`
      )
      .pipe(shareReplay());
  }

  searchByBlockNumber(blockNumber, pageNumber) {
    return this.http
      .get<TransactionsDtoResponse>(
        `${environment.apiUrl}/blocks/${blockNumber}/transactions?pageNumber=${pageNumber}`
      )
      .pipe(shareReplay());
  }

  getTransactionCountByBlockNumber(blockNumber) {
    return this.http
      .get<Number>(
        `${environment.apiUrl}/blocks/${blockNumber}/transactionCount`
      )
      .pipe(shareReplay());
  }
}
