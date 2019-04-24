import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './auth/auth-guard.service';
import { PlayDefaultComponent } from './components/cards/play-default/play-default.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full'
  },
  {
    path: 'projects',
    redirectTo: 'projects/list',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
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
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
