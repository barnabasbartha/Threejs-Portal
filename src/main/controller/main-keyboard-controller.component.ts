import {Inject, Singleton} from "typescript-ioc";
import {MainControllerComponent} from "./main-controller.component";
import {Observable} from "rxjs";
import {KeyEvent} from "../../common/controller/controller.model";
import {filter, tap} from "rxjs/operators";

@Singleton
export class MainKeyboardControllerComponent {
   public readonly key$: Observable<KeyEvent>;
   private readonly pressedKeys = new Set<string>();

   constructor(@Inject private readonly controller: MainControllerComponent) {
      this.key$ = controller.key$.pipe(
         filter(keyEvent => {
            return (keyEvent.status && !this.pressedKeys.has(keyEvent.key)) ||
               (!keyEvent.status && this.pressedKeys.has(keyEvent.key))
         }),
         tap(keyEvent => {
            if (keyEvent.status) {
               this.pressedKeys.add(keyEvent.key);
            } else {
               this.pressedKeys.delete(keyEvent.key);
            }
         })
      );
   }
}
