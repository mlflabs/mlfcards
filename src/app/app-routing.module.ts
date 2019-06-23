import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './auth/auth-guard.service';
import { HomePage } from './pages/home/home.page';
import { ProjectsPage } from './pages/projects/projects/projects.page';
import { TestPage } from './pages/test/test.page';
import { SettingsPage } from './pages/settings/settings.page';
import { TabsPage } from './tabs/tabs.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  /*
  {
    path: 'projects',
    redirectTo: 'projects/list',
    pathMatch: 'full'
  },
  { path: 'login', loadChildren: './auth/pages/login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './auth/pages/register/register.module#RegisterPageModule' },
  { path: 'forgotPassword', loadChildren: './auth/pages/forgot-password/forgot-password.module#ForgotPasswordPageModule' },

  { path: 'settings', component: SettingsPage },

  { path: 'user',
  canActivate: [ AuthGuardService ],
  loadChildren: './auth/pages/user/user.module#UserPageModule' },

  { path: 'projects',
    children: [
      { path: 'list', component: ProjectsPage },
      { path: 'p/:id',
        children: [
          { path: '',  loadChildren: './pages/projects/project/project.module#ProjectPageModule' },
          //{ path: 'play', loadChildren: './pages/play/play-default/play-default.module#PlayDefaultPageModule' },
        ]},
    ]
  },
  {
    path: 'study',
    children: [
      { path: 'default',   component: TestPage },
    ]
  },
  {
    path: 'dict',
    children: [
       // { path: '', loadChildren: './pages/dict/lookup/lookup.module#LookupPageModule' },
      // { path: ':id', loadChildren: './pages/dict/lookup/lookup.module#LookupPageModule' },
      { path: 'word/:source', loadChildren: './pages/dict/word-detail/word-detail.module#WordDetailPageModule' },
      { path: 'word/:source/:def', loadChildren: './pages/dict/word-detail/word-detail.module#WordDetailPageModule' },
      { path: 'word/:source/:def/:pinyin', loadChildren: './pages/dict/word-detail/word-detail.module#WordDetailPageModule' },
    ],
  },


  { path: 'word-detail', loadChildren: './pages/dict/word-detail/word-detail.module#WordDetailPageModule' },
  { path: 'home', component: HomePage },
  { path: 'edit', loadChildren: './pages/cards/edit/edit.module#EditPageModule' },
  { path: 'test', loadChildren: './pages/test/test.module#TestPageModule' },

  */
  { path: '',
    component: TabsPage,
    children: [
      { path: 'home', loadChildren: './pages/home/home.module#HomePageModule'},
      { path: 'projects',
          children: [
            { path: 'list', component: ProjectsPage },
            { path: 'p/:id',
              children: [
                { path: '',  loadChildren: './pages/projects/project/project.module#ProjectPageModule' },
                //{ path: 'play', loadChildren: './pages/play/play-default/play-default.module#PlayDefaultPageModule' },
              ]},
          ]
      },
    ],
  }

 // { path: 'dict', loadChildren: './pages/dict/dict/dict.module#DictPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
