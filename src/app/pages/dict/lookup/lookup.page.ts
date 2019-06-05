import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DictService } from '../../../services/dict.service';
import { NavController } from '../../../../../node_modules/@ionic/angular';
import { ActivatedRoute } from '../../../../../node_modules/@angular/router';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.page.html',
  styleUrls: ['./lookup.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LookupPage implements OnInit, OnDestroy {

  sync = 100;
  searchText = '';
  words = [];

  private _navSub;
  private _dictSub;
  private _syncSub;

  constructor(public dictService: DictService,
              public route: ActivatedRoute,
              public cdr: ChangeDetectorRef,
              public navCtr: NavController,) {

  }

  ngOnInit() {
    if(this.searchText !== '') {
      this.textChange();
    }
    this._dictSub = this.dictService.waitForReady()
      .subscribe(ready => {
        if(ready){
          this.loadNavSub();
          this.loadSyncSub();
        }
      });
  }

  loadSyncSub() {
    this._syncSub.subscribe(s => {
      console.log(s);
      this.sync = s;
    });
  }

  loadNavSub() {
    this._navSub = this.route.params.subscribe(params => {
      const word = params['id']; // (+) converts string 'id' to a number

      if(word !== null && word !== '') {
        this.searchText = word;
        this.textChange();
      }
    });
  }

  ngOnDestroy(): void {
    if(this._navSub && !this._navSub.closed)
      this._navSub.unsubscribe();
    if(this._dictSub && !this._dictSub.closed)
      this._dictSub.unsubscribe();
    if(this._syncSub && !this._syncSub.closed)
      this._syncSub.unsubscribe();
  }

  selectWord(w) {
    console.log(w);
    this.navCtr.navigateForward('/dict/word/'+w._id);
  }

  printDef(value) {
    return value.replace('|', ', ');
  }
  async textChange(e = {}) {
    console.log(this.searchText);
    // this.words =  await this.dictService.search(this.searchText);
    console.log(this.words);
    this.cdr.detectChanges();
  }
}
