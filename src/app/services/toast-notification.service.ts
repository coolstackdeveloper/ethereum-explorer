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

  toast(message = '', timeout = null) {
    of(message)
      .pipe(delay(timeout ?? 0))
      .subscribe((error: string) => this.toastSubject.next(error));
  }

  clearToast() {
    this.toast();
  }
}
