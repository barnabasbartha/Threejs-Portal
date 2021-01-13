import { Inject, Singleton } from 'typescript-ioc';
import { GuiComponent } from './gui.component';
import { MainControllerComponent } from '../controller/main-controller.component';

@Singleton
export class GuiManager {
   constructor(
      @Inject private readonly component: GuiComponent,
      @Inject private readonly controller: MainControllerComponent,
   ) {
      controller.pointerLock$.subscribe((status) => {
         if (status) component.hide();
         else component.show();
      });
   }
}
