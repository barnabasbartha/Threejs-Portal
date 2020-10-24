import {Inject, Singleton} from "typescript-ioc";
import {WorldComponent} from "./world.component";
import {TimerComponent} from "../timer/timer.component";
import {CoreControllerComponent} from "../controller/core-controller.component";
import {RendererComponent} from "../renderer/renderer.component";

@Singleton
export class WorldManager {
   constructor(@Inject private readonly component: WorldComponent,
               @Inject private readonly timer: TimerComponent,
               @Inject private readonly controller: CoreControllerComponent,
               @Inject private readonly renderer: RendererComponent) {
      renderer.init$.subscribe(() => {
         timer.step$.subscribe(delta => component.step(delta));
      });
   }
}
