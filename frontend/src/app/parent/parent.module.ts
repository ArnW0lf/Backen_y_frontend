import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If any forms were needed
import { ParentRoutingModule } from './parent-routing.module';

// ViewChildrensInfoComponent is standalone.
// ParentDashboardComponent is also standalone.

@NgModule({
  declarations: [
    // If you have non-standalone components specific to this module
  ],
  imports: [
    CommonModule,
    ParentRoutingModule,
    FormsModule
  ]
})
export class ParentModule { }
