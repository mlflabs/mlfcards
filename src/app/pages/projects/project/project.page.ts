import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { StateService } from '../../../services/state.service';
import { DataService } from '../../../services/data.service';
import { ProjectEditPage } from '../project-edit/project-edit.page';
import { EditCardComponent } from '../../../components/cards/edit-card/edit-card.component';
import { ACTION_SAVE, ACTION_REMOVE, CARD_COLLECTION, ProjectItem } from '../../../models';


@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectPage implements OnInit, OnDestroy {

  name = '';
  _project = new ProjectItem();
  cards = [];
  private _projectSub;
  private _cardSub;

  constructor(public route: ActivatedRoute,
              public navCtr: NavController,
              public modalController: ModalController,
              public state: StateService,
              public dataService: DataService,
              public cdr: ChangeDetectorRef) { }



  async ngOnInit() {
    console.log('Project init');
    //const id = this.route.snapshot.paramMap.get('id');

    this.state.waitForReady().subscribe(() => {
      console.log('Setting project subscripitons');
      this._cardSub = this.state.cards$.subscribe(cards => {
        console.log('Project cards subscription', cards);
        this.cards = cards;
        this.cdr.detectChanges();
      });

      this._projectSub = this.state.selectedProject$
        .subscribe(project => {
          if(project == null)
            return;

          console.log('PROJECTS PAGE PROJECT::: ', project);
          if(!project._deleted) {
            this.refresh(project);
          }
          else {
            this.navCtr.navigateRoot('/');
          }
      });

      //now just load it
      this.refresh(this.state.selectedProject || new ProjectItem());
      this.cards = this.state.cards;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if(this._projectSub && !this._projectSub.closed)
      this._projectSub.unsubscribe();
    if(this._cardSub && !this._cardSub.closed)
      this._cardSub.unsubscribe();
  }

  async refresh(project) {
    this.name = project.name;
    this._project = project;
    this.cdr.detectChanges();
  }

  async play() {
    this.navCtr.navigateForward('projects/p/'+ this._project._id + '/play');
  }

  async edit(card = {}) {
    const modal = await this.modalController.create({
      component: EditCardComponent,
      componentProps: { item: card, showHeader: true}
    });
    modal.present();
    const res = await modal.onDidDismiss();
    const data = res.data || null;
    if(data) {
      if(data['action'] === ACTION_SAVE) {
        console.log('Saving:: ', data.item, this._project, CARD_COLLECTION);
        this.dataService.saveCard( data.item, this._project);
      }
      else if(data['action'] === ACTION_REMOVE && data['item']) {
        this.dataService.remove(data.item);
      }
    }
  }


}
