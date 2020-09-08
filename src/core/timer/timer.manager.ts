import {Inject, Singleton} from "typescript-ioc";
import {TimerComponent} from "./timer.component";
import {CoreControllerComponent} from "../controller/core-controller.component";

@Singleton
export class TimerManager {
   constructor(@Inject protected readonly component: TimerComponent,
               @Inject protected readonly controller: CoreControllerComponent) {
      controller.pointerLock$.subscribe(status => {
         if (status) component.enable();
         else component.disable();
      })
   }
}
