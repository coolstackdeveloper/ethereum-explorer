import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private router: Router) {}

  searchTransactions(blockNumber, address) {
    if (!!blockNumber.value && !!address.value) {
      this.router.navigateByUrl(
        `/transactions/${blockNumber.value}/${address.value}`
      );
    } else if (!!blockNumber.value) {
      this.router.navigateByUrl(`/blocks/${blockNumber.value}/transactions`);
    }
  }
}
