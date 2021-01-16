import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {
  toastSubject: Subject<string> = new Subject<string>();

  toasts() {
    return this.toastSubject;
  }

  toast(message, timeout) {
    this.toastSubject.next(message);

    // Clear error notification after set interval
    if (+timeout >= 0) {
      of(null)
        .pipe(delay(timeout))
        .subscribe((error: string) => this.toastSubject.next(error));
    }
  }
}
