import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable, BehaviorSubject, Subject, } from 'rxjs';
import { first } from 'rxjs/operators';
import { waitMS } from '../utils';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public settings = {}; // settings shared by all devices with this user
  public settings$ = new BehaviorSubject(this.settings);

  public ready = false;
  private _ready$ = new Subject<boolean>();

  public localSettings = { //settings only for this device
    chinese_offline: false,
    app: environment.app_id,
  };
  public localSettings$ = new BehaviorSubject(this.localSettings);

  constructor(public dataService: DataService,
              public storage: Storage) {
    console.log('SETTINGS SERVICE CONSTRUCT');
    this.dataService.waitForReady().subscribe(async () => {
      console.log('Settings, dataservice ready');
      this.dataService.subscribeDocChanges('settings').subscribe(doc => {
        console.log(doc);
        this.settings = doc;
        this.settings$.next(doc);
      });
      this.settings = await dataService.getDoc('settings');
      this.settings$.next(this.settings);
      console.log(this.settings);
      this.ready = true;
      this._ready$.next(true);
    });

    this.loadLocalSettins();


  }

  async loadLocalSettins() {
    this.localSettings = await this.storage.get('local_settings');
    if(!this.localSettings) {
      this.localSettings = {
        app: environment.app_id,
        chinese_offline: false,
      };
      await this.storage.set('local_settings', this.localSettings);
    }
    this.localSettings$.next(this.localSettings);
  }

  saveSettings(doc) {
    this.dataService.saveSettings(doc);
  }

  saveLocalSettings(settings = null, key = null, value = null ) {
    if(settings) {
      this.localSettings = this.localSettings;
    }
    else if( key && value) {
      this.localSettings[key] = value;
    }
    this.storage.set('local_settings', this.localSettings);
    this.localSettings$.next(this.localSettings);
  }


  waitForReady(): Observable<any> {
    // let others know are datasource is ready
    waitMS(100).then(() => {
      if(this.ready) this._ready$.next(true);
    });
    return this._ready$.pipe(first(ready => ready));
  }
}
