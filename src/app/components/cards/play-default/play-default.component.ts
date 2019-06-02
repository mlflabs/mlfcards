import { Component, OnInit, StaticProvider } from '@angular/core';
import { StateService } from '../../../services/state.service';
import { DataService } from '../../../services/data.service';
import { NavController, ModalController } from '@ionic/angular';
import { trigger, state, style, animate, transition} from '@angular/animations';
import { sample, sampleSize, pull, without, concat} from 'lodash';
import { CardItem } from '../../../models';
import { environment } from '../../../../environments/environment.prod';

const PRIMARY = 'primary';
@Component({
  selector: 'app-play-default',
  templateUrl: './play-default.component.html',
  styleUrls: ['./play-default.component.scss'],
  animations: [
    trigger('btn1', [
      state('', style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),
      state('closed', style({
        height: '100px',
        opacity: 0.5,
        backgroundColor: 'green'
      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
  ]
})
export class PlayDefaultComponent implements OnInit {


  public gamePoinsRequired = environment.gamePoinsRequired; //how many points before removing card
  public gameEndCardsRemaining = environment.gameEndCardsRemaining;
  public cardCompletionPoints = environment.cardCompletionPoints;
  public playingDate = Date.now();
  public currentAnswerCard = new CardItem();
  public cards:Array<CardItem> = [];
  public currentCards = [];
  public currentOptions = [];
  public slot1 = {};
  public slot2 = {};
  public slot3 = {};
  public slot4 = {};

  //states, progress, answeredTrue, answerdFalse, finished
  gameState = 'progress';
  screen = 'start';


  public btn1Color = 'primary';
  public btn2Color = 'primary';
  public btn3Color = 'primary';
  public btn4Color = 'primary';

  constructor(  public stateService: StateService,
                public navCtr: NavController,
                public modalCtr: ModalController,
                public dataService: DataService) { }

  ngOnInit() {
    this.stateService.waitForReady().subscribe(() => {
      this.loadCards();
    });
  }

  loadCards() {
    //check if we have cards, if  not, go back to project
    if(this.stateService.cards && this.stateService.cards.length > 0) {
      //we have cards, oad them, start game
      this.cards =  this.stateService.cards;
      console.log('CARDS: ', this.cards);
      console.log(this.stateService.selectedProject);
    }
    else if(this.stateService.projectId) {
      //no cards, but have project, return to project page
      this.navCtr.navigateBack('projects/p/' + this.stateService.projectId);
    }
    else {
      this.navCtr.navigateBack('projects/list');
    }

  }

  startGame() {
    console.log('Start Game');
    this.screen = 'play';
    this.prepareCards();
    this.selectRandomCards(null);
  }

  cancelGame () {
    console.log('Cancel Game');
  }

  processAnswer(card) {
    console.log(card);
    console.log(this.slot1, this.slot2, this.slot3, this.slot4);
    console.log(this.currentOptions);
    if(card == null) {
      console.log('Dont Know Choosen');
      this.currentAnswerCard['currentNotKnow']++;
      //do nothing, they can replay card later on

    }
    if(card === this.currentAnswerCard) {
      //add point
      this.currentAnswerCard['currentGamePoints']++;
      this.currentAnswerCard['currentCorrectAnswers']++;

      if(this.currentAnswerCard['currentGamePoints'] === this.gamePoinsRequired) {
        pull(this.currentCards, this.currentAnswerCard);
      }

    }
    else {
      //add point
      this.currentAnswerCard['currentGamePoints']--;
      this.currentAnswerCard['currentWrongAnswers']++;

      if(this.currentAnswerCard['currentGamePoints'] < 0)
        this.currentAnswerCard['currentGamePoints'] = 0;
    }

    //if we go to a super low number, than just end game
    if(this.currentCards.length === this.gameEndCardsRemaining) {
      this.endGame();
    }
    else {
      this.selectRandomCards(this.currentAnswerCard);
    }
  }

  async endGame() {
    this.screen = 'saving';
    await this.stateService.saveGameSession(this.cards);
    this.screen = 'end';
  }

  prepareCards() {
    this.currentCards = concat(this.cards);
    this.currentCards.forEach(c => {
      c.currentGamePoints = 0;
      c.currentWrongAnswers = 0;
      c.currentCorrectAnswers = 0;
      c.currentNotKnow = 0;
    });
  }

  selectRandomCards(lastAnswer) {
    console.log('Select Random Card');
    const tempArray =  concat(this.cards);
    const tempAnswerArray = without(this.currentCards, lastAnswer);
    //console.log('TempAnswerArray:: ', tempAnswerArray);
    this.currentAnswerCard = <CardItem> sample(tempAnswerArray);
    console.log('Current Answer Card: ', this.currentAnswerCard);
    pull(tempArray, this.currentAnswerCard);

    this.currentOptions = sampleSize(concat([], this.currentAnswerCard,
      sampleSize(tempArray, 3)), 4);

    this.slot1 = this.currentOptions[1];
    this.slot2 = this.currentOptions[2];
    this.slot3 = this.currentOptions[3];
    this.slot4 = this.currentOptions[0];
    console.log(this.currentOptions);
    //console.log(this.slot1, this.slot2, this.slot3, this.slot4);
  }

}
