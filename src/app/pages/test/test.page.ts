import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { StateService } from '../../services/state.service';
import { DataService } from '../../services/data.service';
import { NavController, ModalController } from '@ionic/angular';
import { trigger, state, style, animate, transition} from '@angular/animations';
import { sample, sampleSize, pull, without, concat, findIndex} from 'lodash';
import { CardItem } from '../../models';
import { environment } from '../../../environments/environment';
import { waitMS } from '../../utils';



@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestPage implements OnInit {
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

  //public slot1 = {};
  //public slot2 = {};
  //public slot3 = {};
  //public slot4 = {};

  //states, progress, answeredTrue, answerdFalse, finished
  gamePause = 2000;
  gameState = 'progress';
  screen = 'start';
  screen2 = 'playing'; //or results

  //colors
  cDefault = 'light';
  cCorrect = 'success';
  cIncorrect = 'medium';
  cWrongAnswerd = 'danger';
  public colors = [];

  constructor( public stateService: StateService,
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

    async processAnswer(card) {
      this.screen2 = 'results';
      console.log(card);
      console.log('SLOTS: ', this.slots);
      console.log(this.currentOptions);

      this.updateCardPoints(card);
      this.showAnswerStatus(card);
      await waitMS(this.gamePause);
      if(this.screen2 !== 'playing')
        this.continueGame();
      this.cdr.detectChanges();
    }

    showAnswerStatus(card) {
      const c = [this.cIncorrect, this.cIncorrect, this.cIncorrect, this.cIncorrect];
      const correct = this.slots.findIndex(cc => cc === this.currentAnswerCard);
      c[correct] = this.cCorrect;

      if(card === null) {
      }
      else if(card === this.currentAnswerCard) {
        console.log('Correct Answer');
        // do nothing we are already highliting card
      }
      else {
        console.log('Wrong Answer');
        //const i = this.slots.findIndex(cc => card === cc);
        c[correct] = this.cWrongAnswerd;
      }
      this.colors = c;
      this.cdr.detectChanges();
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
      this.colors = [this.cDefault, this.cDefault, this.cDefault, this.cDefault];
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
      this.screen2 = 'playing';
      this.cdr.detectChanges();
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
