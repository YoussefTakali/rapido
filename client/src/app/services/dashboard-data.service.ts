import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { StatCard } from "../components/dashboard-stats/dashboard-stats.component";
import { DevisService } from "./devis.service";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";
import { ApiCalendarEvent, CalendarEventService } from "./calendar-event.service";

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private statsSubject = new BehaviorSubject<StatCard[]>([]);
  stats$ = this.statsSubject.asObservable();

  constructor(
    private devisService: DevisService,
    private authService: AuthService,
    private userService: UserService,
    private calendarService : CalendarEventService
  ) {}

  fetchStats() {
    const role = this.authService.getUser()?.role;
    const userId = this.authService.getUser()?.id;

    if (role === 'ADMIN') {
      this.devisService.getAllDevis().subscribe(devisData => {
        this.userService.getUsers().subscribe(users => {
          const pendingUsers = users.filter(u => !u.profiles || u.profiles.length === 0);
          const processedStats: StatCard[] = this.processAdminStats(devisData, pendingUsers.length);
          this.statsSubject.next(processedStats);
        });
      });
    } else if (userId) {
      this.devisService.getDevisById(userId).subscribe(devisData => {
        this.calendarService.findAllByUser(userId).subscribe(events => {
          const processedStats: StatCard[] = this.processUserStats(devisData, events);
          this.statsSubject.next(processedStats);
        });
      });
    }
  }

 private processAdminStats(devisData: any[], pendingApprovals: number): StatCard[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const totalQuotesThisMonth = devisData.filter(d => {
    const date = new Date(d.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const totalQuotesLastMonth = devisData.filter(d => {
    const date = new Date(d.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  }).length;

  const quoteChangePercent = totalQuotesLastMonth === 0
    ? 100
    : ((totalQuotesThisMonth - totalQuotesLastMonth) / totalQuotesLastMonth) * 100;

  const formattedChange = (quoteChangePercent >= 0 ? '+' : '') + quoteChangePercent.toFixed(1) + '% from last month';

  const activeClients = new Set(
    devisData
      .filter(d => {
        const date = new Date(d.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .map(d => d.clientId)
  ).size;
 console.log('Active Clients:', devisData);
  const totalRevenue = devisData
    .filter(d => d.etat === 'GAGNE')
    .reduce((sum, d) => sum + (d.prixDevis || 0), 0);

  return [
    {
      title: 'Total Quotes',
      value: totalQuotesThisMonth.toString(),
      change: formattedChange,
      icon: 'fas fa-file-alt'
    },
    {
      title: 'Total Revenue',
      value: `€${Number(totalRevenue).toLocaleString()}`,
      change: 'Based on won quotes',
      icon: 'fas fa-euro-sign'
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals.toString(),
      change: 'New this week',
      icon: 'fas fa-clock'
    },
    {
      title: 'Active Clients',
      value: activeClients.toString(),
      change: 'Current month',
      icon: 'fas fa-users'
    }
  ];
}

private isWithinNext7Weeks(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const sevenWeeksLater = new Date();
  sevenWeeksLater.setDate(now.getDate() + 7 * 7); // 49 days ahead
  return date >= now && date <= sevenWeeksLater;
}

private processUserStats(devisData: any[], events: ApiCalendarEvent[]): StatCard[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter devis for current user
  const userId = this.authService.getUser()?.id;
  const userDevis = devisData.filter(d => d.userId === userId);

  // Total quotes
  const totalQuotes = userDevis.length;

  // Quotes this and last month
  const quotesThisMonth = userDevis.filter(d => {
    const date = new Date(d.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const quotesLastMonth = userDevis.filter(d => {
    const date = new Date(d.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  }).length;

  const quoteChangePercent = quotesLastMonth === 0
    ? (quotesThisMonth > 0 ? 100 : 0)
    : ((quotesThisMonth - quotesLastMonth) / quotesLastMonth) * 100;

  const formattedQuoteChange = (quoteChangePercent >= 0 ? '+' : '') + 
                            quoteChangePercent.toFixed(1) + '% from last month';

  // Revenue calculations
  const revenue = userDevis
    .filter(d => d.etat === 'GAGNE')
    .reduce((sum, d) => sum + (d.prixDevis || 0), 0);

  const revenueThisMonth = userDevis
    .filter(d => {
      const date = new Date(d.date);
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear && 
             d.etat === 'GAGNE';
    })
    .reduce((sum, d) => sum + (d.prixDevis || 0), 0);

  const revenueLastMonth = userDevis
    .filter(d => {
      const date = new Date(d.date);
      return date.getMonth() === lastMonth && 
             date.getFullYear() === lastMonthYear && 
             d.etat === 'GAGNE';
    })
    .reduce((sum, d) => sum + (d.prixDevis || 0), 0);

  const revenueChangePercent = revenueLastMonth === 0
    ? (revenueThisMonth > 0 ? 100 : 0)
    : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

  const formattedRevenueChange = (revenueChangePercent >= 0 ? '+' : '') + 
                              revenueChangePercent.toFixed(1) + '% from last month';

  // Upcoming moves (next 7 days)
  const upcomingMoves = userDevis.filter(d => {
    const moveDateLivraison = d.dateLivraison ? new Date(d.dateLivraison) : null;
    const moveDateDepart = d.dateDepart ? new Date(d.dateDepart) : null;
    return (moveDateLivraison && this.isUpcoming(moveDateLivraison.toISOString())) ||
           (moveDateDepart && this.isUpcoming(moveDateDepart.toISOString()));
  }).length;

  // Upcoming events from calendar (next 7 weeks)
  const upcomingEvents = events.filter(e => this.isWithinNext7Weeks(e.startDateTime)).length;

  return [
    {
      title: 'My Quotes',
      value: totalQuotes.toString(),
      change: formattedQuoteChange,
      icon: 'fas fa-file-alt',
    },
    {
      title: 'My Revenue',
      value: `€${Number(revenue).toLocaleString()}`,
      change: formattedRevenueChange,
      icon: 'fas fa-euro-sign',
    },
    {
      title: 'Upcoming Moves',
      value: upcomingMoves.toString(),
      change: 'Next 7 days',
      icon: 'fas fa-truck-moving'
    },
    {
      title: 'Upcoming Events',
      value: upcomingEvents.toString(),
      change: 'Next 7 weeks',
      icon: 'fas fa-calendar-alt' 
    }
  ];
}


  private isUpcoming(dateStr: string): boolean {
    const date = new Date(dateStr);
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    return date >= now && date <= sevenDaysLater;
  }
}
