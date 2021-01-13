import {Singleton} from "typescript-ioc";
import {KeyEvent} from "../../common/controller/controller.model";
import {EventStatus, IVector2} from "../../common/event.model";
import {Subject} from "rxjs";

@Singleton
export class CoreControllerComponent {
   private readonly resizeObject: IVector2 = {x: 0, y: 0};
   private readonly resizeSubject = new Subject<IVector2>();
   readonly resize$ = this.resizeSubject.pipe();

   private readonly mouseMoveObject: IVector2 = {x: 0, y: 0};
   private readonly mouseMoveSubject = new Subject<IVector2>();
   readonly mouseMove$ = this.mouseMoveSubject.pipe();

   private readonly keySubject = new Subject<KeyEvent>();
   readonly key$ = this.keySubject.pipe();

   private readonly pointerLockSubject = new Subject<EventStatus>();
   readonly pointerLock$ = this.pointerLockSubject.pipe();

   resize(x: number, y: number): void {
      this.resizeObject.x = x;
      this.resizeObject.y = y;
      this.resizeSubject.next(this.resizeObject);
   }

   setPointerLock(status: EventStatus): void {
      this.pointerLockSubject.next(status);
   }

   move(x: number, y: number): void {
      this.mouseMoveObject.x = x;
      this.mouseMoveObject.y = y;
      this.mouseMoveSubject.next(this.mouseMoveObject);
   }

   keyEvent(keyEvent: KeyEvent): void {
      this.keySubject.next(keyEvent);
   }
}
