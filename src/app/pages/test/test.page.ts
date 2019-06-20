import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { StateService } from '../../services/state.service';
import { DataService } from '../../services/data.service';
import { NavController, ModalController, AlertController, ToastController } from '@ionic/angular';
import { trigger, state, style, animate, transition} from '@angular/animations';
import { sample, sampleSize, pull, without, concat, findIndex} from 'lodash';
import { CardItem } from '../../models';
import { environment } from '../../../environments/environment';
import { waitMS, CountDownTimer, addDays } from '../../utils';



@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestPage implements OnInit, OnDestroy {
  //public gamePoinsRequired = environment.gamePoinsRequired; //how many points before removing card
  public gameEndCardsRemaining = environment.gameEndCardsRemaining;
  public cardCompletionPoints = environment.cardCompletionPoints;

  public sessionDate = Date.now();
  public gameDurationMins = 10;
  public playingDate = Date.now();
  public currentAnswerCard = new CardItem();
  public currentStudyStage = 0;
  public cards:Array<CardItem> = [];
  public currentCards = [];
  public currentOptions = [];
  public slots = [];
  public totalCards = 0;

  public totalGameSessionStudyPoints = 0;

  public totalCorrectAnswers = 0;
  public totalWrongAnswers = 0;
  public totalDontKnow = 0;
  //public slot1 = {};
  //public slot2 = {};
  //public slot3 = {};
  //public slot4 = {};

  //states, progress, answeredTrue, answerdFalse, finished
  gamePause = 2000;
  gameState = 'progress';
  screen = 'start';
  screen2 = 'playing'; //or results
  correctCardScreen = -1;

  //colors
  cDefault = 'light';
  cCorrect = 'success';
  cIncorrect = 'medium';
  cWrongAnswerd = 'danger';
  public colors = [];

  // timer
  timerTick = 0;
  timer: CountDownTimer;
  timerValue = '';


  // service
  _stateSub;
  _timerStatusSub;
  _timerTickSub;

  constructor( public stateService: StateService,
    public navCtr: NavController,
    public modalCtr: ModalController,
    public toastCtr: ToastController,
    public cdr: ChangeDetectorRef,
    public dataService: DataService) { }

    ngOnInit() {
      this._stateSub = this.stateService.waitForReady().subscribe(() => {
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
        console.log('Loading Study Cards');
        this.cards = await this.dataService.getStudyCards(undefined , true);
      }
      console.log('CARDS: ', this.cards);
      this.totalCards = this.cards.length;
      this.cdr.detectChanges();
    }

    continueGame() {
      this.screen = 'play';
      this.timer.continue();
      this.cdr.detectChanges();
    }

    pauseGame() {
      this.screen = 'paused';
      this.timer.pause();
    }

    startGame() {
      console.log('Start Game');
      this.prepareCards();
      this.totalGameSessionStudyPoints = this.getCurrentRequiredStudyGamePoints();
      this.selectRandomCards(null);
      this.setupTimer();
      this.screen = 'play';
      this.cdr.detectChanges();
    }

    async playAllCards() {
      this.cards = await this.dataService.getStudyCards(9999999999999999, true);
      this.totalCards = this.cards.length;
      console.log('All cards: ', this.cards);
      this.screen = 'play';
      this.prepareCards();
      this.selectRandomCards(null);
      this.setupTimer();
      this.cdr.detectChanges();
    }

    setupTimer(mins = this.gameDurationMins) {
      console.log('Setting up timer');
      this.timer = new CountDownTimer(mins * 60 ); //its in seconds so for 10 min;
      this.timer.start();
      this._timerTickSub = this.timer.tick$.subscribe(tick => {
        //console.log('TimerTick');
        this.printTimer(tick);
      });
      this._timerStatusSub =  this.timer.status$.subscribe(s => {
        console.log('Timer status: ', s);

        if( s === 'running') {
          //this.screen = 'play';
        }

        if( s === 'paused') {
          //this.screen = 'paused';
        }

        if(s === 'ended') {
          this.endGame();
        }
        this.cdr.detectChanges();
      });

      this._timerTickSub = this.timer.tick$.subscribe(t => {
        this.printTimer(t);
        this.cdr.detectChanges();
      });
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
        this.nextCardIteration();
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

      //screen
      this.correctCardScreen = correct;


      this.colors = c;
      this.cdr.detectChanges();
    }


    updateCardPoints(card) {
      if(card == null) {
        console.log('Dont Know Choosen');
        this.currentAnswerCard['currentNotKnow']++;
        this.totalDontKnow++;
        //do nothing, they can replay card later on
      }
      else if(card === this.currentAnswerCard) {
        //add point
        this.currentAnswerCard.currentStudyStage++;
        this.currentAnswerCard.currentCorrectAnswers++;
        this.totalCorrectAnswers++;

        //check if this cards is finished
        this.checkCardPlayStatus(this.currentAnswerCard);
      } else {
        //add point
        this.currentAnswerCard.currentStudyStage--;
        this.currentAnswerCard['currentWrongAnswers']++;

        if(this.currentAnswerCard.currentStudyStage < 0)
          this.currentAnswerCard.currentStudyStage = 0;

        this.totalWrongAnswers++;
      }
      console.log('Played cards after adding points: ', this.currentAnswerCard);
    }

    nextCardIteration() {
      //if we go to a super low number, than just end game
      if(this.currentCards.length === this.gameEndCardsRemaining) {
        this.endGame();
      }
      else {
        this.selectRandomCards(this.currentAnswerCard);
      }
      this.cdr.detectChanges();
    }

    checkCardPlayStatus(c: CardItem) {
      const env = environment;

      console.log('CheckCardPlayStatus');

      if(c.currentStudyStage < env.totalStudyStages - 1 && //0 based so take out one
         c.currentWrongAnswers < env.proficiencyLevelWrongAnswerCountDecrese)
        return;


      if(c.currentWrongAnswers >= env.proficiencyLevelWrongAnswerCountDecrese) {
        if(c.proficiencyLevel > 0) {
          c.proficiencyLevel--;
          c.sessions[this.sessionDate] = {
            type: 'proficiencyDown',
            value: c.proficiencyLevel
          };
        }
        c.totalWrongAnswers += c.currentWrongAnswers;
        c.currentWrongAnswers = 0;
        c.currentStudyStage = 0;
      }

      if(c.currentStudyStage >= env.totalStudyStages - 1 ) {
        // card fully studied
        pull(this.currentCards, this.currentAnswerCard);
        c.totalCorrectAnswers =+ c.currentCorrectAnswers;
        c.totalWrongAnswers =+ c.currentWrongAnswers;
        c.totalNotKnow =+ c.currentNotKnow;
        c.currentStudyStage = 0;
        c.currentWrongAnswers = 0;
        c.currentCorrectAnswers = 0;
        c.currentNotKnow = 0;
        c.proficiencyLevel++;
        c.nextStudySession = addDays(new Date(), env.proficiencyLevels[c.proficiencyLevel]).getTime();

        c.sessions[this.sessionDate] = {
          type: 'proficiencyUp',
          value: c.proficiencyLevel
        };

        this.showFinishedCardAlert(c);
        this.dataService.save(c);
      }
      console.log('Remaining Cards: ', this.currentCards.length+1);
    }

    async showFinishedCardAlert(card: CardItem) {
      const toast = await this.toastCtr.create({
        message: card.side1 + ': completed',
        duration: 1000,
        position: 'bottom',
        color: 'success'
      });
      toast.present();
    }

    async endGame() {
      this.screen = 'saving';
      this.cdr.detectChanges();
      await this.stateService.saveGameSession(this.cards);
      this.screen = 'end';
      this.cdr.detectChanges();
    }

    cancelGame () {
      console.log('Cancel Game');
      if(this.stateService.prevUrl !== null && this.stateService.prevUrl !== '')
      this.navCtr.navigateForward(this.stateService.prevUrl);
      else
        this.navCtr.navigateForward('home');
    }

    prepareCards() {
      this.currentCards = concat(this.cards);
      this.currentCards.forEach(c => {
        c.currentStudyStage = 0;
        c.currentWrongAnswers = 0;
        c.currentCorrectAnswers = 0;
        c.currentNotKnow = 0;
      });

      this.totalCorrectAnswers = 0;
      this.totalWrongAnswers = 0;
      this.totalDontKnow = 0;
    }

    // study types
    // stage
    // pinyin -> meaning
    // pinyin -> char
    // char -> pinyin
    // char -> meaning
    //

    selectRandomCards(lastAnswer) {
      console.log('Select Random Card');
      this.colors = [this.cDefault, this.cDefault, this.cDefault, this.cDefault];
      const tempArray =  concat(this.cards);
      const tempAnswerArray = without(this.currentCards, lastAnswer);
      //console.log('TempAnswerArray:: ', tempAnswerArray);
      this.currentAnswerCard = <CardItem> sample(tempAnswerArray);
      console.log('Current Answer Card: ', this.currentAnswerCard);

      //choose side to study, see how far user went

      this.currentStudyStage = this.currentAnswerCard.currentStudyStage || 0;
      console.log('Current Stage:: ', this.currentStudyStage);

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

    // study types
    // stage
    // 0. pinyin -> meaning
    // 1. char -> pinyin
    // 2. pinyin -> char
    // 3 . meaning -> char
    // 4. char -> meaning // *ngIf="screen2 != 'playing' && correctCardScreen===0"
    //
    printAnswerSide(card:CardItem) {
      if(this.currentStudyStage === 0) {
        return ', ' + card['side'+1];
      }
      else if(this.currentStudyStage === 1) {
        return ', ' + card['side'+2];
      }
      else if(this.currentStudyStage === 2) {
        return ', ' + card['side'+2];
      }
      else if(this.currentStudyStage === 3) {
        return ', ' + card['side'+3];
      }
      else if(this.currentStudyStage === 4) {
        return ', ' + card['side'+3];
      }
    }
    printSide(card: CardItem, isAnswer = false) {
      if(isAnswer) {
        if(this.currentStudyStage === 0) {
          return card['side'+3];
        }
        else if(this.currentStudyStage === 1) {
          return card['side'+1];
        }
        else if(this.currentStudyStage === 2) {
          return card['side'+3];
        }
        else if(this.currentStudyStage === 3) {
          return card['side'+2];
        }
        else if(this.currentStudyStage === 4) {
          return card['side'+1];
        }
      }
      else {
        if(this.currentStudyStage === 0) {
          return card['side'+2];
        }
        else if(this.currentStudyStage === 1) {
          return card['side'+3];
        }
        else if(this.currentStudyStage === 2) {
          return card['side'+1];
        }
        else if(this.currentStudyStage === 3) {
          return card['side'+1];
        }
        else if(this.currentStudyStage === 4) {
          return card['side'+2];
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

    printProgress(percentage = false) {

      const current = this.totalGameSessionStudyPoints - this.getCurrentRequiredStudyGamePoints();

      console.log('BUFFER:: ', this.totalGameSessionStudyPoints,
        current, current / this.totalGameSessionStudyPoints);
      if(percentage) {
        return Math.floor((current / this.totalGameSessionStudyPoints)*100);
      }
      else {
        return current / this.totalGameSessionStudyPoints;
      }
    }

    getCurrentRequiredStudyGamePoints() {
      let b = 0;
      this.currentCards.forEach(c => {
        b +=  environment.totalStudyStages - c.currentStudyStage - 1;
      });
      return b;
    }

    printTimer(tick = 0) {
      const m = Math.floor(tick / 60);
      const s = tick % 60;

      const minutes = m < 10 ? '0' + m : m;
      const seconds = s < 10 ? '0' + s : s;

      //console.log('Timer: ', minutes, seconds);
      this.timerValue = minutes + ':' + seconds;
    }



    ngOnDestroy(): void {
      if(this._stateSub && !this._stateSub.closed)
        this._stateSub.unsubscribe();
      if(this._timerStatusSub && !this._timerStatusSub.closed)
        this._timerStatusSub.unsubscribe();
      if(this._timerTickSub && !this._timerTickSub.closed)
        this._timerTickSub.unsubscribe();
    }
}
