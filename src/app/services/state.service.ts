import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';
import { NavController } from '../../../node_modules/@ionic/angular';
import { Router } from '../../../node_modules/@angular/router';
import { filter, debounceTime } from 'rxjs/operators';
import { saveIntoArray } from '../utils';
import { CARD_COLLECTION } from '../models';


@Injectable({
  providedIn: 'root'
})
export class StateService {

  // public nodes$: BehaviorSubject<Array<EventItem>> = new BehaviorSubject(this._nodes);

  // currentURl
  private _url = '';
  url$: BehaviorSubject<string> = new BehaviorSubject(this.url);
  prevUrl = '';
  pageType$: BehaviorSubject<string> = new BehaviorSubject('');

  // project
  private _selectedProject = null;
  public selectedProject$:BehaviorSubject<any> =  new BehaviorSubject(this._selectedProject);

  // groups
  private _cards = [];
  public cards$: BehaviorSubject<any> = new BehaviorSubject(this.cards);


  // subscriptions
  private cardSubscription;

  constructor(public dataService: DataService,
              public router: Router,
              public navCtr: NavController) {


  }

  public get selectedProject() {
    return this._selectedProject;
  }
  public set  selectedProject(value) {
    console.log('Set Project::: ', value);
    //project change, need to make our
    console.log('Old projectid: ', this.projectId);
    if(this.cardSubscription && !this.cardSubscription.closed)
      this.cardSubscription.unsubscribe();

    this._selectedProject = value;
    this.selectedProject$.next(value);
    this.refreshCards();
    console.log('New ProjectID: ', this.projectId);


    if(this.projectId)
      this.cardSubscription = this.dataService.subscribeProjectCollectionChanges(this.projectId, CARD_COLLECTION)
        .subscribe(card => {
          console.log('Subscribe card changes::: ', card);
          if(card._deleted) {
            this.cards = this.cards.filter(c => c._id !== card._id);
          }
          else {
            this.cards = saveIntoArray(card, this.cards);
          }
      });

  }

  async refreshCards() {
    console.log('Refresh Cards::::');
    // project changed, so we need to modify groups
    if(this.selectedProject) {
      const c = await this.dataService.getAllByProjectAndType(this.projectId, CARD_COLLECTION);
      this.cards = c.sort((a,b) => {
        if(a['side1'] < b['side1']) {
          return -1;
        }
        else if( a['side1'] > b['side1']) {
            return 1;
        }
        else {
            return 0;
        }
      });
    }
    else {
      this.cards = [];
    }
  }

  public get projectId() {
    if(this.selectedProject)
      return this._selectedProject.childId;
    return null;
  }

  public get url() {
    return this._url;
  }
  public set url(value) {
    this._url = value;
    this.url$.next(value);
  }

  public get cards() {
    return this._cards;
  }
  public set cards(value) {
    this._cards = value;
    this.cards$.next(this.cards);
  }

}
