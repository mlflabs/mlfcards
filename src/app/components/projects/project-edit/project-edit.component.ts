import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProjectItem } from '../../../models';
import { DataService } from '../../../services/data.service';
import { AlertController } from '../../../../../node_modules/@ionic/angular';

@Component({
  selector: 'app-project-edit-component',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss'],
})
export class ProjectEditComponent implements OnInit {

  @Input() item = new ProjectItem();

  @Output() savedEvent = new EventEmitter<any>();
  @Output() removedEvent = new EventEmitter<any>();

  constructor(public dataService: DataService,
              public alertController: AlertController) { }

  ngOnInit() {}

  async onSubmit() {

    //for projects the id is a bit different, so we need to
    //make a custom one
    if(this.item._id) {
      await this.dataService.save(this.item);
    }
    else {
      await this.dataService.saveNewProject(this.item);
    }

    console.log('ProjectEditComponent Saved: ', this.item);
    this.savedEvent.emit(this.item);
  }


  async remove() {
    if(this.item._id) {
      const alert = await this.alertController.create({
        header: 'Delete Project: '+ this.item.name,
        // subHeader: 'Subtitle',
        message: 'This will REMOVE this project and all its child items, are you sure?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'Remove',
            cssClass: 'danger',
            handler: async () => {
              await this.dataService.removeProject(this.item);
              this.removedEvent.emit(true);
            }
          }
        ]
      });

      await alert.present();
    }
  }

}
