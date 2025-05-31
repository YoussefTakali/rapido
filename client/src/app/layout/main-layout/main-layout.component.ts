import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  isSidebarVisible = false;
  currentTime: string = '';
  currentDate: string = '';
  constructor(private sidebarService: SidebarService) {}
  username: string = localStorage.getItem('firstname') + ' ' + localStorage.getItem('lastname');
  onSidebarToggle(isVisible: boolean) {
    this.isSidebarVisible = isVisible;
    this.sidebarService.toggleSidebar(isVisible); // 👈 broadcast to everyone
  }
    updateDateTime(): void {
    const now = new Date();

    this.currentDate = now.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    console.log(this.currentDate);
    console.log(this.currentTime);  
    this.currentTime = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  ngOnInit(): void {
    this.updateDateTime();
  }
}