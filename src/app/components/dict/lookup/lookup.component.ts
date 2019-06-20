import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { DictService } from '../../../services/dict.service';
import { NavController, ModalController, IonInput } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { EditCardComponent } from '../../cards/edit-card/edit-card.component';
import { CardItem } from '../../../models';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'dic-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LookupComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput') searchInput: IonInput;

  searchText = '';
  searchMode =  'En';
  searchTarget = 'zh-CN';
  searchSource = 'en';
  words = [];

  sync = 100;

  private _searchSub;
  private _syncSub;

  constructor(public dictService: DictService,
    public route: ActivatedRoute,
    public modalCtr: ModalController,
    public cdr: ChangeDetectorRef,
    public dataService: DataService,
    public navCtr: NavController,) { }

  ngOnInit() {
    if(this.searchText !== '') {
      this.textChange();
    }

    this._searchSub = this.dictService.searchResults$.subscribe(
      res => {
        console.log('RES: ', res);

        if(res.text === this.searchText && res.result)
          this.words = res.result.concat(this.words);

        this.cdr.detectChanges();
      }
    );

    this.loadSyncSub();
  }

  loadSyncSub() {
    this._syncSub = this.dictService.sync$.subscribe(s => {
      console.log(s);
      if(s < 100)
        this.sync = Math.floor(s*100);
      this.cdr.detectChanges();
    });
  }


  async selectWord(w) {
    console.log(w);
    //this.navCtr.navigateForward('/dict/word/' + w.def + '/' + w.source + '/' + w.pinyin);
    const card = new CardItem({
      side1: w.source,
      side2: w.def,
      side3: w.pinyin
    });
    const modal = await this.modalCtr.create({
      component: EditCardComponent,
      componentProps: { item: card, showHeader: true}
    });
    modal.present();
  }


  printDef(value) {
    try {
      if(value.highlighting)
        return value.highlighting.replace('|', ', ');
      return value.def.replace('|', ', ');
    }
    catch(e) {
      console.log(e.message);
      console.log(value);
      return '';
    }
  }


  async textChange(e = {}) {
    console.log(this.searchText);
    if(this.searchText.trim() === '') return;
    this.words = [];
    const words = await this.dictService.search(this.searchText.trim(),
      this.searchTarget, this.searchSource);

    if(!words)
      return;

    this.words = this.words.concat(words);

    this.cdr.detectChanges();
  }

  changeSearchMode() {
    if(this.searchMode === 'En') {
      this.searchMode = '文';
      this.searchTarget = 'en';
      this.searchSource = 'zh-CN';
    }
    else {
      this.searchMode = 'En';
      this.searchTarget = 'zh-CN';
      this.searchSource = 'en';

    }
    this.textChange();
  }

  ngOnDestroy() {
    if(this._searchSub && !this._searchSub.closed)
      this._searchSub.unsubscribe();
    if(this._syncSub && !this._syncSub.closed)
      this._syncSub.unsubscribe();
  }

  clearInput() {
    this.searchText = '';
    this.searchInput.setFocus();

  }

}
