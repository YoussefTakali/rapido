import { Component, EventEmitter, Output, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SocketService } from 'src/app/services/socket.service';
import { Notification } from 'src/app/models/Notification';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() sidebarToggled = new EventEmitter<boolean>();
isProfileDropdownVisible = false;
toggleProfileDropdown() {
  this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
}
  user: User = JSON.parse(localStorage.getItem('user') || '{}');
  imageUrl: string = this.user && this.user.profilePicture
    ? `${environment.apiBaseUrl}/uploads/profile-pictures/${this.user.profilePicture}`
    : 'assets/images/default-profile.png';

  isSidebarVisible = false;
  hasNewNotification = false;

  notifications: Notification[] = [];
  isNotificationsDropdownVisible = false;

  private notificationSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    // Subscribe to unread notifications flag
    this.notificationService.hasUnreadNotifications$.subscribe(flag => {
      this.hasNewNotification = flag;
    });

    const userId = this.user?.id;
    if (userId) {
      // Subscribe to socket notifications stream
this.notificationSub = this.socketService.listenToNotifications(userId).subscribe({
  next: (notification) => {
    // Check if notification already exists before adding
    if (!this.notifications.some(n => n.id === notification.id)) {
      this.notifications.unshift(notification);
      this.notificationService.triggerNewNotification(notification);
    }
  },
  error: (err) => {
    console.error('Error receiving notifications:', err);
  }
});

          this.loadNotifications();

    }
  }

  ngOnDestroy() {
    // Clean up subscription
    this.notificationSub?.unsubscribe();
  }

  onHamburgerClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isSidebarVisible = !this.isSidebarVisible;
    this.sidebarToggled.emit(this.isSidebarVisible);
  }
loadNotifications() {
  this.notificationService.getNotifications().subscribe({
    next: (data) => {
      // Sort notifications by createdAt descending (newest first)
      this.notifications = data.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    },
    error: (err) => console.error('Failed to load notifications', err),
  });
}

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.removeTokens();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.authService.removeTokens();
        this.router.navigate(['/login']);
      },
    });
  }

  editProfile(): void {
    // Your profile edit logic here
  }

  toggleNotificationsDropdown() {
    this.isNotificationsDropdownVisible = !this.isNotificationsDropdownVisible;

    if (this.isNotificationsDropdownVisible) {
      this.markAllNotificationsAsRead();
    }
  }

  markAllNotificationsAsRead() {
    this.hasNewNotification = false;
    this.notificationService.markAllAsRead();
  }
 timeAgo(dateString: string | Date): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) {
    return 'just now';
  }
  if (seconds < 60) {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  // fallback to date string for older dates
  return date.toLocaleDateString();
}

}
