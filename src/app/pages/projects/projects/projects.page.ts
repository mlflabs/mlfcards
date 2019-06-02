import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { StateService } from '../../../services/state.service';
import { ModalController, NavController } from '@ionic/angular';
import { waitMS } from '../../../utils';
import { PROJECT_SERVICE, PROJECT_INDEX_SERVICE, ProjectItem } from '../../../models';
import { ProjectEditPage } from '../project-edit/project-edit.page';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsPage implements OnInit, OnDestroy {

  public items = [];
  public item;
  public subscription;

  constructor(public dataService: DataService,
              public state: StateService,
              public modalController: ModalController,
              public navCtr: NavController,
              public cdr: ChangeDetectorRef) { }

  async ngOnInit() {
    console.log('Projects init');
    this.state.waitForReady().subscribe(() => {
      console.log('Projects init, ready');
      this.subscription = this.dataService.subscribeProjectsChanges()
        .subscribe(doc => {
          this.refresh();
        });
      this.refresh();
    });
  }

  selectItem(item) {
    console.log('Project Selected: ', item);
    this.navCtr.navigateForward('projects/p/'+item._id);

  }

  async refresh() {
    this.items = await this.dataService.getAllByProjectAndType(PROJECT_SERVICE, PROJECT_INDEX_SERVICE);
    this.cdr.detectChanges();
  }



  async addnew() {
    const modal = await this.modalController.create({
      component: ProjectEditPage,
      componentProps: { item: new ProjectItem }
    });
    const res = await modal.present();
  }

  async edit(item) {
    //TODO
  }

  removeItem(doc) {
    //TODO: we need to remove all the associated records with this.
    this.dataService.remove(doc._id);
  }

  ngOnDestroy() {
    console.log('Projects OnDestroy');
    this.subscription.unsubscribe();
  }

}
