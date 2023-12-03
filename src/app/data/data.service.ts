import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  getFirestore,
} from 'firebase/firestore';
import { gameStats } from '../components/game/game.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  db: Firestore;

  constructor() {
    const app = initializeApp(environment.firebaseConfig);
    this.db = getFirestore(app);
  }

  async saveUserResults(username: string, score: gameStats[]) {
    await addDoc(collection(this.db, 'results'), {
      createdAt: Timestamp.fromDate(new Date()),
      score: score,
      user: username,
    });
  }
}