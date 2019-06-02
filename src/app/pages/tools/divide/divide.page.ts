import { Component, OnInit } from '@angular/core';
import { TranslateApiService } from '../../../services/translate-api.service';

@Component({
  selector: 'app-divide',
  templateUrl: './divide.page.html',
  styleUrls: ['./divide.page.scss'],
})
export class DividePage implements OnInit {
  public text = '';
  constructor( public tApi: TranslateApiService) { }

  ngOnInit() {
  }

  async divide() {
    if(this.text !== '') {
      const res = await this.tApi.divideText(this.text);
    }
  }

}
