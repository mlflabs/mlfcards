import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Observable, fromEvent, Subject, BehaviorSubject } from 'rxjs';
import { map, debounceTime, filter, first } from 'rxjs/operators';
import { Doc, PROJECT_SERVICE, PROJECT_INDEX_SERVICE, ProjectItem, LASTCHAR, DIV } from '../models';
import { generateCollectionId, generateShortCollectionId, generateShortUUID, waitMS } from '../utils';
import { isEqual } from 'lodash';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { Platform } from '@ionic/angular';

PouchDB.plugin(PouchDBFind);
import PouchDBQuickSearch from 'pouchdb-quick-search';
//PouchDB.plugin(require('pouchdb-quick-search'));
PouchDB.plugin(PouchDBQuickSearch);

@Injectable({
  providedIn: 'root'
})
export class DictService {
  private _pouch: any;
  public ready = false;
  private _pouchReady$ = new BehaviorSubject(this.ready);
  public sync$ = new BehaviorSubject(100);

  private forceAddChars = {
    儿: 'er',
    了: 'le',
  };
  private punctuationMarks = ['《','》','。','，','（','）','；',':','”','“',
  '.',',','+','！','!','？','?','”','、','：','一','…','‘','’', '', '—'];

  private _localPouchOptions = {
    revs_limit: 2,
    auto_compaction: true
  };

  constructor(public authService: AuthService) {
    this.authService.waitForReady().subscribe(() => {
      this.initPouch('pouch_dictionary');
    });
   }

   public async search(value) {
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

   public async searchChinese(value: string) {
    console.log('searching chinese');
    let space = ' ';
    let buffer = 0;

    const words = [];
    let tempWord, prevWord;
    let p = 0; // current position

    // remove all punctuations, and spaces
    const valueA = Array.from(value);
    const text = valueA.filter(c => !this.isPunctuation(c)).join('')+' ';
    const total = text.length;

    while( p < total ) {
      let exists = true;
      let length = 1;
      let w;

      tempWord = false;
      while(exists) {
        space = ' ';

        w = text.substr(p, length);

        prevWord = tempWord;
        tempWord = await this.isChineseWord(w);
        if(tempWord) {
          length ++;
        }
        else {
          if(prevWord)
            words.push(prevWord);
          exists = false;
        }

        if((p+length) > total) {
          //we are at the end, just exit
          exists = false;
          //lastchar = true;
        }
      }
      if(length === 1)
        buffer = 1;
      else
        buffer = length - 1;
      p += buffer;
    }
    return words;
  }

  public async searchEnglish(value) {
     try {
      return await this._pouch.search({
        query: value,
        highlighting: true,
        highlighting_pre: '<em>',
        highlighting_post: '</em>',
        limit: 15,
        skip: 0,
        include_docs: true,
        fields: ['_id', 'def.cc', 'def.g', 'def.usr']
      });
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

  public isPunctuation(char) {
    if(this.punctuationMarks.find(c => c === char))
      return true;
    return false;
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
      fields: ['_id', 'def.cc', 'def.g', 'def.usr'],
      build: true
    });
    console.log('Search Index: ', searchindex);
  }

  syncRemote() {
    const remoteDB = new PouchDB(environment.dict_db,{});

    const opts = {
      live: false,
      retry: false,
      batch_size:500,

    };

    this._pouch.replicate.from(remoteDB, opts)
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
