import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
    encapsulation: ViewEncapsulation.Emulated,  // make sure it's not None

})
export class SidebarComponent implements OnChanges {
  @Input() isSidebarVisible: boolean = false;

  ngOnChanges() {
    console.log('Sidebar visibility in SidebarComponent:', this.isSidebarVisible);
  }
  isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'ADMIN';
  }
}
