import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentDashboardComponent } from '../components/dashboards/parent-dashboard.component';
import { ViewChildrensInfoComponent } from './components/view-childrens-info/view-childrens-info.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ParentDashboardComponent },
  { path: 'childrens-information', component: ViewChildrensInfoComponent },
  // Add other parent-specific routes here
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParentRoutingModule { }
