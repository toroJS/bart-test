import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { GameService } from '../game/game.service';
import { DataService } from '../../data/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { BalloonComponent } from '../balloon/balloon.component';
import { MatTableModule } from '@angular/material/table';
import confetti from 'canvas-confetti';
import { AUDIO, AudioService } from '../audio/audio.service';

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
  dataSource$ = this.gameService.rankedData$;

  @ViewChild('confettiCanvas')
  private canvasConfettiRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private gameService: GameService,
    private dataService: DataService,
    private router: Router,
    private audioService: AudioService
  ) {
    this.user = gameService.user;
    const results = gameService.savedGameStats;
  }

  ngAfterViewInit(): void {
    confetti.create(this.canvasConfettiRef.nativeElement, {
      resize: true,
      useWorker: true,
    });
    this.audioService.playSound(AUDIO.CHEERS);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  public handleRestart(): void {
    this.gameService.restartGame();
    this.router.navigate(['/home']);
  }

  // getDocs() {
  //   this.dataService.getAllStats().subscribe((res) => console.log(res));
  // }
}
