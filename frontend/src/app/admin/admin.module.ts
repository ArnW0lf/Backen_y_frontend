import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // RouterModule is often imported by routing modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
// Components used in admin routes are typically standalone or declared here if not.
// Since AdminDashboardComponent, StudentListComponent, StudentCreateComponent are/will be standalone,
// they don't need to be declared in this AdminModule.
// They are imported by AdminRoutingModule.

@NgModule({
  declarations: [
    // If you have non-standalone components specific to this module, declare them here.
  ],
  imports: [
    CommonModule,
    AdminRoutingModule, // Handles routing within the admin module
    FormsModule,        // For template-driven forms
    ReactiveFormsModule // For reactive forms
    // HttpClientModule is usually provided in root (app.config.ts)
  ]
})
export class AdminModule { }
