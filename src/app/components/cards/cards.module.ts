import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from './card/card.component';
import { CardsComponent } from './cards/cards.component';
import { PlayDefaultComponent } from './play-default/play-default.component';
import { EditCardComponent } from './edit-card/edit-card.component';

@NgModule({
  declarations: [
      CardComponent,
      CardsComponent,
      EditCardComponent,
      PlayDefaultComponent,
    ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports: [
    CardComponent,
    EditCardComponent,
    CardsComponent,
    PlayDefaultComponent,
  ]
})
export class CardsModule { }
