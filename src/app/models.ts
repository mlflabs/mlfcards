export const PROJECT_SERVICE = 'p';
export const PROJECT_INDEX_SERVICE = 'pi';
export const CARD_COLLECTION = 'c';

export const LASTCHAR = String.fromCharCode(65535);
export const DIV = '|';
export const DOUBLE_DIV = '||';

export const ACTION_SAVE = 'save';
export const ACTION_REMOVE = 'remove';

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
}

export class CardItem extends Doc {
  public side1?: string;
  public side2?: string;
  public side3?: string;
  public node?: string;

  public progress?: number;
  public lastStudied?: Date;
  public studied_total?: number;
  public studied_success?: number;
  public studied_failed?: number;

  public projectId: number;
  public meta_access?;
}


export class FileItem extends Doc {
  public name?: string;
  public note?: string;
  public filename?: string;
}























