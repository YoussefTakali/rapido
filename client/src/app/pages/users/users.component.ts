import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserProfile } from 'src/app/models/User';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
    encapsulation: ViewEncapsulation.Emulated,  // make sure it's not None

})
export class UsersComponent implements OnInit {
  apiBaseUrl = environment.apiBaseUrl
  users: UserProfile[] = [];
  isLoading = true
  searchTerm = ""
  selectedFilter = "all"
  filteredUsers: UserProfile[] = []
  constructor(private userService: UserService,private router: Router) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.filterUsers();  // Add this line
            this.isLoading = false;

    });
  }
    onSearch() {
    this.filterUsers()
  }

  onFilterChange() {
    this.filterUsers()
  }

  filterUsers() {
    let filtered = [...this.users]

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
      )
    }

    // Filter by status

    this.filteredUsers = filtered
  }

  onImageError(event: any) {
    event.target.style.display = "none"
    event.target.nextElementSibling.style.display = "flex"
  }

  onImageLoad(event: any) {
    event.target.style.display = "block"
    event.target.nextElementSibling.style.display = "none"
  }

onUserClick(user: UserProfile) {
  this.router.navigate(['/users', user.id]);
}

  onEditUser(user: UserProfile, event: Event) {
    event.stopPropagation()
    console.log("Edit user:", user)
  }

onDeleteUser(user: UserProfile, event: Event) {
  event.stopPropagation();

  if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
    return;
  }

  this.userService.deleteUser(user.id).subscribe({
    next: () => {
      // Remove from users array and update filtered list
      this.users = this.users.filter(u => u.id !== user.id);
      this.filterUsers();
    },
    error: (err) => {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user. Please try again.');
    }
  });
}


  onMessageUser(user: UserProfile, event: Event) {
    event.stopPropagation()
    console.log("Message user:", user)
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

getLastSeenText(lastSeen: string | Date | undefined): string {
  if (!lastSeen) {
    return 'No data';
  }

  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}


  getRoleBadgeClass(role: string): string {
    switch (role?.toLowerCase()) {
      case "admin":
        return "role-admin"
      case "moderator":
        return "role-moderator"
      default:
        return "role-user"
    }
  }
}
