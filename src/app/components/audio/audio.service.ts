import { Injectable } from '@angular/core';

export enum AUDIO {
  BURST = 'burst',
  COLLECT = 'collect',
  INFLATE = 'inflate',
  CHEERS = 'cheers',
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audios = new Map<AUDIO, HTMLAudioElement>([
    [AUDIO.BURST, new Audio('assets/sounds/balloon-pop.mp3')],
    [AUDIO.COLLECT, new Audio('assets/sounds/collect.mp3')],
    [AUDIO.INFLATE, new Audio('assets/sounds/inflate.mp3')],
    [AUDIO.CHEERS, new Audio('assets/sounds/cheers.mp3')],
  ]);

  constructor() {}

  playSound(sound: AUDIO) {
    this.audios.get(sound)?.play();
  }
}
