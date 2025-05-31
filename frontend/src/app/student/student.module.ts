import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If any forms were needed
import { StudentRoutingModule } from './student-routing.module';

// ViewMyInfoComponent is standalone, so it's imported via the routing module.
// StudentDashboardComponent is also standalone.

@NgModule({
  declarations: [
    // If you have non-standalone components specific to this module
  ],
  imports: [
    CommonModule,
    StudentRoutingModule,
    FormsModule
  ]
})
export class StudentModule { }
