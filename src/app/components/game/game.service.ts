import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private balloonHeightSubject = new BehaviorSubject<string>('100px');
  balloonHeight$ = this.balloonHeightSubject.asObservable();
  private balloonWidthSubject = new BehaviorSubject<string>('100px');
  balloonWidth$ = this.balloonWidthSubject.asObservable();
  private burstSubject = new BehaviorSubject<boolean>(false);
  burst$ = this.burstSubject.asObservable();

  pumpBalloon(pumpStrength: number) {
    const burstThreshold = 0.8;

    if (
      !this.burstSubject.value &&
      Math.random() < burstThreshold * pumpStrength
    ) {
      this.burstSubject.next(true);
    } else {
      this.balloonHeightSubject.next(
        this.calculateNewSize(this.balloonHeightSubject.value, pumpStrength)
      );
      this.balloonWidthSubject.next(
        this.calculateNewSize(this.balloonWidthSubject.value, pumpStrength)
      );
    }
  }

  resetBalloon() {
    this.burstSubject.next(false);
    this.balloonHeightSubject.next('100px');
    this.balloonWidthSubject.next('100px');
  }

  private calculateNewSize(currentSize: string, pumpStrength: number): string {
    return parseInt(currentSize) + pumpStrength * 10 + 'px';
  }
}
