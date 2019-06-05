import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProjectPage } from './project.page';
import { ProjectsEditPageModule } from '../project-edit/project-edit.module';
import { CardsModule } from '../../../components/cards/cards.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectPage
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardsModule,
    ProjectsEditPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ProjectPage
  ],
  entryComponents: [
  ]
})
export class ProjectPageModule {}
