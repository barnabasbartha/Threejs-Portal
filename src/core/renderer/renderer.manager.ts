import { Inject, Singleton } from 'typescript-ioc';
import { RendererComponent } from './renderer.component';
import { TimerComponent } from '../timer/timer.component';
import { WorldComponent } from '../world/world.component';
import { CameraComponent } from '../camera/camera.component';
import { CoreControllerComponent } from '../controller/core-controller.component';

@Singleton
export class RendererManager {
   constructor(
      @Inject private readonly component: RendererComponent,
      @Inject private readonly world: WorldComponent,
      @Inject private readonly camera: CameraComponent,
      @Inject private readonly timer: TimerComponent,
      @Inject private readonly controller: CoreControllerComponent,
   ) {
      timer.step$.subscribe(() => component.render(world.getWorlds(), world.getCurrentWorld(), camera.getCamera()));
      controller.resize$.subscribe((size) => component.setSize(size.x, size.y));
   }
}
