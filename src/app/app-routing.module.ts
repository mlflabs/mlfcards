import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './auth/auth-guard.service';
import { PlayDefaultComponent } from './components/cards/play-default/play-default.component';

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

  { path: 'user',
  canActivate: [ AuthGuardService ],
  loadChildren: './auth/pages/user/user.module#UserPageModule' },

  { path: 'projects',
    children: [
      { path: 'list', loadChildren: './pages/projects/projects/projects.module#ProjectsPageModule' },
      { path: 'p/:id',
        children: [
          { path: '',  loadChildren: './pages/projects/project/project.module#ProjectPageModule' },
        ]},
    ]
  },
  {
    path: 'dict',
    children: [
      { path: '', loadChildren: './pages/dict/lookup/lookup.module#LookupPageModule' },
      { path: ':id', loadChildren: './pages/dict/lookup/lookup.module#LookupPageModule' },
      { path: 'word/:id', loadChildren: './pages/dict/word-detail/word-detail.module#WordDetailPageModule' },
    ],
  },
  { path: 'divide', loadChildren: './pages/tools/divide/divide.module#DividePageModule' },
  { path: 'insert-book', loadChildren: './pages/admin/insert-book/insert-book.module#InsertBookPageModule' },
  { path: 'play-modal', loadChildren: './components/cards/play-modal/play-modal.module#PlayModalPageModule' },
  { path: 'lookup', loadChildren: './pages/dict/lookup/lookup.module#LookupPageModule' },
  { path: 'word-detail', loadChildren: './pages/dict/word-detail/word-detail.module#WordDetailPageModule' },
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
