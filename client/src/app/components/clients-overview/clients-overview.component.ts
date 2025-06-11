import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AuthService } from 'src/app/services/auth.service';
import { ClientService } from 'src/app/services/client.service';

Chart.register(...registerables);

@Component({
  selector: 'app-clients-overview',
  templateUrl: './clients-overview.component.html',
  styleUrls: ['./clients-overview.component.css']
})
export class ClientsOverviewComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
constructor(private clientService: ClientService,private authService : AuthService) {}
  monthlyCounts: number[] = [0, 0, 0, 0, 0, 0]; // For Jan to Jun
  role = this.authService.getUser()?.role;
  isAdmin = this.role === 'ADMIN';
ngOnInit() {
  if (this.isAdmin) {
  this.clientService.getClients().subscribe(clients => {
    const monthlyCounts = this.countClientsByMonth(clients);
    this.createChart(monthlyCounts);
  });}else {
    const userId = this.authService.getUser()?.id;
    if (userId) {
      this.clientService.getClientsByUser(userId).subscribe(clients => {
        const monthlyCounts = this.countClientsByMonth(clients);
        this.createChart(monthlyCounts);
      });
    }
  }
}
private countClientsByMonth(clients: any[]): number[] {
  const monthMap = new Map<number, number>();

  // Initialize all months (Jan to Jun in this case)
  for (let i = 0; i < 6; i++) {
    monthMap.set(i, 0);
  }

  clients.forEach(client => {
    const date = new Date(client.createdAt);
    const month = date.getMonth(); // 0 = Jan, 1 = Feb, ..., 11 = Dec

    if (monthMap.has(month)) {
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    }
  });

  // Return data for Jan to Jun (adjust if more months are needed)
  return [0, 1, 2, 3, 4, 5].map(m => monthMap.get(m) || 0);
}

private createChart(data: number[]) {
  const ctx = this.chartCanvas.nativeElement.getContext('2d');
  if (!ctx) return;

  if (this.chart) {
    this.chart.destroy();
  }

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Clients',
        data: data,
        backgroundColor: '#667eea',
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          display: false
        }
      }
    }
  };

  this.chart = new Chart(ctx, config);
}

}