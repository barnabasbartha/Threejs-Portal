import {Singleton} from "typescript-ioc";
import {CommonControllerComponent} from "../../common/controller/common-controller.component";

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
}
