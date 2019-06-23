import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Observable, fromEvent, Subject, BehaviorSubject } from 'rxjs';
import { map, debounceTime, filter, first } from 'rxjs/operators';
import { Doc, PROJECT_SERVICE, PROJECT_INDEX_SERVICE, ProjectItem, LASTCHAR, DIV, CARD_COLLECTION, CardItem } from '../models';
import { generateCollectionId, generateShortCollectionId, generateShortUUID, waitMS } from '../utils';
import { isEqual, uniqBy } from 'lodash';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

export const TYPE_TASKS = 'todotasks';
export const TYPE_CATEGORIES = 'todocategories';

PouchDB.plugin(PouchDBFind);
// PouchDB.debug.enable('pouchdb:find');

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _pouch: any;
  public ready = false;
  private _pouchReady$ = new BehaviorSubject(this.ready);
  public addSyncCall$ = new Subject();
  private _changes = new Subject();
  private _user;

  private _localPouchOptions = {
    revs_limit: 5,
    auto_compaction: true
  };

  constructor(private platform: Platform,
              public authService: AuthService) {

    this.authService.waitForReady().subscribe(() => {

        this._user = authService.user;
        this.initPouch(environment.pouch_prefix + this._user.username,
          this._user.username !== 'Guest',
          false );

        authService.user$.subscribe(user => {
            if(user.username !== this._user.username) {
              // only update if we are different, user change
              // also see if we are updating from guest, import old data
              if(this._user.username === 'Guest') {
                this.initPouch(environment.pouch_prefix+user.username, true, true);
              }
              else {
                this.initPouch(environment.pouch_prefix+user.username, true, false);
              }
              this._user = user;
            }
          });

        this.addSyncCall$.asObservable().pipe(debounceTime(environment.server_sync_debounce_time))
            .subscribe(() => {
                this.syncRemote();
        });
    });
  }

  async findCardBySide1(word: string) {
    try {
      const res =  await this._pouch.find({
        selector: {
          side1: word
        }
      });
      return res['docs'];
    }
    catch (e) {
      console.log('Find Card Error: ', e.message);
      return [];
    }
  }

  async getStudyCards(date = Date.now(), unique = false) {
    try {
      const docs = await this._pouch.allDocs();
      console.log(date);
      console.log(docs);
      // const all = await this._pouch.allDocs({ include_docs: true });
      // console.log(all);
      const res =  await this._pouch.find({
        selector: {
          nextStudySession: {
            $lte:date,
            $gt: 0,
          }
        }
      });
      console.log('GetStudyCards RES:: ', res);
      if(unique) {
        //remove any duplicates
        return uniqBy(uniqBy(res['docs'], 'side1'), 'side2');
      }
      return res['docs'];
    }
    catch (e) {
      console.log('Find Card Error: ', e.message);
      return [];
    }
  }

  async addCardFromWord(word,
        project = new ProjectItem({_id: 'p|pi|default', childId: 'p|default'}),
        syncRemote = true) {
    try {
      //make card
      let def = word['def'].cc || word['def'].g ||
          word['def'].usr || ' ';
      def = def.substring(0, def.indexOf('|'));

      const card = new CardItem({
      note: '',
      side1: word['_id'],
      side2: def,
      side3: word['pinin'],
      nextStudySession:1, // so its added to index
      });
      //add the word
      const res =  await this.saveCard(card, project);
      if(syncRemote) this.addSyncCall$.next();
      return res;
    }
    catch (e) {
      console.log(e.message);
      return false;
    }
  }

  async saveCard( card: CardItem,
                  project: ProjectItem = new ProjectItem({_id: 'p|pi|default', childId: 'p|default'}),
                  syncRemote = true) {
    //add some necessary data
    if(!card.nextStudySession) {
      card.nextStudySession = 1; //need a valid num, for indexing
    }

    return await this.saveInProject(card,project, CARD_COLLECTION, null, null, syncRemote);
  }


  subscribeChanges(): Observable<any> {
    return this._changes.asObservable().pipe(
      // debounceTime(1000),
      map(doc => {
        return doc;
      })
    );
  }

  subscribeCollectionChanges(type: string, debounce:number=0): Observable<any> {
    return this._changes.asObservable().pipe(
      debounceTime(debounce),
      filter(doc => doc['_id'].startsWith(type+'|'))
    );
  }

  subscribeProjectCollectionChanges(project: string,
                                    type: string,
                                    debounce:number=0): Observable<any> {
    console.log('======================+++++++++++++++"');
    console.log('Subscribing::: ', project, type, debounce);
    return this._changes.asObservable().pipe(
      //debounceTime(debounce),
      filter(doc => doc['_id'].startsWith(project+'|'+type+'|'))
    );
  }

  subscribeProjectsChanges(debounce:number=0): Observable<any> {
    return this._changes.asObservable().pipe(
      debounceTime(debounce),
      filter(doc => doc['_id'].startsWith(PROJECT_SERVICE+'|'+PROJECT_INDEX_SERVICE+'|'))
    );
  }



  subscribeDocChanges(id: string, debounce: number = 0): Observable<any> {
    return this._changes.asObservable().pipe(
      debounceTime(debounce),
      filter(doc => doc['_id'] === id)
    );
  }

  async getByQuery(query) {
    try {
      const res = await this._pouch.find(query);
      return res.docs;
    }
    catch(e) {
      console.log('GetByQuery', query, e);
      return [];
    }
  }

  async getProjectFromChildId(id) {
    const pid = PROJECT_SERVICE+DIV+PROJECT_INDEX_SERVICE+DIV+id.split('|')[1];
    console.log('GetPRojectFromChildID ID: ', pid);
    const doc = await this.getDoc(pid);
    console.log('Project:: ', doc);
    return doc;
  }

  async getAllByType(type, serverRefreshForce = false, attachments=false) {
    const res = await this._pouch.allDocs({
      include_docs: true,
      attachments: attachments,
      startkey: type + DIV,
      endkey: type + DIV + LASTCHAR
    });
    const docs = res.rows.map(row => row.doc);
    return docs;
  }

  async getAllByProjectAndType(project, type, attachments=false) {
    const res = await this._pouch.allDocs({
      include_docs: true,
      attachments: attachments,
      startkey: project + DIV + type + DIV,
      endkey: project + DIV + type + DIV + LASTCHAR
    });
    const docs = res.rows.map(row => row.doc);
    return docs;
  }

  async getAllDocs() {
    const res = await this._pouch.allDocs({include_docs: true});
    const docs = res.rows.map(row => row.doc);
    return docs;
  }

  async remove(id, syncRemote = true) {
    try {
      if (typeof id !== 'string' ) {
        if(id) {
          if(id._id)
            id = id._id;
        }
      }
      const doc = await this._pouch.get(id);
      doc._deleted = true;
      doc.updated = Date.now();
      const res = await this._pouch.put(doc);

      if(syncRemote)
        this.addSyncCall$.next();

      if(res.ok)
        return res;
      else
        return false;
    }
    catch(e) {
      console.log('Remove Pouch Error:: ', e);
      return false;
    }
  }

  async removeProject(project: ProjectItem, syncRemote=true) {
    try {
      //load all project children and remove them
      const res = await this._pouch.allDocs({
        include_docs: true,
        startkey: project.childId + DIV,
        endkey: project.childId + DIV + LASTCHAR
      });
      const docs = res.rows.map(row => Object.assign(
        row.doc, {_deleted: true, updated: Date.now()} ));

      docs.push(Object.assign(project, {_deleted: true, updated: Date.now()}));
      const res2 = await this._pouch.bulkDocs(docs);

      if(syncRemote)
        this.addSyncCall$.next();

      return res2;
    }
    catch(e) {
      console.log('Remove Project Error: ', e);
    }
  }

  async saveNewProject(doc, syncRemote = true): Promise<any> {
    const uuid = generateShortUUID();
    doc._id = PROJECT_SERVICE + DIV + PROJECT_INDEX_SERVICE + DIV + uuid;
    doc.childId = PROJECT_SERVICE+ DIV + uuid;
    doc.user = this.authService.user.username;
    doc.meta_access = [ 'u|'+ this.authService.getUsername() + DIV + uuid, ];

    try {
      const res = await this._pouch.put(doc);

      if(syncRemote)
        this.addSyncCall$.next();

      return res;
    }
    catch(e) {
      console.log('Error saving new project: ', e);
      return false;
    }

  }

  async saveInProject(doc,
                      project: ProjectItem = new ProjectItem(),
                      collection:string='',
                      oldDoc = null,
                      attachment = null,
                      syncRemote = true): Promise<any> {

    // if its a design doc, or query, skip it
    if(doc._id != null && doc._id.startsWith('_') ) {
      return false;
    }

    console.log('Saving Doc: ', doc, project, collection, oldDoc);

    // see if we need to compare changes and only save if there are any
    // lets see if there are actual changes
    // Here we can also load an old doc, see if it exists
    if(!oldDoc && doc._id) {
      try {
        //see if we have old doc.
        oldDoc = await this._pouch.get(doc._id);
      }
      catch(e) {

      }
    }

    if(oldDoc != null) {
      if(isEqual(oldDoc, doc)) {
        return false; // we have no need to save, maybe here we need something else, like a message
      }
    }

    //make sure access is same as project
    doc.meta_access = project.meta_access;

    let res;
    try {
      doc.updated = Date.now();

      if(doc._id == null) {
        doc._id = project.childId +'|' +generateShortCollectionId(collection);
        res = await this._pouch.put(doc);
      }
      else {
        res = await this._pouch.put({...oldDoc, ...doc});
      }

      //see if we have an attachment
      if(attachment) {
        //TODO:: use attachment.size to restrict big files
        res = await this._pouch.putAttachment(doc._id, 'file', res.rev, attachment, attachment.type);
      }

      if(syncRemote)
        this.addSyncCall$.next();

      console.log('Saved doc: ', res);
      if(res.ok)
        return res;
      else
        return false;
    }
    catch(e) {
      console.log('Save Pouch Error: ', e);
      return false;
    }
  }

  async saveSettings(doc) {
    try {
      const settings = await this._pouch.get('settings');
      const newSettings = Object.assign(settings, doc, { _rev: settings._rev });
      console.log('Settings:: ', newSettings);
      this._pouch.put(newSettings);
    }
    catch(e) {
      console.log('Error saving settings Doc: ', e.message);
    }
  }

  async save(doc, collection:string='', oldDoc = null, attachment = null, syncRemote=true): Promise<any> {
    // if its a design doc, or query, skip it
    if(doc._id != null && doc._id.startsWith('_') ) {
      return false;
    }

    if(doc._id && oldDoc == null) {
      oldDoc = await this._pouch.get(doc._id);
    }

    if(!oldDoc) oldDoc = {};


    console.log('Checking if no changes made: ', oldDoc);
    if(isEqual(oldDoc, doc)) {
        console.log('No changes, skip saving');
        return false; // we have no need to save, maybe here we need something else, like a message
    }

    let res;
    try {
      doc.updated = Date.now();

      if(doc._id == null) {
        doc._id = generateCollectionId(collection);
      }

      res = await this._pouch.put({...oldDoc, ...doc});

      //see if we have an attachment
      if(attachment) {
        //TODO:: use attachment.size to restrict big files
        res = await this._pouch.putAttachment(doc._id, 'file', res.rev, attachment, attachment.type);
      }

      if(syncRemote)
        this.addSyncCall$.next();

      console.log('Saved doc: ', res);
      if(res.ok)
        return res;
      else
        return false;
    }
    catch(e) {
      console.log('Save Pouch Error: ', e);
      return false;
    }
  }

  async getImage(id, name) {
    const img = this._pouch.getAttachment(id, name);
    return img;
  }

  async getDoc(id:string, attachments = false, opts = {}): Promise<any> {
    console.log('GET DOC: ', id);
    try {
      const doc = await this._pouch.get(id, { ...{attachments: attachments}, ...opts });
      console.log('Get Doc Loaded: ', doc);
      return doc;
    }
    catch(e) {
      console.log('Get Doc Error: ', id, e);
      return null;
    }
  }

  async findDocsByCategory(id:string): Promise<any> {
    try {
      const docs = await this._pouch.find({
        selector: {
          category: {$eq: id}
        }
      });
      return docs.docs;
    }
    catch(e) {
      console.log('Error finding docs: ', e);
      return [];
    }
  }

  async findDocsByProperty(value, prop:string): Promise<any> {
    try {

      const query = { [prop]: {$eq: value}};
      console.log('Query: ', query);


      const docs = await this._pouch.find({
        selector: {
          [prop]: {$eq: value}
        }
      });

      return docs.docs;
    }
    catch(e) {
      console.log('Error finding docs by property: ', e, value, prop);
      return [];
    }
  }

  async findAllDocsByPropertyNotNull(prop:string): Promise<any> {
    try {
      const docs = await this._pouch.find({
        selector: {
          [prop]: {'$gt': 0}
        }
      });
      console.log('Found docs not null by property::: ', prop, docs);

      return docs.docs;
    }
    catch(e) {
      console.log('Error finding not null docs by property: ', e,  prop);
      return [];
    }
  }

  private async  initPouch(pouchName:string,
                    syncRemote:boolean=false,
                    mergeOldData:boolean=false):Promise<any> {

    console.log('DataProvider->initDB localName: ' + pouchName);

    let olddocs;

    if(mergeOldData) {
      // if we are merging, first get all the data
      olddocs = await this.getAllDocs();
    }
    this._pouch = await new PouchDB(pouchName, this._localPouchOptions);

    window['PouchDB'] = PouchDB;// make it visible for chrome extension

      // create our event subject
    this._pouch.changes({live: true, since: 'now', include_docs:true})
        .on('change', change => {
          console.log('Pouch on change', change);
          this._changes.next(change.doc);
    });

    if(syncRemote)
        this.addSyncCall$.next();

    // load the docs into new pouch db
    if(mergeOldData) {
      olddocs.forEach(doc => {
        this.save(doc);
      });
    }
    await waitMS(200);
    this.ready = true;
    this._pouchReady$.next(true);
    this.createSettingsDoc();

    this._pouch.createIndex({
      index: {fields: ['side1']}
    });
    this._pouch.createIndex({
      index: {fields: ['nextStudySession']}
    });
  }

  async createSettingsDoc() {
    await waitMS(1000);
    console.log('%%%%%%% Create Settings Doc: ');
    try {
      const settings = await this._pouch.get('settings');
      console.log('Settings:: ', settings);
    }
    catch(e) {
      console.log('Error creating settings Doc: ', e);
      if(e.reason === 'missing') {
        const s = {
          _id: 'settings',
          app: environment.app_id,
          meta_access: ['u|' + this.authService.getUsername()]
        };
        console.log(s);
        this._pouch.put(s);
      }
    }
    // create other default docs
    // default project doc
    try {
      const p = new ProjectItem();
      p.name = 'Default';
      p.note = 'All new and unassigned cards are saved here';
      p._id = PROJECT_SERVICE + DIV + PROJECT_INDEX_SERVICE + DIV + 'default';
      p.childId = PROJECT_SERVICE+ DIV + 'default';
      p.user = this.authService.user.username;
      p.meta_access = [ 'u|'+ this.authService.getUsername() + DIV + 'default', ];

      console.log('New Default Project: ', p);
      this._pouch.put(p);
    }
    catch (e) {
      console.log('Error Default Project: ', e.message);
    }
  }


  syncRemote() {
      console.log('----------------------------------');
      console.log('USER::: ', this._user);
      console.log(environment.couch_db);
      console.log(this._user.token);
      console.log('----------------------------------');
      const remoteDB = new PouchDB(environment.couch_db,
        {headers:{ 'x-access-token': this._user.token} });

      const opts = {
        live: false,
        retry: false
      };
      this._pouch.replicate.to(remoteDB, opts);
      this._pouch.replicate.from(remoteDB, opts)
       .on('change', function (change) {
        console.log('Remote Sync: ', change);
      }).on('error', function (err) {
        console.log('Remote Error: ', err);
        // yo, we got an error! (maybe the user went offline?)
      }).on('complete', function () {
        console.log('Remote Sync Completed ');
      }).on('paused', function (info) {
        console.log('Remote Sync PAUSED: ', info);
        // replication was paused, usually because of a lost connection
      }).on('active', function (info) {
        console.log('Remote Sync ACTIVE: ', info);
      });
  }

  public waitForReady(): Observable<any> {
    // let others know are datasource is ready
    return this._pouchReady$.pipe(first(ready => ready));
  }

}
