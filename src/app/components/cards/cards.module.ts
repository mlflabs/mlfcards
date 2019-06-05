import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from './card/card.component';
import { CardsComponent } from './cards/cards.component';

@NgModule({
  declarations: [
      CardComponent,
      CardsComponent,
    ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports: [
    CardComponent,
    CardsComponent,
  ]
})
export class CardsModule { }
