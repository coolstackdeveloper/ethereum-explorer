import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private router: Router) {}

  searchByBlockNumber(blockNumber) {
    this.router.navigateByUrl(`/blocks/${blockNumber.value}/transactions`);
  }

  searchByAddress(address) {
    this.router.navigateByUrl(`/addresses/${address.value}/transactions`);
  }
}
