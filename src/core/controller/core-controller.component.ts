import {Singleton} from "typescript-ioc";
import {CommonControllerComponent} from "../../common/controller/common-controller.component";
import {KeyEvent} from "../../common/controller/controller.model";

@Singleton
export class CoreControllerComponent extends CommonControllerComponent {
   resize(x: number, y: number) {
      this.resizeObject.x = x;
      this.resizeObject.y = y;
      this.resizeSubject.next(this.resizeObject);
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
