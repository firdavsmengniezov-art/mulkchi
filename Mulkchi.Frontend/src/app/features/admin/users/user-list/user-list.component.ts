import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserRole, UserStatus } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  Math = Math;

  // Enums for template
  userRoles = Object.values(UserRole);
  userStatuses = Object.values(UserStatus);

  // Statistics
  statistics: any = null;
  showStatistics = false;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStatistics();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    if (this.searchTerm.trim()) {
      this.searchUsers();
    } else {
      this.userService
        .getUsers(this.currentPage, this.pageSize, this.selectedRole, this.selectedStatus)
        .subscribe({
          next: (response) => {
            this.users = response.items;
            this.totalCount = response.totalCount;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load users';
            console.error('Error loading users:', err);
            this.loading = false;
          },
        });
    }
  }

  loadStatistics(): void {
    this.userService.getUserStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      },
    });
  }

  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.loadUsers();
      return;
    }

    this.loading = true;
    this.userService.searchUsers(this.searchTerm, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to search users';
        console.error('Error searching users:', err);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  // User actions
  changeUserRole(user: User, newRole: UserRole | string): void {
    if (newRole === user.role) return;

    this.userService.updateUserRole(user.id, newRole as UserRole).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        alert(`User role updated to ${newRole}`);
      },
      error: (err) => {
        console.error('Error updating user role:', err);
        alert('Failed to update user role');
      },
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    const action = newStatus === 'Blocked' ? 'block' : 'unblock';

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    this.userService.toggleUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        alert(`User ${action}ed successfully`);
      },
      error: (err) => {
        console.error('Error updating user status:', err);
        alert(`Failed to ${action} user`);
      },
    });
  }

  viewUserDetails(user: User): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  viewUserProperties(user: User): void {
    this.router.navigate(['/admin/users', user.id, 'properties']);
  }

  viewUserBookings(user: User): void {
    this.router.navigate(['/admin/users', user.id, 'bookings']);
  }

  deleteUser(user: User): void {
    if (
      confirm(
        `Are you sure you want to delete ${this.userService.getUserDisplayName(user)}? This action cannot be undone.`,
      )
    ) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.id !== user.id);
          this.totalCount--;
          alert('User deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user');
        },
      });
    }
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  // Helper methods for display
  getRoleBadgeColor(role: UserRole): string {
    return this.userService.getRoleBadgeColor(role as any);
  }

  getStatusBadgeColor(status: UserStatus | string): string {
    return this.userService.getStatusBadgeColor(status as any);
  }

  getUserDisplayName(user: User): string {
    return this.userService.getUserDisplayName(user);
  }

  getUserInitials(user: User): string {
    return this.userService.getUserInitials(user);
  }

  formatDate(dateString: string): string {
    return this.userService.formatDate(dateString);
  }

  formatDateTime(dateString: string): string {
    return this.userService.formatDateTime(dateString);
  }

  formatCurrency(amount: number): string {
    return `UZS ${amount.toLocaleString('uz-UZ')}`;
  }

  get filteredUsers(): User[] {
    return this.users.filter((user) => {
      const matchesSearch =
        !this.searchTerm ||
        this.getUserDisplayName(user).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole =
        !this.selectedRole || user.role === (this.selectedRole as unknown as UserRole);
      const matchesStatus =
        !this.selectedStatus || user.status === (this.selectedStatus as unknown as UserStatus);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  get isEmpty(): boolean {
    return !this.loading && this.filteredUsers.length === 0;
  }

  // Statistics methods
  toggleStatistics(): void {
    this.showStatistics = !this.showStatistics;
  }

  getStatCardColor(statName: string): string {
    const colors: Record<string, string> = {
      totalUsers: 'bg-blue-500',
      activeUsers: 'bg-green-500',
      blockedUsers: 'bg-red-500',
      adminsCount: 'bg-purple-500',
      hostsCount: 'bg-indigo-500',
      regularUsersCount: 'bg-gray-500',
      newUsersThisMonth: 'bg-yellow-500',
    };
    return colors[statName] || 'bg-gray-500';
  }
}
