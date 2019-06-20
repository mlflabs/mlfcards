import {
  Component,
  OnInit,
  Input,
  Output,
  ChangeDetectorRef,
  ChangeDetectionStrategy, } from '@angular/core';
import { CardItem,PROJECT_INDEX_SERVICE, PROJECT_SERVICE, getProjectIdFromChildId } from '../../../models';
import { ModalController, AlertController } from '@ionic/angular';
import { DataService } from '../../../services/data.service';
import { compact, uniqBy } from 'lodash';

@Component({
  selector: 'app-edit-card',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditCardComponent implements OnInit {
  @Input() showHeader = false;
  @Input() item:CardItem = new CardItem();
  @Input() projects = [];
  public selectedProject:string;

  constructor(public modalController: ModalController,
              public alertCtr: AlertController,
              public cdr: ChangeDetectorRef,
              public dataService: DataService,) { }

  async ngOnInit() {
    if(this.projects.length === 0) {
      this.projects = await this.dataService.getAllByProjectAndType(PROJECT_SERVICE, PROJECT_INDEX_SERVICE);
    }
    console.log('Projects: ', this.projects);
    this.projects.sort( (a, b) => {
      if(a.name === 'Default') return -1;
      if(b.name === 'Default') return 1;
      if(a.name < b.name) return -1;
      return 1;
    });
    //select the default one
    this.selectedProject = getProjectIdFromChildId(this.item._id) || 'p|default';
    console.log('Selected Project: ', this.selectedProject);
    this.cdr.detectChanges();
  }

  async save() {
    //see if we are changing project id
    //first see if its a new id
    if(this.item._id) {
      const childid = getProjectIdFromChildId(this.item._id);
      if(this.selectedProject !== childid) {
        console.log('Project changed');
        //first delete the project, and make a new one with new project id
        const aId = this.item._id.split('|');
        aId[1] = this.selectedProject.split('|')[1];
        const newDoc = {...this.item, ...{_id: aId.join('|')} };
        delete newDoc._rev;
        console.log('New Doc:: ', newDoc);
        this.dataService.saveCard( newDoc );
        this.dataService.remove(this.item);
        this.modalController.dismiss();
        return;
      }
    }
    else {
      //we have a new project, lets make sure its not a duplicate
      const cards = await this.dataService.findCardBySide1(this.item.side1);
      console.log('Duplicate Cards: ', cards);
      if(cards.length > 0) {
        //get projects that these cards belong to
        const projects = [];
        for(let i=0;i<cards.length; i++) {
          const p = await this.dataService.getProjectFromChildId(cards[i]._id);
          projects.push(p);
        }
        console.log('Duplicate Projects: ', projects);
        let pstring = '';
        const uniqP = uniqBy(projects, 'name');

        uniqP.forEach((p, i) => {
          if(i === uniqP.length - 1 && i > 0) {
            pstring += ' and '+ p.name;
          }
          else if(i === 0) {
            pstring = p.name;
          }
          else if(i === uniqP.length - 2) {
            pstring += p.name;
          }
          else {
            pstring += p.name + ', ';
          }
        });

        const alert = await this.alertCtr.create( {
          header: 'Duplicate Card',
          subHeader: 'Are you sure you still want to create it?',
          message: 'You have a similar card in following study lists: ' + pstring,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
                console.log('Confirm Cancel: ');
                this.modalController.dismiss();
              }
            }, {
              text: 'Create',
              handler: () => {
                console.log('Confirm Okay');
                this.dataService.saveCard( this.item);
                this.modalController.dismiss();
              }
            }
          ]
        });
        return alert.present();
      }
    }
    console.log('No project Change: ', this.item);
    this.dataService.saveCard( this.item);
    this.modalController.dismiss();
  }

  listChanged(e) {
    console.log(e);
    console.log( this.selectedProject );
  }

  remove() {
    this.dataService.remove(this.item);
    this.modalController.dismiss();
  }

  close() {
    this.modalController.dismiss();
  }

}
