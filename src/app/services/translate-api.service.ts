import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TranslateApiService {
  public apiUrl = environment.translateApiUrl;

  constructor(public http: HttpClient) { }


  public async divideText(text) {
    const res = await this.http.post(this.apiUrl+'/api/divide',
                {
                  // tslint:disable-next-line:max-line-length
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoibWlrZSIsImFwcCI6ImFwcCIsImNvZGUiOjE1NDg1ODcwODE3NDksInNob3J0RXhwIjoxNTU2MzM4MDg0LCJlbWFpbCI6Im1pY2hhbHpha0BnbWFpbC5jb20iLCJpYXQiOjE1NTYzMzQ0ODQsImV4cCI6MTU1ODkyNjQ4NH0.KbhvcQ-1sCpYWYuyfshbYp6RLm355Fr6mtKy4cEdmuc',
                  text: text,
                }).toPromise();
    console.log('DIVIDE CALL: ', res);
    return res;
  }
}
