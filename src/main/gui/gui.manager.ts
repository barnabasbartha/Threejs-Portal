import {Inject, Singleton} from "typescript-ioc";
import {GuiComponent} from "./gui.component";
import {MainControllerComponent} from "../controller/main-controller.component";

@Singleton
export class GuiManager {
   constructor(@Inject protected readonly component: GuiComponent,
               @Inject protected readonly controller: MainControllerComponent) {
      controller.pointerLock$.subscribe(status => {
         if (status) component.hide();
         else component.show();
      })
   }
}
