import {Inject, Singleton} from "typescript-ioc";
import {PhysicsComponent} from "./physics.component";
import {WorldComponent} from "../world/world.component";

@Singleton
export class PhysicsManager {
   constructor(
      @Inject private readonly component: PhysicsComponent,
      @Inject private readonly worldComponent: WorldComponent
   ) {
      worldComponent.worldChanged$.subscribe((world) =>
         component.setWorld(world)
      );
   }
}
