import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './auth/auth.service';
import { DataService } from './services/data.service';
import { StateService } from './services/state.service';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';
import { CardsModule } from './components/cards/cards.module';
import { ProjectPageModule } from './pages/projects/project/project.module';
import { EditCardComponent } from './components/cards/edit-card/edit-card.component';
import { FormsModule } from '../../node_modules/@angular/forms';
import { HomePage } from './pages/home/home.page';
import { SettingsPage } from './pages/settings/settings.page';
import { ProjectsPage } from './pages/projects/projects/projects.page';
import { TestPage } from './pages/test/test.page';
import { TabsPageModule } from './tabs/tabs.module';
import { TabsPage } from './tabs/tabs.page';


@NgModule({
  declarations: [
    AppComponent,
    EditCardComponent,
    TabsPage,

  ],
  entryComponents: [
    EditCardComponent,
    TabsPage,


  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthService,
    DataService,
    StateService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
