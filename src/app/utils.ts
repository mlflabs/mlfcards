import { BehaviorSubject } from '../../node_modules/rxjs';

export class Utils {
}


export function saveIntoArray(item: Object, ary: Array<any> = [], idKey: string = '_id'): Array<any> {
  let i = getIndexById(item[idKey], ary, idKey);
  if (i === -1) {
    i = ary.length;
  }
  return [...ary.slice(0, i),
  Object.assign({}, item),
  ...ary.slice(i + 1)];
}

export function getIndexById(id: string, ary: any, idKey: string = '_id'): number {
  for (let i = 0; i < ary.length; i++) {
    if (id === ary[i][idKey]) {
      return i;
    }
  }
  // if we don't have a match return null
  return -1;
}


export function generateCollectionId(prefix:string=''):string {
  return prefix+'|'+generateUUID();
}

export function generateShortCollectionId(prefix:string=''):string {
  return prefix+'|'+generateShortUUID();
}

export function generateShortUUID(): string {
  let d = Date.now();

  const uuid = 'xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // tslint:disable-next-line:no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    // tslint:disable-next-line:no-bitwise
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

export function generateUUID(): string {
  let d = Date.now();

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // tslint:disable-next-line:no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    // tslint:disable-next-line:no-bitwise
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

export function deepCompare( x, y ) {
  if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same

  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects

  if ( x.constructor !== y.constructor ) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

  for ( const p in x ) {
    if ( ! x.hasOwnProperty( p ) ) continue;
      // other properties were tested using x.constructor === y.constructor

    if ( ! y.hasOwnProperty( p ) ) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined

    if ( x[ p ] === y[ p ] ) continue;
      // if they have the same strict value or identity then they are equal

    if ( typeof( x[ p ] ) !== 'object' ) return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

    if ( ! deepCompare( x[ p ],  y[ p ] ) ) return false;
      // Objects and Arrays must be tested recursively
  }

  for ( const p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
      // allows x[ p ] to be set to undefined
  }
  return true;
}

export const waitMS = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};



export const addDays = (date: Date, days: number): Date => {
  console.log('calculating next date');
  const  d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};



export class CountDownTimer {
  private duration;
  public granularity;
  public progress = 0;
  public tick$ = new BehaviorSubject(0);
  public status$ = new BehaviorSubject('stopped');
  public running;

  //duration in seconds
  constructor(duration, granularity = 1000) {
    this.duration = duration * 1000;
    this.granularity = granularity;
    this.running = false;
  }

  pause() {
    console.log('Paused');
    this.running = false;
    this.status$.next('paused');
  }

  continue() {
    console.log('Continue');
    if (this.running) {
      return;
    }
    this.running = true;
    this.status$.next('running');
    this.runInterval();
  }

  start() {
    console.log('Starting');
    if (this.running) {
      return;
    }
    this.running = true;
    this.progress = this.duration;
    this.status$.next('running');
    this.tick$.next(Math.floor(this.progress/1000));

    this.runInterval();
  }

  async runInterval() {
    if(!this.running) {
      return;
    }
    if(this.progress <= 0) {
      this.running = false;
      this.tick$.next(0);
      this.status$.next('ended');
      return;
    }

    await waitMS(this.granularity);

    this.progress -= this.granularity;
    this.tick$.next(Math.floor(this.progress/1000));
    if(this.running)
      this.runInterval();
  }
}



