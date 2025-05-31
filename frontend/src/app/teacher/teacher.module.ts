import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // For forms
import { TeacherRoutingModule } from './teacher-routing.module';

// Components like ManageGradesComponent will be standalone and imported by the routing module.
// TeacherDashboardComponent is also standalone.

@NgModule({
  declarations: [
    // If you have non-standalone components specific to this module, declare them here.
  ],
  imports: [
    CommonModule,
    TeacherRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TeacherModule { }
