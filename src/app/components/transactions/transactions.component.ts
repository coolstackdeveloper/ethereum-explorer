import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { TransactionDto } from 'src/app/models/transaction';
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

  searchByAddress(pageNumber) {
    this.toastNotificationService.toast(
      `Fetching transactions to/from address ${this.currentAddress}`,
      -1
    );

    this.ethereumApiService
      .searchByAddress(this.currentAddress, pageNumber)
      .subscribe(
        (transactions: TransactionDto[]) => {
          this.toastNotificationService.toast('', 0);

          this.currentPageNumber = pageNumber;

          if (this.transactions.length === 0) {
            this.numberOfItemsPerPage = transactions.length;
            this.transactions = Array(this.numberOfItemsPerPage).fill({});
          }

          // this logic is required because fetching by address is going to take a long time
          // as we need to scan the whole of block chain iteratively
          // also we dont know how many blocks have the transactions that has address in it
          // this is a bit af adaptive process...
          if (!this.pagesVisited.includes(pageNumber)) {
            this.pagesVisited.push(pageNumber);

            let numerOfItemsToDelete =
              transactions.length > 0 ? 0 : this.numberOfItemsPerPage;

            // this would be the last page
            this.currentPageNumber =
              transactions.length > 0
                ? this.currentPageNumber
                : this.currentPageNumber - 1;

            this.transactions.splice(
              this.numberOfItemsPerPage * (pageNumber - 1),
              numerOfItemsToDelete,
              ...transactions
            );
          }
        },
        (error) => {
          const errorMessage =
            error.status === 404
              ? 'Invalid block number'
              : error.error.FailureReason ||
                `Failed to retrieve the transactions for address ${this.currentAddress}`;
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
        (transactions: TransactionDto[]) => {
          this.toastNotificationService.toast('', 0);

          this.currentPageNumber = pageNumber;

          if (this.transactions.length === 0) {
            this.numberOfItemsPerPage = transactions.length;
            this.transactions = Array(this.totalTransactionCount).fill({});
          }

          // Only fill required paged slot
          this.transactions.splice(
            this.numberOfItemsPerPage * (pageNumber - 1),
            this.numberOfItemsPerPage,
            ...transactions
          );
        },
        (error) => {
          const errorMessage =
            error.status === 404
              ? 'Invalid block number'
              : error.error.FailureReason ||
                `Failed to retrieve the transactions for block ${this.currentBlockNumber}`;

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
