import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { DataService } from './data.service';
import { NavController } from '@ionic/angular';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, debounceTime, first } from 'rxjs/operators';
import { saveIntoArray, Utils } from '../utils';
import { CARD_COLLECTION, CardItem } from '../models';
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { addDays } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  // public nodes$: BehaviorSubject<Array<EventItem>> = new BehaviorSubject(this._nodes);
  urlEncoded = new HttpUrlEncodingCodec();

  // currentURl/state
  private _stateReady = false;
  private _stateReady$ = new BehaviorSubject(this._stateReady);
  private _url = '';
  url$: BehaviorSubject<string> = new BehaviorSubject(this.url);
  prevUrl = '';
  pageType$: BehaviorSubject<string> = new BehaviorSubject('');

  // project
  private _selectedProject = null;
  private _prevProjectid = null;
  public selectedProject$:BehaviorSubject<any> =  new BehaviorSubject(this._selectedProject);

  // groups
  private _cards = [];
  public cards$: BehaviorSubject<any> = new BehaviorSubject(this.cards);

  // subscriptions
  private cardSubscription;
  private projectSubscription;

  constructor(public dataService: DataService,
              public router: Router,
              public route: ActivatedRoute,
              public navCtr: NavController) {
      this.dataService.waitForReady()
                .subscribe( async ()=> {
                  this.addListener();
                  await this.processURL(router.routerState.snapshot.url);
                  this._stateReady = true;
                  this._stateReady$.next(true);
                });
  }

  async processURL(url) {
    console.log('Processing URL: ', url);
    this.prevUrl = this.url;
    this.url = url;
    //this.prevUrl = this.url.substring(0, this.url.lastIndexOf('/'));
    console.log(this.url, this.prevUrl);

    if(this.url.startsWith('/projects/list')) {
      console.log('We are in Projec ts');
      this.selectedProject = null;
      this.pageType$.next('projects');
    }

    if(this.url.startsWith('/projects/p/')) {
      const id = this.urlEncoded.decodeValue(this.url.split('/')[3]);
      console.log('Loading Project: ', id);
      await this.loadNewProject(id);
    }
  }

  addListener() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.processURL(e.urlAfterRedirects);
      });
  }

  async loadNewProject(id) {
    try {
      const project = await this.dataService.getDoc(id);
      console.log('LOAD NEW PROJECT::: ', project);
      this.selectedProject = project;
    }
    catch(e) {
      //couldn't load project, go to list
      //need to show error
      console.log('ERROR: ', e.message);
    }
  }

  public get selectedProject() {
    return this._selectedProject;
  }

  public set  selectedProject(value) {
    console.log('New Project::: ', value);

    if(value == null) {
      console.log('Project is NULL');
      this._selectedProject = null;
      this.selectedProject$.next(null);
      return;
    }
    //project change, need to make our
    console.log('Old projectid: ', this.projectId);
    //new project or update
    let forceRefresh = false;
    console.log(value);
    if(this.selectedProject == null) {
      forceRefresh = true;
    }
    else {
      if(value._id !== this.selectedProject._id)
        forceRefresh = true;
    }
    console.log(forceRefresh);
    this._selectedProject = value;
    this.selectedProject$.next(this._selectedProject);

    if(forceRefresh) {
      console.log('New Project, reload dependencies');
      this.loadProjectDependencies();
    }
  }

  loadProjectDependencies() {
    //close previous subs
    if(this.cardSubscription && !this.cardSubscription.closed)
      this.cardSubscription.unsubscribe();
    if(this.projectSubscription && !this.projectSubscription.closed)
      this.projectSubscription.unsubscribe();

    this.refreshCards();
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

    this.projectSubscription = this.dataService.subscribeDocChanges(this.selectedProject._id)
      .subscribe(p => {
        this.selectedProject = p;
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

    console.log(this.cards);
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

  public async saveGameSession(cards:Array<CardItem>) {
    const endDate = Date.now();

    cards.forEach( async c => {
      if(!c.sessions) c.sessions = {};
      if(!c.proficiencyLevel) c.proficiencyLevel = 0;

      c.sessions[endDate] = {
        gamePoints: c.currentGamePoints,
        wrongAnswers: c.currentWrongAnswers,
        correctAnswers: c.currentCorrectAnswers,
        notKnow: c.currentNotKnow
      };

      // calculate stats, and see which profficiency level we end up with
      //see if we got any wrong answers
      if(c.currentWrongAnswers === 0) {
        //did we get all game pooints required
        if(c.currentGamePoints === environment.gamePoinsRequired) {
          // lets move up a level, if level is 0, card is finished,
          // no more studying
          c.proficiencyLevel++;
          if(environment.proficiencyLevels.length === c.proficiencyLevel) {
            //this means we are at the highest level, mark card finsihed
            c.studyFinished = true;
          }
        }
      }
      else {
        // how many wrong answers did we get
        if(c.currentCorrectAnswers > environment.proficiencyLevelWrongAnswerCountDecrese) {
          if(c.proficiencyLevel > 0) c.proficiencyLevel--;//dont go under 0
        }
      }

      //calculate next study session date
      c.lastStudySession = endDate;
      c.nextStudySession = addDays(new Date(endDate),
        environment.proficiencyLevels[c.proficiencyLevel]).getTime();

      //remove old game stats
      delete c.currentGamePoints;
      delete c.currentWrongAnswers;
      delete c.currentCorrectAnswers;
      delete c.currentNotKnow;

      await this.dataService.save(c);

    });
  }



  waitForReady(): Observable<any> {
    console.log('State, waitForReady');
    return this._stateReady$.pipe(
      first( ready => ready === true)
    );
  }

}
