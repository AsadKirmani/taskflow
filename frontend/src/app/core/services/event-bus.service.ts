import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventBusService {

  private boardUpdatedSource = new Subject<void>();
  private taskUpdatedSource = new Subject<void>();

  boardUpdated$ = this.boardUpdatedSource.asObservable();
  taskUpdated$ = this.taskUpdatedSource.asObservable();

  notifyBoardUpdate() {
    this.boardUpdatedSource.next();
  }

  notifyTaskUpdate() {
    this.taskUpdatedSource.next();
  }
}