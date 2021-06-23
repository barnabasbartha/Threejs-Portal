import {Inject, Singleton} from 'typescript-ioc';
import {CoreControllerComponent} from './core-controller.component';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

@Singleton
export class CoreKeyboardControllerComponent {
   readonly keys$: Observable<void>;
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
         map(() => null),
      );
   }

   isPressed(key: string): boolean {
      return this.pressedKeys.has(key);
   }
}
