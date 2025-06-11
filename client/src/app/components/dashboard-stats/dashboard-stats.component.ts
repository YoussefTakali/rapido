import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardDataService } from 'src/app/services/dashboard-data.service';

export interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.css']
})
export class DashboardStatsComponent implements OnInit, OnDestroy {
  stats: StatCard[] = [];
  private statsSub!: Subscription;

  constructor(
    private authService: AuthService,
    private dashboardDataService: DashboardDataService
  ) {}

  ngOnInit() {
    // Trigger fetch of stats (calls backend etc.)
    this.dashboardDataService.fetchStats();

    // Subscribe to stats observable to get updates
    this.statsSub = this.dashboardDataService.stats$.subscribe(
      (newStats) => {
        if (newStats) {
          this.stats = newStats;
        }
      }
    );
  }

  ngOnDestroy() {
    this.statsSub.unsubscribe();
  }
}