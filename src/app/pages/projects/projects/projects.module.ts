import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProjectsPage } from './projects.page';
import { ProjectsEditPageModule } from '../project-edit/project-edit.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectsPage
  }
];

@NgModule({
  declarations: [
    ProjectsPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjectsEditPageModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [

  ]
})
export class ProjectsPageModule {}
