import {IVector2} from "../event";
import {Subject} from "rxjs";

export abstract class CommonControllerComponent {
   protected readonly resizeObject: IVector2 = {x: 0, y: 0};
   protected readonly resizeSubject = new Subject<IVector2>();
   public readonly resize$ = this.resizeSubject.pipe();

   protected readonly mouseMoveObject: IVector2 = {x: 0, y: 0};
   protected readonly mouseMoveSubject = new Subject<IVector2>();
   public readonly mouseMove$ = this.mouseMoveSubject.pipe();
}
