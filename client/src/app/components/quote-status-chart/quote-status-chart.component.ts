import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DevisService } from 'src/app/services/devis.service';

Chart.register(...registerables);

@Component({
  selector: 'app-quote-status-chart',
  templateUrl: './quote-status-chart.component.html',
  styleUrls: ['./quote-status-chart.component.css']
})
export class QuoteStatusChartComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
  private subscription!: Subscription;

  legendData = [
    { name: 'GAGNE', color: '#10b981' },
    { name: 'PERDU', color: '#ef4444' },
    { name: 'ENVOYEE', color: '#3b82f6' },
    { name: 'EN_COURS', color: '#f59e0b' },
    { name: 'BROUILLON', color: '#6b7280' }
  ];

  constructor(private quoteService: DevisService, private authService: AuthService) {}
  role = this.authService.getUser()?.role;
  isAdmin = this.role === 'ADMIN';
  ngOnInit() {
    this.loadChartData();
  }

  private loadChartData() {
    if (!this.isAdmin) {
      // If not admin, fetch quotes for the current user
      const userId = this.authService.getUser()?.id;
      if (userId) {
        this.subscription = this.quoteService.getDevisById(userId).subscribe(quotes => {
          const statusCounts = this.countByStatus(quotes);
          this.createChart(statusCounts);
        });
        return;
      }
    }
    this.subscription = this.quoteService.getAllDevis().subscribe(quotes => {
      const statusCounts = this.countByStatus(quotes);
      this.createChart(statusCounts);
    });
  }

  private countByStatus(quotes: any[]): number[] {
    const counts = {
      GAGNE: 0,
      PERDU: 0,
      ENVOYEE: 0,
      EN_COURS: 0,
      BROUILLON: 0
    };

    quotes.forEach(quote => {
      const status = quote.etat?.toUpperCase();
      if (counts.hasOwnProperty(status)) {
        counts[status as keyof typeof counts]++;
      }
    });

    // Return counts as array matching the legend order
    return [
      counts.GAGNE,
      counts.PERDU,
      counts.ENVOYEE,
      counts.EN_COURS,
      counts.BROUILLON
    ];
  }

  private createChart(data: number[]) {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // If chart exists, destroy it before creating new one
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.legendData.map(item => item.name),
        datasets: [{
          data: data,
          backgroundColor: this.legendData.map(item => item.color),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
