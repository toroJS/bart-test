import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  Routes,
  UrlTree,
} from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { HomeComponent } from './components/home/home.component';
import { GameService } from './components/game/game.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

const userGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const currentUser = inject(GameService).user;

  if (!currentUser) {
    return inject(Router).createUrlTree(['/', 'home']);
  }

  return true;
};

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'game',
    component: GameComponent,
    canActivate: [userGuard],
  },
];
