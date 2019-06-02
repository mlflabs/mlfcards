import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '../../node_modules/@angular/router';
import { AuthService } from './auth/auth.service';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  isGuest = true;

  public appPages = [
    {
      title: 'Home',
      url: '',
      icon: 'home'
    },
    {
      title: 'Projects',
      url: '/projects/list',
      icon: 'albums'
    },
    {
      title: 'Tools-Divide',
      url: '/divide',
      icon: 'list'
    },
    {
      title: 'Admin-Insert',
      url: '/insert-book',
      icon: 'add'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public router: Router,
    public auth: AuthService,
    public state: StateService,
    public navCtr: NavController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.auth.waitForReady().subscribe(ready => {
        this.authSub();
      });
    });
  }

  authSub() {
    this.auth.isAuthenticated$.subscribe(state => {
      console.log('Checking user State, state:: ', state);
      if (state) {
        //this.appPages = this._appPages.filter(p => p.auth === true);
        this.router.navigate(['']);

        this.isGuest = false;
      } else {
        // add login page
        //this.appPages = this._appPages.filter(p => p.auth === false);
        this.router.navigate(['login']);
        this.isGuest = true;
      }
    });
  }

  printUsername() {
    if(this.auth.user) {
      return this.auth.user.username.charAt(0).toUpperCase() +
        this.auth.user.username.slice(1);
    }
    return 'Guest';
  }

  printAvatarUrl() {
    return 'assets/avatars/default.png';
  }

  goToEditProgile() {

  }

  logout() {
    this.auth.logout();
  }

  login() {
    this.navCtr.navigateForward('/login');
  }

  register() {
    this.navCtr.navigateForward('/register');
  }

}
