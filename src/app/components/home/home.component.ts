import { Component } from '@angular/core';
import { GameService } from '../game/game.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { BalloonComponent } from '../balloon/balloon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    BalloonComponent,
  ],
})
export class HomeComponent {
  public username: string = '';
  constructor(private gameService: GameService, private router: Router) {}

  saveUser() {
    this.gameService.user = this.username;
    this.router.navigate(['/game']);
  }
}
