import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { GameService, gameStats } from '../game/game.service';
import { DataService } from '../../data/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { BalloonComponent } from '../balloon/balloon.component';
import { MatTableModule } from '@angular/material/table';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-results',
  standalone: true,
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    BalloonComponent,
    MatTableModule,
  ],
})
export class ResultsComponent implements AfterViewInit {
  numberOfBurstedBalloons!: number;
  user: string;
  totalPoints$ = this.gameService.totalPoints$;
  totalRounds = this.gameService.maxRound;
  userAverageScore!: number;
  displayedColumns: string[] = ['rank', 'user', 'score', 'avg', 'bursted'];
  dataSource: Array<{
    rank: number;
    user: string;
    score: number;
    avg: number;
    bursted: number;
  }> = [];

  @ViewChild('confettiCanvas')
  private canvasConfettiRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private gameService: GameService,
    private dataService: DataService,
    private router: Router
  ) {
    this.user = gameService.user;
    const results = gameService.savedGameStats;
    this.dataSource = [
      { rank: 1, user: '🏆 user1', score: 12, avg: 34, bursted: 4 },
      { rank: 2, user: 'user1', score: 12, avg: 34, bursted: 4 },
      { rank: 3, user: 'user1212324324', score: 12, avg: 34, bursted: 4 },
      { rank: 4, user: 'sd', score: 12, avg: 34, bursted: 4 },
      { rank: 10, user: 'user1', score: 12, avg: 34, bursted: 4 },
    ];
  }

  ngAfterViewInit(): void {
    confetti.create(this.canvasConfettiRef.nativeElement, {
      resize: true,
      useWorker: true,
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  public handleRestart(): void {
    this.router.navigate(['/home']);
    // TODO: restart user game state
  }

  // getDocs() {
  //   this.dataService.getAllStats().subscribe((res) => console.log(res));
  // }
}
