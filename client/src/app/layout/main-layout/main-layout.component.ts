import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/User';
import { SidebarService } from 'src/app/services/sidebar.service';
import { environment } from 'src/environments/environment';

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
  user: User = JSON.parse(localStorage.getItem('user') || '{}');
  username: string =  this.user.name
imageUrl: string = this.user && this.user.profilePicture
  ? `${environment.apiBaseUrl}/uploads/profile-pictures/${this.user.profilePicture}`
  : 'assets/images/default-profile.png';  onSidebarToggle(isVisible: boolean) {
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