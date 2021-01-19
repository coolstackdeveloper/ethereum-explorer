import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { TransactionDto } from '../models/transaction';

export const mockTransaction: TransactionDto = {
  blockHash:
    '0xaa4978538482a88fe9d648c78cb63f5281b63561dc35d566851c9530fa8ef02c',
  blockNumber: 1234,
  from: '0xaa4978538482a88fe9d648c78cb63f5281b63561dc35d566851c9530fa8ef12c',
  to: '0xaa4978538482a88fe9d648c78cb63f5281b63561dc35d566851c9530fa45f02c',
  gas: '0x12345',
  hash: '0xaa4978538482a88fe9d648c78cb63f5281b63561dc35d566851c9523fa8ef02c',
  value: '0x4567',
};

@Injectable()
export class HttpRequestInterceptorMock implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      request.url &&
      request.url.indexOf(`${environment.apiUrl}/transactions?blockNumber=1234&address=`) > -1
    ) {
      return of(new HttpResponse({ status: 200, body: [mockTransaction] }));
    } else if (
      request.url &&
      request.url.indexOf(
        `${environment.apiUrl}/transactions?blockNumber=5678&address=`
      ) > -1
    ) {
      return throwError({ message: 'Failed' });
    } else if (
      request.url &&
      request.url.indexOf(
        `${environment.apiUrl}/transactions?blockNumber=1234&address=5678`
      ) > -1
    ) {
      return of(new HttpResponse({ status: 200, body: [mockTransaction] }));
    }

    return next.handle(request);
  }
}
