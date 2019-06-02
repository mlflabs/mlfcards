import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DictService } from '../../services/dict.service';
import { NavController } from '../../../../node_modules/@ionic/angular';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  sync = 100;
  searchText = '';

  constructor(public dictService: DictService,
              public dataService: DataService,
              public cdr: ChangeDetectorRef,
              public navCtr: NavController) { }

  ngOnInit() {
    this.dictService.sync$.subscribe(s => {
      console.log('dic sync: ', s);
      this.sync = s;
      this.cdr.detectChanges();
    });

    //find out all the words we need to study
  }

  async startStudy() {
    const cards = await this.dataService.getStudyCards();
    console.log('Study Cards:: ', cards);
  }

  async textChange(e = {}) {
    this.navCtr.navigateForward('/dict/'+this.searchText);
  }


  ngOnDestroy(): void {
  }

}
