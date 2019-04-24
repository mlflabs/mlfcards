import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';


import { ProjectEditComponent } from '../../../components/projects/project-edit/project-edit.component';
import { ProjectEditPage } from '../project-edit/project-edit.page';



@NgModule({
  declarations: [
    ProjectEditPage,
    ProjectEditComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  entryComponents: [
    ProjectEditPage,
  ],
  exports: [
    ProjectEditPage,
    ProjectEditComponent,
  ]
})
export class ProjectsEditPageModule {}
