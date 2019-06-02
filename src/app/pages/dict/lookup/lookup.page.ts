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

  private navSub;
  private dictSub;

  constructor(public dictService: DictService,
              public route: ActivatedRoute,
              public cdr: ChangeDetectorRef,
              public navCtr: NavController,) {

  }

  ngOnInit() {
    if(this.searchText !== '') {
      this.textChange();
    }
    this.dictSub = this.dictService.waitForReady()
      .subscribe(ready => {
        if(ready)
          this.loadNavSub();
      });
  }

  loadNavSub() {
    this.navSub = this.route.params.subscribe(params => {
      const word = params['id']; // (+) converts string 'id' to a number

      if(word !== null && word !== '') {
        this.searchText = word;
        this.textChange();
      }
    });
  }

  ngOnDestroy(): void {
    if(this.navSub && !this.navSub.closed)
      this.navSub.unsubscribe();
    if(this.dictSub && !this.dictSub.closed)
      this.dictSub.unsubscribe();
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
    this.words =  await this.dictService.search(this.searchText);
    console.log(this.words);
    this.cdr.detectChanges();
  }
}
