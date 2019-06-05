import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Observable, fromEvent, Subject, BehaviorSubject, throwError } from 'rxjs';
import { map, debounceTime, filter, first, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Doc, PROJECT_SERVICE, PROJECT_INDEX_SERVICE, ProjectItem, LASTCHAR, DIV } from '../models';
import { generateCollectionId, generateShortCollectionId, generateShortUUID, waitMS } from '../utils';
import { isEqual } from 'lodash';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Platform } from '@ionic/angular';

PouchDB.plugin(PouchDBFind);
import PouchDBQuickSearch from 'pouchdb-quick-search';
import { SettingsService } from './settings.service';

//PouchDB.plugin(require('pouchdb-quick-search'));
PouchDB.plugin(PouchDBQuickSearch);

// tslint:disable-next-line:class-name
class searchrequest   {
  public text;
  public source;
  public target;
  public hasOffline;
}
@Injectable({
  providedIn: 'root'
})
export class DictService {
  private _pouch: any;
  private _pouch_sync: any;
  public ready = false;
  private _pouchReady$ = new BehaviorSubject(this.ready);
  public sync$ = new BehaviorSubject(100);

  public localDownloaded = false;
  public offline = false;


  public searchText$ = new Subject<searchrequest>();
  public searchResults$;

  private _localPouchOptions = {
    revs_limit: 2,
    auto_compaction: true
  };

  constructor(public authService: AuthService,
              public http: HttpClient,
              public settingsService: SettingsService) {
    console.log('************************** Dict Setup:');
    this.authService.waitForReady().subscribe(() => {
      //load settings
      this.initSettings();
    });



    this.searchResults$ = this.searchText$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap( r => this.searchService(r))
    );
   }

   initSettings() {
    console.log('Dict, init SEttings');
    this.settingsService.localSettings$.subscribe(s => {
      if(s['chinese_offline'] !== this.offline) {
        this.offline = s['chinese_offline'];
        if(this.offline) {
          this.initPouch('pouch_dictionary');
        }
        else {
          try {
            if(this._pouch_sync) this._pouch_sync.cancel();
            this._pouch = null;
          }
          catch(e) {
            console.log(e.message);
          }
        }
      }
    });
   }

   public async search(text, target, source, hasOffline = this.offline) {
    this.searchText$.next({
      text:text,
      source:source,
      target: target,
      hasOffline: hasOffline
    });

     if( this.offline &&
        (target === 'en' || 'zh-CN') &&
        (source === 'en' || 'zh-CN')) {

          console.log('Searching offline');
          if(source === 'en')
            return await this.searchEnglish(text);
          if(source === 'zh-CN')
            return await this.searchChinese(text);
     }
     else {
       return false;
     }

   }

   public async searchService(req) {
    console.log('SearchService: ', req);
    return this.http.post(environment.translateApiUrl+'/dict/translate', {
      text: req.text,
      source: req.source,
      target: req.target,
      hasOffline: req.hasOffline,
      token: this.authService.user.token}
    ).toPromise();
   }

   private handleError(error: HttpErrorResponse) {
     console.log(error.error.message);

     return throwError('Oops, no results, please try again at later time');
   }

   /*
   public async searchOffline(value, target) {
    // determine if english or chinese
    if(await this.isChineseWord(value.substring(0,1))) {
      console.log('Is chinese word');
      const res =  await this.searchChinese(value);
      return res.map(d => {
        //we need to provide main def property
        d.text = d.def.cc||d.def.g||d.def.usr;
        return d;
      });

    }
    else {
      console.log('Is English word');
      const res =  await this.searchEnglish(value);
      return res.rows.map(d => {

        return {...d.doc,
            text: d.highlighting['def.cc']||d.highlighting['def.usr']||
              d.highlighting['def.g'] };
      });
    }

   }
   */

   public async searchChinese(text: string) {
    try {
      console.log('searching chinese', text);
      const res = await this.isChineseWord(text);
      console.log(res);
      return [{
        source: res._id,
        pinyin: res.pinyin,
        def: res['def']['cc']||res['def']['usr'],
      }];
    }
    catch(e) {
      return [];
    }
  }

  public async searchEnglish(value) {
     try {
      console.log('Searching English: ', value);
      const res = await this._pouch.search({
        query: value,
        highlighting: true,
        // highlighting_pre: '<em>',
        // highlighting_post: '</em>',
        limit: 15,
        skip: 0,
        include_docs: true,
        fields: ['_id', 'def.cc', 'def.g', 'def.usr']
      });

      console.log('English search: ', res);
      const words = res.rows.map(d => {
        return {
          source: d.doc._id,
          pinyin: d.doc.pinyin,
          def: d.doc['def']['cc']||d.doc['def']['usr'],
          highlighting:  d.highlighting['def.cc']||d.highlighting['def.usr']
        };
      });
      return words.reverse();
     }
     catch(e) {
       console.log('Search Error: ', e.message);
       return e.message;
     }
  }


  public async isChineseWord(word) {
    try {
      const res = await this._pouch.get(word);
      return res;
    }
    catch(e) {
      // console.log('FALSE: ', word);
      return false;
    }
  }



  public async getDoc(id) {
    try {
      const doc = await this._pouch.get(id);
      console.log('Word Loaded: ', doc);
      return doc;
    }
    catch(e) {
      console.log('DictService Get Word Error: ', e.message);
      return null;
    }
  }


  private async  initPouch(pouchName:string,
    syncRemote:boolean=false):Promise<any> {

    console.log('DicProvider->initDB localName: ' + pouchName);

    this._pouch = await new PouchDB(pouchName, this._localPouchOptions);

    // create our event subject
    this._pouch.changes({live: true, since: 'now', include_docs:true})
      .on('change', change => {
        // console.log('Pouch DICT on change', change);
      });

    await waitMS(200);
    this.syncRemote();
    this.ready = true;
    this._pouchReady$.next(true);

    // build search indexes
    const searchindex = await this._pouch.search({
      fields: ['def.cc', 'def.usr'],
      build: true
    });
    console.log('************** Search Index: ', searchindex);
  }

  syncRemote() {
    const remoteDB = new PouchDB(environment.dict_db,{});

    const opts = {
      live: false,
      retry: false,
      batch_size:500,

    };

    this._pouch_sync =  this._pouch.replicate.from(remoteDB, opts)
      .on('change',  (change) => {
        console.log('Remote Sync: ', change);
        console.log(change.pending);
        console.log(change.docs_written);
        console.log(change.docs_written/(change.pending+change.docs_written));
        this.sync$.next(change.docs_written/(change.pending+change.docs_written));
      }).on('error',  (err) => {
        console.log('Remote Error: ', err);
      }).on('complete',  () => {
        this.sync$.next(100);
        console.log('Remote Sync Completed ');
      }).on('paused',  (info) => {
        //this.sync$.next(false);
        console.log('Remote Sync PAUSED: ', info);
        // replication was paused, usually because of a lost connection
      }).on('active',  (info) => {
        this.sync$.next(0);
        console.log('Remote Sync ACTIVE: ', info);
      });
  }

  waitForReady(): Observable<any> {
    // let others know are datasource is ready
    return this._pouchReady$.pipe(first(ready => ready));
  }

}
