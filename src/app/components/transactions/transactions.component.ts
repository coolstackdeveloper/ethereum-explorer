import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  TransactionDto,
  TransactionsDtoResponse,
} from 'src/app/models/transaction';
import { EthereumApiService } from 'src/app/services/ethereum-api.service';
import { ToastNotificationService } from 'src/app/services/toast-notification.service';
import Constants from '../../constants';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  currentBlockNumber: number;
  currentAddress: string;
  numberOfItemsPerPage: number = 0;
  currentPageNumber: number = 1;
  totalTransactionCount: number = 0;
  transactions: TransactionDto[] = [];
  pagesVisited: number[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private ethereumApiService: EthereumApiService,
    private toastNotificationService: ToastNotificationService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.transactions = [];
      this.currentAddress = params['address'];
      this.currentBlockNumber = params['blockNumber'];
      this.pageChanged(1); // Switch to first page
    });
  }

  mockTransactions(pageNumber): Observable<TransactionsDtoResponse> {
    let transactions: TransactionDto[] = [];

    for (let index = 0; index < 10; ++index) {
      transactions.push({
        blockHash: 'sample',
        blockNumber: 1 * pageNumber + index,
        from: 'sadasd',
        gas: '2424',
        hash: '9090',
        to: '090909',
        value: '900000',
      });
    }

    return of({ transactions });
  }

  searchByAddress(pageNumber) {
    this.toastNotificationService.toast(
      `Fetching transactions to/from address ${this.currentAddress}`,
      -1
    );

    this.ethereumApiService.searchByAddress(this.currentAddress, pageNumber).subscribe(
      //this.mockTransactions(pageNumber).subscribe(
      (transactionsDtoResponse: TransactionsDtoResponse) => {
        this.toastNotificationService.toast('', 0);

        this.currentPageNumber = pageNumber;

        if (this.transactions.length === 0) {
          this.numberOfItemsPerPage =
            transactionsDtoResponse.transactions.length;
          this.transactions = Array(this.numberOfItemsPerPage).fill({});
        }

        // this logic is required because fetching by address is going to take a long time
        // as we need to scan the whole of block chain iteratively
        // also we dont know how many blocks have the transactions that has address in it
        // this is a bit af adaptive process...
        if (!this.pagesVisited.includes(pageNumber)) {
          this.pagesVisited.push(pageNumber);

          let numerOfItemsToDelete =
            transactionsDtoResponse.transactions.length > 0
              ? 0
              : this.numberOfItemsPerPage;

          // this would be the last page
          this.currentPageNumber =
            transactionsDtoResponse.transactions.length > 0
              ? this.currentPageNumber
              : this.currentPageNumber - 1;

          this.transactions.splice(
            this.numberOfItemsPerPage * (pageNumber - 1),
            numerOfItemsToDelete,
            ...transactionsDtoResponse.transactions
          );
        }
      },
      (error) => {
        const errorMessage =
          error.status === 404
            ? 'Invalid block number'
            : error.error.FailureReason;
        this.toastNotificationService.toast(
          errorMessage,
          Constants.toastNotificationTimeout
        );
      }
    );
  }

  searchByBlockNumber(pageNumber) {
    this.toastNotificationService.toast(
      `Fetching transactions for the block ${this.currentBlockNumber}`,
      -1
    );

    this.ethereumApiService
      .getTransactionCountByBlockNumber(this.currentBlockNumber)
      .pipe(
        tap((transactionCount: number) => {
          this.totalTransactionCount = transactionCount;
        }),
        switchMap((_) =>
          this.ethereumApiService.searchByBlockNumber(
            this.currentBlockNumber,
            pageNumber
          )
        )
      )
      .subscribe(
        (transactionsDtoResponse: TransactionsDtoResponse) => {
          this.toastNotificationService.toast('', 0);

          this.currentPageNumber = pageNumber;

          if (this.transactions.length === 0) {
            this.numberOfItemsPerPage =
              transactionsDtoResponse.transactions.length;
            this.transactions = Array(this.totalTransactionCount).fill({});
          }

          // Only fill required paged slot
          this.transactions.splice(
            this.numberOfItemsPerPage * (pageNumber - 1),
            this.numberOfItemsPerPage,
            ...transactionsDtoResponse.transactions
          );
        },
        (error) => {
          const errorMessage =
            error.status === 404
              ? 'Invalid block number'
              : error.error.FailureReason;

          this.toastNotificationService.toast(
            errorMessage,
            Constants.toastNotificationTimeout
          );
        }
      );
  }

  pageChanged(pageNumber) {
    if (this.currentAddress) this.searchByAddress(pageNumber);
    else if (this.currentBlockNumber) this.searchByBlockNumber(pageNumber);
  }
}
