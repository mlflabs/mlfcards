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
  //public studied_failed?: numbeter;


 // study types
    // stage, ex.
    // 0. pinyin -> meaning
    // 1. char -> pinyin
    // 2. pinyin -> char
    // 3 . meaning -> char
    // 4. char -> meaning
    //
  public currentStudyStage = 0;

  //public currentGamePoints?: number;
  public currentWrongAnswers = 0;
  public currentCorrectAnswers = 0;
  public currentNotKnow = 0;

  public totalWrongAnswers  = 0;
  public totalCorrectAnswers = 0;
  public totalNotKnow = 0;



  public sessions = {};

  public projectId: number;
  public meta_access?;
}

export const getProjectIdFromChildId = (id: string) => {
  try {
    const a = id.split('|');
    return a[0] + '|' + a[1];
  }
  catch(e) {
    console.log(e.message);
    return null;
  }
};

export class FileItem extends Doc {
  public name?: string;
  public note?: string;
  public filename?: string;
}























