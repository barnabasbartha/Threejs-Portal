import {EventStatus, IVector2} from "../event.model";
import {Subject} from "rxjs";
import {KeyEvent} from "./controller.model";

export abstract class CommonControllerComponent {
   protected readonly resizeObject: IVector2 = {x: 0, y: 0};
   protected readonly resizeSubject = new Subject<IVector2>();
   public readonly resize$ = this.resizeSubject.pipe();

   protected readonly mouseMoveObject: IVector2 = {x: 0, y: 0};
   protected readonly mouseMoveSubject = new Subject<IVector2>();
   public readonly mouseMove$ = this.mouseMoveSubject.pipe();

   protected readonly keySubject = new Subject<KeyEvent>();
   public readonly key$ = this.keySubject.pipe();

   protected readonly pointerLockSubject = new Subject<EventStatus>();
   public readonly pointerLock$ = this.pointerLockSubject.pipe();
}
