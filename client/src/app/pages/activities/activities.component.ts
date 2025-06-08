import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { ProfileService } from '../../services/profile.service';
import { Notification } from '../../models/Notification';
import { NotificationType } from '../../models/Notification';
import { ProfileDetails } from 'src/app/models/Profile';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from 'src/app/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  public NotificationType = NotificationType;
  notifications: Notification[] = [];
  loading = false;

  // Profile modal properties
  showProfileModal = false;
  currentNotification: Notification | null = null;
  allProfiles: ProfileDetails[] = [];
  filteredProfiles: ProfileDetails[] = [];
  selectedProfiles: ProfileDetails[] = [];
  profileSearch = '';
  showDeleteConfirmModal = false;
  notificationToDelete: Notification | null = null;

  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    const userId = this.userService.getCurrentUserId();

    if (userId === null || userId === undefined) {
      console.error('Invalid or missing user ID, socket not initialized');
      return;
    }

    console.log('Initializing activities component for user:', userId);

    // Load initial data
    this.loadNotifications();
    this.loadAllProfiles();

    // Set up socket connection and listen for real-time notifications
    this.setupSocketConnection(userId);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    console.log('Activities component destroyed, subscriptions cleaned up');
  }

  private setupSocketConnection(userId: number): void {
    // Subscribe to connection status
    const connectionSub = this.socketService.connectionStatus$.subscribe(connected => {
      console.log('Socket connection status:', connected);
      if (connected) {
        // When connected, ensure we're in the right room
        this.socketService.joinRoom(userId);
      }
    });
    this.subscriptions.push(connectionSub);

    // Subscribe to real-time notifications
    const notificationSub = this.socketService.listenToNotifications(userId).subscribe({
      next: (notification) => {
        console.log('Real-time notification received in component:', notification);
        
        // Check if notification already exists to avoid duplicates
        const exists = this.notifications.some(n => n.id === notification.id);
        if (!exists) {
          this.notifications.unshift(notification);
          this.notificationService.triggerNewNotification(notification);
          
          // Show a toast notification
          this.snackBar.open('Nouvelle notification reçue!', 'Fermer', {
            duration: 3000,
            verticalPosition: 'top'
          });
        } else {
          console.log('Notification already exists, skipping duplicate');
        }
      },
      error: (err) => {
        console.error('Socket notification error:', err);
        // Optionally try to reconnect
        setTimeout(() => {
          console.log('Attempting to reconnect socket...');
          this.setupSocketConnection(userId);
        }, 5000);
      },
    });
    this.subscriptions.push(notificationSub);
  }

  loadNotifications(): void {
    this.loading = true;
    const loadSub = this.notificationService.getNotifications().subscribe({
      next: (data) => {
        console.log('Loaded notifications from API:', data.length);
        this.notifications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.loading = false;
      }
    });
    this.subscriptions.push(loadSub);
  }

  loadAllProfiles(): void {
    const profilesSub = this.profileService.getAllProfilesDetails().subscribe({
      next: (profiles) => {
        console.log('Profiles loaded:', profiles.length);
        this.allProfiles = profiles;
        this.filteredProfiles = [...profiles];
      },
      error: (err) => console.error('Error loading profiles:', err)
    });
    this.subscriptions.push(profilesSub);
  }

  openProfileModal(notification: Notification): void {
    this.currentNotification = notification;
    this.showProfileModal = true;
    this.selectedProfiles = [];
    this.profileSearch = '';
    this.filterProfiles();
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.currentNotification = null;
  }

  filterProfiles(): void {
    if (!this.profileSearch) {
      this.filteredProfiles = [...this.allProfiles];
      return;
    }
    const searchTerm = this.profileSearch.toLowerCase();
    this.filteredProfiles = this.allProfiles.filter(profile => {
      if (!profile.companyName) {
        console.warn('Profile missing company name:', profile);
        return false;
      }
      return profile.companyName.toLowerCase().includes(searchTerm);
    });
  }

  selectProfile(profile: ProfileDetails): void {
    const index = this.selectedProfiles.findIndex(p => p.id === profile.id);
    if (index > -1) {
      this.selectedProfiles.splice(index, 1);
    } else {
      this.selectedProfiles.push(profile);
    }
  }

  confirmAssignment(): void {
    if (!this.currentNotification || !this.selectedProfiles.length) return;

    const userId = this.currentNotification.addedId;
    if (!userId) {
      console.error('No userId found in notification');
      return;
    }

    const profileIds = this.selectedProfiles.map(profile => profile.id);
    const assignProfilesDto = { userId, profileIds };

    const assignSub = this.userService.assignProfiles(assignProfilesDto).subscribe({
      next: () => {
        this.markNotificationRead(this.currentNotification!);
        this.closeProfileModal();
        this.snackBar.open('Profils assignés avec succès !', 'Fermer', {
          duration: 3000
        });
      },
      error: (err) => {
        console.error('Error assigning profile:', err);
        this.snackBar.open('Erreur lors de lassignation des profils.', 'Fermer', {
          duration: 3000
        });
      }
    });
    this.subscriptions.push(assignSub);
  }

  deleteUser(notification: Notification): void {
    if (!notification.addedId) {
      console.warn('No user associated with this notification.');
      return;
    }

    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur avec l'ID ${notification.addedId} ?`);
    if (!confirmed) return;

    const deleteSub = this.userService.deleteUser(notification.addedId).subscribe({
      next: () => {
        console.log(`User with ID ${notification.addedId} deleted successfully.`);
        this.snackBar.open('Utilisateur supprimé avec succès.', 'Fermer', {
          duration: 3000
        });
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.snackBar.open('Erreur lors de la suppression de lutilisateur.', 'Fermer', {
          duration: 3000
        });
      }
    });
    this.subscriptions.push(deleteSub);
  }

  isProfileSelected(profile: ProfileDetails): boolean {
    return this.selectedProfiles?.some(p => p.id === profile.id) ?? false;
  }

  markNotificationRead(notification: Notification): void {
    if (notification.isRead) return;
    
    const markReadSub = this.notificationService.markAsRead(notification.id).subscribe(() => {
      notification.isRead = true;
    });
    this.subscriptions.push(markReadSub);
  }

  openDeleteConfirmModal(notification: Notification): void {
    this.notificationToDelete = notification;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete(): void {
    if (!this.notificationToDelete?.addedId) return;

    const confirmDeleteSub = this.userService.deleteUser(this.notificationToDelete.addedId).subscribe({
      next: () => {
        console.log(`User with ID ${this.notificationToDelete!.addedId} deleted successfully.`);
        this.snackBar.open('Utilisateur supprimé avec succès.', 'Fermer', { duration: 3000 });
        this.showDeleteConfirmModal = false;
        this.notificationToDelete = null;
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.snackBar.open('Erreur lors de la suppression de lutilisateur.', 'Fermer', { duration: 3000 });
      }
    });
    this.subscriptions.push(confirmDeleteSub);
  }

  cancelDelete(): void {
    this.showDeleteConfirmModal = false;
    this.notificationToDelete = null;
  }

  // Debug method - can be called from template or console
  debugSocketConnection(): void {
    console.log('🔍 Debug Info:');
    console.log('Socket connected:', this.socketService.isConnected());
    
    // Check environment
    console.log('🌍 Environment API Base URL:', (window as any).environment?.apiBaseUrl || 'Not available');
    
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      console.log('Current user ID:', userId);
      console.log('Expected room name: user_' + userId);
      
      // Run comprehensive test
      this.socketService.comprehensiveTest(userId);
      
      // Check browser's WebSocket in Network tab
      console.log('💡 Check the Network tab -> WS for WebSocket frames');
      console.log('💡 You should see outgoing joinRoom events and incoming notification events');
      console.log('💡 If no WS tab appears, the WebSocket connection failed');
    }
  }

  // Manual method to trigger a test notification
  testNotification(): void {
    const testNotification: Notification = {
      id: Date.now(),
      message: 'Test notification from frontend',
      type: NotificationType.UserRegister,
      isRead: false,
      createdAt: new Date(),
      userId: this.userService.getCurrentUserId() || 0, // Fallback to 0 if no user ID
      addedId:40
    };
    
    console.log('🧪 Adding test notification:', testNotification);
    this.notifications.unshift(testNotification);
  }
}