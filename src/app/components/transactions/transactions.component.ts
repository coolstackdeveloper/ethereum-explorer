import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
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
  transactionsCount: number = 0;
  transactions: TransactionDto[] = [];
  pagesVisited: number[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private ethereumApiService: EthereumApiService,
    private toastNotificationService: ToastNotificationService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.pagesVisited = [];
      this.transactions = [];
      this.currentAddress = params['address'];
      this.currentBlockNumber = params['blockNumber'];
      this.pageChanged(1); // Switch to first page
    });
  }

  searchTransactionsByBlockNumber(pageNumber) {
    this.toastNotificationService.toast(
      `Fetching transactions for the block ${this.currentBlockNumber}`
    );

    this.ethereumApiService
      .getTransactionsCount(this.currentBlockNumber)
      .pipe(
        tap((transactionCount: number) => {
          this.transactionsCount = transactionCount;
        }),
        switchMap((_) =>
          this.ethereumApiService.searchTransactions(
            this.currentBlockNumber,
            null,
            pageNumber
          )
        )
      )
      .subscribe(
        (transactionsDtoResponse: TransactionDto[]) => {
          this.currentPageNumber = pageNumber;
          this.toastNotificationService.clearToast();

          // One time initialization for the current block
          if (this.transactions.length === 0) {
            this.numberOfItemsPerPage = transactionsDtoResponse.length;
            this.transactions = Array(this.transactionsCount).fill({});
          }

          if (transactionsDtoResponse.length === 0) {
            this.toastNotificationService.toast(
              `No transactions exist for block ${this.currentBlockNumber}`
            );
          } else {
            this.transactions.splice(
              this.numberOfItemsPerPage * (pageNumber - 1),
              this.numberOfItemsPerPage,
              ...transactionsDtoResponse
            );
          }
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

  searchTransactionsByBlockNumberAndAddress(pageNumber) {
    this.toastNotificationService.toast(
      `Fetching transactions for address ${this.currentAddress} in block ${this.currentBlockNumber}`
    );

    this.ethereumApiService
      .searchTransactions(
        this.currentBlockNumber,
        this.currentAddress,
        pageNumber
      )
      .subscribe(
        (transactionsDtoResponse: TransactionDto[]) => {
          this.toastNotificationService.clearToast();

          if (this.transactions.length === 0) {
            this.numberOfItemsPerPage = transactionsDtoResponse.length;
            this.transactions = Array(this.numberOfItemsPerPage).fill({});
          }

          if (!this.pagesVisited.includes(pageNumber)) {
            this.pagesVisited.push(pageNumber);

            // this keeps adjusting the pages
            this.transactions.splice(
              this.numberOfItemsPerPage * (pageNumber - 1),
              transactionsDtoResponse.length > 0
                ? 0
                : this.numberOfItemsPerPage,
              ...transactionsDtoResponse
            );

            // Stick to the previous page
            this.currentPageNumber =
              transactionsDtoResponse.length > 0 ? pageNumber : pageNumber - 1;
          }

          if (this.transactions.length === 0) {
            this.toastNotificationService.toast(
              `No transactions exist for address ${this.currentAddress} within block ${this.currentBlockNumber}`
            );
          }
        },
        (error) => {
          const errorMessage =
            error.status === 404
              ? 'Invalid block number and/or address'
              : error.error.FailureReason ||
                `Failed to retrieve the transactions for address ${this.currentAddress} in block ${this.currentBlockNumber}`;
          this.toastNotificationService.toast(
            errorMessage,
            Constants.toastNotificationTimeout
          );
        }
      );
  }

  pageChanged(pageNumber) {
    if (!!this.currentBlockNumber && !!this.currentAddress)
      this.searchTransactionsByBlockNumberAndAddress(pageNumber);
    else if (!!this.currentBlockNumber)
      this.searchTransactionsByBlockNumber(pageNumber);
  }
}
