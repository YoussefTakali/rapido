import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/authinterceptor';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DevisComponent } from './pages/devis/devis.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { AddDevisComponent } from './pages/add-devis/add-devis.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { DevisDetailsComponent } from './pages/devis-details/devis-details.component';
import { AgendaComponent } from './pages/agenda/agenda.component';
import { RegisterComponent } from './pages/register/register.component';
import { UsersComponent } from './pages/users/users.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { ProfileDashboardComponent } from './pages/profiles/profiles.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProfileFormComponent } from './pages/profile-form/profile-form.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfileDetailsComponent } from './pages/profile-details/profile-details.component';
import { ProfileViewComponent } from './pages/profile-view/profile-view.component';
import { ActivitiesComponent } from './pages/activities/activities.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { VolumeCalculatorComponent } from './pages/volume-calculator/volume-calculator.component';
import { DevisMailComponent } from './components/devis-mail/devis-mail.component';
import { ReplacePipe } from './pipes/replace-pipe';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardShellComponent } from './components/dashboard-shell/dashboard-shell.component';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentQuotesComponent } from './components/recent-quotes/recent-quotes.component';
import { UpcomingEventsComponent } from './components/upcoming-events/upcoming-events.component';
import { ClientsOverviewComponent } from './components/clients-overview/clients-overview.component';
import { QuoteStatusChartComponent } from './components/quote-status-chart/quote-status-chart.component';
import { NotificationPanelComponent } from './components/notification-panel/notification-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    MainLayoutComponent,
    LoginComponent,
    DevisComponent,
    AddDevisComponent,
    ClientsComponent,
    DevisDetailsComponent,
    AgendaComponent,
    RegisterComponent,
    UsersComponent,
    UserProfileComponent,
    ProfileDashboardComponent,
    ProfileFormComponent,
    ProfileDetailsComponent,
    ProfileViewComponent,
    ActivitiesComponent,
    VolumeCalculatorComponent,
    ReplacePipe,
    DevisMailComponent,
    DashboardComponent,
    DashboardHeaderComponent,
    DashboardShellComponent,
    DashboardStatsComponent,
    RecentQuotesComponent,
    UpcomingEventsComponent,
    ClientsOverviewComponent,
    QuoteStatusChartComponent,
    NotificationPanelComponent],
  imports: [
    MatSnackBarModule,
    ReactiveFormsModule,
    NgxSliderModule,
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
