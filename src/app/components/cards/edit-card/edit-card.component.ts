import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter, } from '@angular/core';
import { CardItem, ACTION_SAVE, ACTION_REMOVE } from '../../../models';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-card',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.scss'],
})
export class EditCardComponent implements OnInit {
  @Input() showHeader = false;
  @Input() item:CardItem = new CardItem();

  constructor(public modalController: ModalController) { }

  ngOnInit() {}

  save() {
    this.modalController.dismiss({
      action: ACTION_SAVE,
      item: this.item});
  }

  remove() {
    this.modalController.dismiss({
      action: ACTION_REMOVE,
      item: this.item._id||null});
  }

  close() {
    this.modalController.dismiss();
  }

}
