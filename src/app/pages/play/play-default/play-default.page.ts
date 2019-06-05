import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { StateService } from '../../../services/state.service';
import { DataService } from '../../../services/data.service';
import { NavController, ModalController } from '@ionic/angular';
import { trigger, state, style, animate, transition} from '@angular/animations';
import { sample, sampleSize, pull, without, concat, findIndex} from 'lodash';
import { CardItem } from '../../../models';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-play-default',
  templateUrl: './play-default.page.html',
  styleUrls: ['./play-default.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class PlayDefaultPage implements OnInit {


  //public gamePoinsRequired = environment.gamePoinsRequired; //how many points before removing card
  public gameEndCardsRemaining = environment.gameEndCardsRemaining;
  public cardCompletionPoints = environment.cardCompletionPoints;
  public sidePointsRequired = environment.sidesPointRequired;


  public playingDate = Date.now();
  public currentAnswerCard = new CardItem();
  public currentStudySide = 0;
  public cards:Array<CardItem> = [];
  public currentCards = [];
  public currentOptions = [];
  public slots = [];
  public colors = ['primary','primary','primary','primary'];
  //public slot1 = {};
  //public slot2 = {};
  //public slot3 = {};
  //public slot4 = {};

  //states, progress, answeredTrue, answerdFalse, finished
  gameState = 'progress';
  screen = 'start';
  screen2 = 'playing'; //or results

  //colors
  cDefault = 'light';
  cCorrect = 'success';
  cIncorrect = 'warrning';


  constructor(  public stateService: StateService,
                public navCtr: NavController,
                public modalCtr: ModalController,
                public cdr: ChangeDetectorRef,
                public dataService: DataService) { }

  ngOnInit() {
    this.stateService.waitForReady().subscribe(() => {
      this.loadCards();
    });
  }

  async loadCards() {
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
      //lets load play cards, and study
      this.cards = await this.dataService.getStudyCards(null, true);
    }
    console.log('CARDS: ', this.cards);

  }

  startGame() {
    console.log('Start Game');
    this.screen = 'play';
    this.prepareCards();
    this.selectRandomCards(null);
    this.cdr.detectChanges();
  }


  async playAllCards() {
    this.cards = await this.dataService.getStudyCards(9999999999999999, true);
    console.log('All cards: ', this.cards);
    this.screen = 'play';
    this.prepareCards();
    this.selectRandomCards(null);
    this.cdr.detectChanges();
  }

  cancelGame () {
    console.log('Cancel Game');
    if(this.stateService.prevUrl !== null && this.stateService.prevUrl !== '')
    this.navCtr.navigateForward(this.stateService.prevUrl);
    else
      this.navCtr.navigateForward('home');
  }

  processAnswer(card) {
    console.log(card);
    console.log('SLOTS: ', this.slots);
    console.log(this.currentOptions);

    this.updateCardPoints(card);
    this.showAnswerStatus(card);
    this.cdr.detectChanges();
  }


  showAnswerStatus(card) {
    const c = [this.cDefault, this.cDefault, this.cDefault, this.cDefault];
    const correct = this.slots.findIndex(cc => cc === this.currentAnswerCard);
    c[correct] = this.cCorrect;
    if(card === null) {
    }
    else if(card = this.currentAnswerCard) {
      // do nothing we are already highliting card
    }
    else {
      const i = this.slots.findIndex(cc => card === cc);
      c[i] = this.cIncorrect;

    }
  }


  updateCardPoints(card) {
    if(card == null) {
      console.log('Dont Know Choosen');
      this.currentAnswerCard['currentNotKnow']++;
      //do nothing, they can replay card later on
    }
    else if(card === this.currentAnswerCard) {
      //add point
      this.currentAnswerCard.currentSidePoints[this.currentStudySide]++;
      this.currentAnswerCard['currentCorrectAnswers']++;

      //check if this cards is finished
      this.checkCardPlayStatus(this.currentAnswerCard);
    } else {
      //add point
      this.currentAnswerCard.currentSidePoints[this.currentStudySide]--;
      this.currentAnswerCard['currentWrongAnswers']++;

      if(this.currentAnswerCard.currentSidePoints[this.currentStudySide] < 0)
        this.currentAnswerCard.currentSidePoints[this.currentStudySide] = 0;
    }
  }

  continueGame() {
    //if we go to a super low number, than just end game
    if(this.currentCards.length === this.gameEndCardsRemaining) {
      this.endGame();
    }
    else {
      this.colors = [this.cDefault, this.cDefault, this.cDefault, this.cDefault];
      this.selectRandomCards(this.currentAnswerCard);
    }
    this.cdr.detectChanges();
  }

  checkCardPlayStatus(c) {
    console.log('CheckCardPlayStatus');
    if(c.side1)
      if(c.currentSidePoints[1] < this.sidePointsRequired[1])
        return;

    if(c.side2)
      if(c.currentSidePoints[2] < this.sidePointsRequired[2])
        return;

    if(c.side3)
      if(c.currentSidePoints[3] < this.sidePointsRequired[3])
        return;

    //if we are still here, card has been fully studied
    pull(this.currentCards, this.currentAnswerCard);
    console.log('Remaining Cards: ', this.currentCards.length+1);
  }

  async endGame() {
    this.screen = 'saving';
    await this.stateService.saveGameSession(this.cards);
    this.screen = 'end';
  }

  prepareCards() {
    this.currentCards = concat(this.cards);
    this.currentCards.forEach(c => {
      c.currentSidePoints = {
        1: 0,
        2: 0,
        3: 0
      };
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

    //choose side to study, see how far user went
    const studySides = [];
    if(this.currentAnswerCard.currentSidePoints[1] < this.sidePointsRequired[1] &&
      this.currentAnswerCard['side1']) {
      studySides.push(1);
    }
    if(this.currentAnswerCard.currentSidePoints[2] < this.sidePointsRequired[2]  &&
      this.currentAnswerCard['side2']) {
      studySides.push(2);
    }
    if(this.currentAnswerCard.currentSidePoints[3] < this.sidePointsRequired[3] &&
      this.currentAnswerCard['side3']) {
      studySides.push(3);
    }
    this.currentStudySide = sample(studySides);
    console.log('Study SIDE:  ', this.currentStudySide);

    pull(tempArray, this.currentAnswerCard);

    this.slots = sampleSize(concat([], this.currentAnswerCard,
      sampleSize(tempArray, 3)), 4);

    console.log(this.slots);
    //console.log(this.slot1, this.slot2, this.slot3, this.slot4);
  }

  canPlay() {
    if( this.cards.length < 5 ) {
      return false;
    }
    return true;
  }

  printSide(card: CardItem, isAnswer = false) {
    if(isAnswer) {
      return card['side'+this.currentStudySide];
    }
    else {
      if(this.currentStudySide === 1) {
        return card.side2 || card.side3;
      }
      else if(this.currentStudySide === 2) {
        return card.side1 || card.side3;
      }
      else if(this.currentStudySide === 3) {
        return card.side1 || card.side2;
      }
    }

    return '';
  }

  printRemainingCards() {
    const num = this.currentCards.length+1-this.gameEndCardsRemaining || null;
    if(num)
      return ' (' + num + ')';
    return '';
  }


}
