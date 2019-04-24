import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProjectPage } from './project.page';
import { ProjectEditPage } from '../project-edit/project-edit.page';
import { ProjectsEditPageModule } from '../project-edit/project-edit.module';
import { CardsModule } from '../../../components/cards/cards.module';
import { EditCardComponent } from '../../../components/cards/edit-card/edit-card.component';
import { PlayDefaultComponent } from '../../../components/cards/play-default/play-default.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectPage
  },
  { path: 'play', component: PlayDefaultComponent },
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
    EditCardComponent
  ]
})
export class ProjectPageModule {}
