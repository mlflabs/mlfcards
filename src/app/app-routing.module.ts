import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'projects',
    redirectTo: 'projects/list',
    pathMatch: 'full'
  },
  { path: 'login', loadChildren: './auth/pages/login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './auth/pages/register/register.module#RegisterPageModule' },
  { path: 'forgotPassword', loadChildren: './auth/pages/forgot-password/forgot-password.module#ForgotPasswordPageModule' },

  { path: 'settings', loadChildren: './pages/settings/settings.module#SettingsPageModule' },

  { path: 'user',
  canActivate: [ AuthGuardService ],
  loadChildren: './auth/pages/user/user.module#UserPageModule' },

  { path: 'projects',
    children: [
      { path: 'list', loadChildren: './pages/projects/projects/projects.module#ProjectsPageModule' },
      { path: 'p/:id',
        children: [
          { path: '',  loadChildren: './pages/projects/project/project.module#ProjectPageModule' },
          { path: 'play', loadChildren: './pages/play/play-default/play-default.module#PlayDefaultPageModule' },
        ]},
    ]
  },
  {
    path: 'study',
    children: [
      { path: 'default', loadChildren: './pages/test/test.module#TestPageModule' },
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
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'edit', loadChildren: './pages/cards/edit/edit.module#EditPageModule' },
  { path: 'play-default', loadChildren: './pages/play/play-default/play-default.module#PlayDefaultPageModule' },
  { path: 'test', loadChildren: './pages/test/test.module#TestPageModule' },

 // { path: 'dict', loadChildren: './pages/dict/dict/dict.module#DictPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
