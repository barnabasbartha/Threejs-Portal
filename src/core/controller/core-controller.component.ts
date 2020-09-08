import {Singleton} from "typescript-ioc";
import {CommonControllerComponent} from "../../common/controller/common-controller.component";
import {KeyEvent} from "../../common/controller/controller.model";
import {EventStatus} from "../../common/event.model";

@Singleton
export class CoreControllerComponent extends CommonControllerComponent {
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
