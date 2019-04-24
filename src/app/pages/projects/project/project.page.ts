import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { StateService } from '../../../services/state.service';
import { DataService } from '../../../services/data.service';
import { ProjectEditPage } from '../project-edit/project-edit.page';
import { EditCardComponent } from '../../../components/cards/edit-card/edit-card.component';
import { ACTION_SAVE, ACTION_REMOVE, CARD_COLLECTION } from '../../../models';
import { isNgTemplate } from '../../../../../node_modules/@angular/compiler';
import { CardComponent } from '../../../components/cards/card/card.component';
import { PlayDefaultComponent } from '../../../components/cards/play-default/play-default.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage implements OnInit, OnDestroy {

  name = '';
  _project;
  cards = [];
  private _projectSub;
  private _cardSub;

  constructor(public route: ActivatedRoute,
              public navCtr: NavController,
              public modalController: ModalController,
              public state: StateService,
              public dataService: DataService) { }



  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if(id) {
      const project = await this.dataService.getDoc(id);

      if(project) {
        this.refresh(project);
      }
      else {
        this.navCtr.back();
      }
    }
    else {
      //redirect to projects
      this.navCtr.back();
    }

    this._cardSub = this.state.cards$.subscribe(cards => {
       this.cards = cards;
    });

    this._projectSub = this.dataService.subscribeProjectsChanges()
      .subscribe(project => {
        if(project._id === this._project._id) {
          if(!project._deleted) {
            this.refresh(project);
          }
          else {
            this.navCtr.navigateRoot('/');
          }
        }
    });

  }

  ngOnDestroy(): void {
    this._projectSub.unsubscribe();
    this._cardSub.unsubscribe();

  }

  async refresh(project) {
    this.state.selectedProject = project;
    this.name = project.name;
    this._project = project;

    // load project cards

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
        this.dataService.saveInProject( data.item,
                                        this._project,
                                        CARD_COLLECTION);
      }
      else if(data['action'] === ACTION_REMOVE && data['item']) {
        this.dataService.remove(data.item);
      }
    }
  }


}
