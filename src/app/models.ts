export const PROJECT_SERVICE = 'p';
export const PROJECT_INDEX_SERVICE = 'pi';
export const CARD_COLLECTION = 'c';

export const LASTCHAR = String.fromCharCode(65535);
export const DIV = '|';
export const DOUBLE_DIV = '||';

export const ACTION_SAVE = 'save';
export const ACTION_REMOVE = 'remove';

export const COLOR_PRIMARY = 'primary';
export const COLOR_SECONDARY = 'secondary';
export const COLOR_TERTIARY = 'tertiary';
export const COLOR_SUCCESS = 'success';
export const COLOR_WARNING = 'warning';
export const COLOR_DANGER = 'danger';
export const COLOR_LIGHT = 'light';
export const COLOR_MEDIUM = 'medium';
export const COLOR_DARK = 'dark';

export class Doc {
  public _id?: string;
  public _rev?: string;
  public _deleted?: boolean;
  public updated?: number;

  constructor(values: Object = {}) {
      Object.assign(this, values);
  }

}

export class ProjectItem extends Doc {
  public name?: string;
  public note?: string;

  public user?;
  public meta_access?;
  public childId?;
  public priority?: number; // how frequetly to study these cards
}

export class CardItem extends Doc {
  public side1?: string;
  public side2?: string;
  public side3?: string;
  public node?: string;

  //public progress?: number;
  public lastStudySession?: number;
  public nextStudySession?: number;
  public proficiencyLevel = 0;
  public studyFinished?: boolean;
  //public studied_total?: number;
  //public studied_success?: number;
  //public studied_failed?: number;

  public currentSidePoints = {}; // object of numbers each key is side number

  //public currentGamePoints?: number;
  public currentWrongAnswers?: number;
  public currentCorrectAnswers?: number;
  public currentNotKnow?: number;

  public sessions?: object;

  public projectId: number;
  public meta_access?;
}


export class FileItem extends Doc {
  public name?: string;
  public note?: string;
  public filename?: string;
}























