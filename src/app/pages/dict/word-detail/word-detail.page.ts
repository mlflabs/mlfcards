import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { StateService } from '../../../services/state.service';
import { DataService } from '../../../services/data.service';
import { DictService } from '../../../services/dict.service';
import { CARD_COLLECTION, CardItem } from '../../../models';

@Component({
  selector: 'app-word-detail',
  templateUrl: './word-detail.page.html',
  styleUrls: ['./word-detail.page.scss'],
})
export class WordDetailPage implements OnInit, OnDestroy {


  private navSub;
  private dictSub;
  public word;

  constructor(public route: ActivatedRoute,
              public navCtr: NavController,
              public alertCtr: AlertController,
              public toastCtr: ToastController,
              public state: StateService,
              public dictService: DictService,
              public dataService: DataService) { }

  ngOnInit() {
    this.dictSub = this.dictService.waitForReady()
      .subscribe(ready => {
        if(ready)
          this.loadNavSub();
      });
  }

  loadNavSub() {
    this.navSub = this.route.params.subscribe(params => {
      const word = params['id']; // (+) converts string 'id' to a number

      this.loadWord(word);
    });
  }

  async loadWord(id) {
    this.word = await this.dictService.getDoc(id);
    console.log(this.word);
  }

  printDef() {
    if(!this.word)
      return '';

    if(!this.word['def'])
      return '';

    const d = this.word['def'].cc || this.word['def'].g ||
          this.word['def'].usr || 'No Defenition found';

    const a = d.split('|');
    // console.log(a);
    let count = 1;
    let def = '';
    a.forEach(x => {
      def += count + ' ' + x + ' <BR>';
      count++;
    });
    return def;
  }

  async addToStudy() {
    console.log('Add to Study:: ', this.word);
    // see if we already have the word
    const find = await this.dataService.findCardBySide1(this.word._id);
    console.log(find);
    if(find.length === 0) {
      const res = await this.dataService.addCardFromWord(this.word);
      console.log(res);
      if(res.ok) {
        this.cardAddedAlert();
      }
    }
    else {
      const alert = await this.alertCtr.create({
        header: 'Duplicate Card',
        subHeader: 'Do you still want to create this card?',
        message: 'Card found in...',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Add Card',
            handler: async () => {
              console.log('Confirm Ok');
              const res = await this.dataService.addCardFromWord(this.word);
              if(res.ok) {
                this.cardAddedAlert();
              }
              console.log(res);
            }
          }
        ]
      });
      alert.present();
    }
  }

  async cardAddedAlert() {
    const toast = await this.toastCtr.create({
      message: 'Card Added',
      duration: 2000,
      // position: 'top',
      color: 'success'
    });
    toast.present();
  }


  ngOnDestroy(): void {
    if(this.navSub && !this.navSub.closed)
      this.navSub.unsubscribe();
    if(this.dictSub && !this.dictSub.closed)
      this.dictSub.unsubscribe();
  }
}
