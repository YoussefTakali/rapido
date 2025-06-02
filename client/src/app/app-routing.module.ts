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

const routes: Routes = [
  { path: '', component:MainLayoutComponent,canActivate: [AuthGuard] ,
    children: [
      { path: 'devis', component: DevisComponent },
      { path: 'add-devis', component: AddDevisComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'devis-details/:id', component: DevisDetailsComponent },
      { path: 'agenda', component: AgendaComponent },


    ]
  },
     { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
