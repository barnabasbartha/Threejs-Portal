import {Singleton} from "typescript-ioc";
import {KeyEvent} from "../../common/controller/controller.model";
import {EventStatus, IVector2} from "../../common/event.model";
import {Subject} from "rxjs";

@Singleton
export class CoreControllerComponent {
   private readonly resizeObject: IVector2 = {x: 0, y: 0};
   private readonly resizeSubject = new Subject<IVector2>();
   public readonly resize$ = this.resizeSubject.pipe();

   private readonly mouseMoveObject: IVector2 = {x: 0, y: 0};
   private readonly mouseMoveSubject = new Subject<IVector2>();
   public readonly mouseMove$ = this.mouseMoveSubject.pipe();

   private readonly keySubject = new Subject<KeyEvent>();
   public readonly key$ = this.keySubject.pipe();

   private readonly pointerLockSubject = new Subject<EventStatus>();
   public readonly pointerLock$ = this.pointerLockSubject.pipe();

   resize(x: number, y: number) {
      this.resizeObject.x = x;
      this.resizeObject.y = y;
      this.resizeSubject.next(this.resizeObject);
   }

   setPointerLock(status: EventStatus) {
      this.pointerLockSubject.next(status);
   }

   move(x: number, y: number) {
      this.mouseMoveObject.x = x;
      this.mouseMoveObject.y = y;
      this.mouseMoveSubject.next(this.mouseMoveObject);
   }

   keyEvent(keyEvent: KeyEvent) {
      this.keySubject.next(keyEvent);
   }
}
