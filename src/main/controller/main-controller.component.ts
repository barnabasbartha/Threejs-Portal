import {Singleton} from "typescript-ioc";
import {CommonControllerComponent} from "../../common/controller/common-controller.component";

@Singleton
export class MainControllerComponent extends CommonControllerComponent {
   constructor() {
      super();
      MainControllerComponent.addEventListener(window, 'resize', () => {
         this.resizeObject.x = window.innerWidth;
         this.resizeObject.y = window.innerHeight;
         this.resizeSubject.next(this.resizeObject);
      });
   }

   init(target: HTMLElement) {
      MainControllerComponent.addEventListener<MouseEvent>(target, 'mousemove', event => {
         this.mouseMoveObject.x = event.movementX;
         this.mouseMoveObject.y = event.movementY;
         this.mouseMoveSubject.next(this.mouseMoveObject);
      });
   }

   private static addEventListener<T>(target: GlobalEventHandlers, type: string, listener: (event: T) => void) {
      // @ts-ignore
      target.addEventListener(type, listener, {passive: true});
   }
}
