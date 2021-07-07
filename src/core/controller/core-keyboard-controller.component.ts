import {Inject, Singleton} from 'typescript-ioc';
import {CoreControllerComponent} from './core-controller.component';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {KeyEvent} from "../../common/controller/controller.model";

@Singleton
export class CoreKeyboardControllerComponent {
   readonly keys$: Observable<KeyEvent>;
   private readonly pressedKeys = new Set<string>();

   constructor(@Inject private readonly controller: CoreControllerComponent) {
      this.keys$ = controller.key$.pipe(
         tap((keyEvent) => {
            if (keyEvent.status) {
               this.pressedKeys.add(keyEvent.key);
            } else {
               this.pressedKeys.delete(keyEvent.key);
            }
         }),
      );
   }

   isPressed(key: string): boolean {
      return this.pressedKeys.has(key);
   }
}
