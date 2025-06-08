import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './auth.guard';
import { DevisComponent } from './pages/devis/devis.component';
import { AddDevisComponent } from './pages/add-devis/add-devis.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { DevisDetailsComponent } from './pages/devis-details/devis-details.component';
import { AgendaComponent } from './pages/agenda/agenda.component';
import { RegisterComponent } from './pages/register/register.component';
import { UsersComponent } from './pages/users/users.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { ProfileDashboardComponent } from './pages/profiles/profiles.component';
import { ProfileFormComponent } from './pages/profile-form/profile-form.component';
import { ProfileDetailsComponent } from './pages/profile-details/profile-details.component';
import { ProfileViewComponent } from './pages/profile-view/profile-view.component';
import { ActivitiesComponent } from './pages/activities/activities.component';

const routes: Routes = [
  { path: '', component:MainLayoutComponent,canActivate: [AuthGuard] ,
    children: [
      { path: 'devis', component: DevisComponent },
      { path: 'add-devis', component: AddDevisComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'devis-details/:id', component: DevisDetailsComponent },
      { path: 'agenda', component: AgendaComponent },
      { path: 'users', component: UsersComponent },
      { path: 'users/:id', component: UserProfileComponent },
      { path: 'profiles', component: ProfileDashboardComponent },
      { path: 'profiles/add', component: ProfileFormComponent },
      { path: 'profiles/:id', component: ProfileDetailsComponent },
      { path: 'myprofile', component: ProfileViewComponent },
      { path: 'activities', component: ActivitiesComponent }
    ]
  },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
