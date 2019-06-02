import {
  animation, trigger, animateChild, group,
  transition, animate, style, query
} from '@angular/animations';
import { COLOR_WARNING } from './models';

export const correctAnser = animation([
  style({
    //height: '{{ height }}',
    //opacity: '{{ opacity }}',
    backgroundColor: COLOR_WARNING,
    time: '1s'
  }),
  animate('{{ time }}')
]);