import { Component, OnInit } from '@angular/core';
import { ProjectItem } from '../../../models';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.page.html',
  styleUrls: ['./project-edit.page.scss'],
})
export class ProjectEditPage implements OnInit {
  item = new ProjectItem();


  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }


  onSavedEvent(event) {
    console.log('onSavedEvent: ', event);
    this.close();
  }

  onRemovedEvent(event) {
    console.log('onRemovedEvent: ', event);
    this.close();
  }


  close() {
    this.modalController.dismiss();
  }

}
