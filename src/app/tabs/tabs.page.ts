import { Component } from '@angular/core';


@Component({
  templateUrl: 'tabs.page.html'
})
export class TabsPage {


  public tabPages = [
    {
      title: 'Home',
      url: 'home',
      icon: 'home'
    },
    /*
    {
      title: 'Play',
      url: '',
      icon: 'play'
    },
    {
      title: 'Lists',
      url: '/projects/list',
      icon: 'albums'
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: 'settings'
    },
    */
  ];

  constructor() {

  }
}
