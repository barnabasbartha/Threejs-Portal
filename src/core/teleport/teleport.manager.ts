import {Inject, Singleton} from "typescript-ioc";
import {TeleportComponent} from "./teleport.component";
import {MovementComponent} from "../controller/movement-component";

@Singleton
export class TeleportManager {
   constructor(@Inject protected readonly component: TeleportComponent,
               @Inject protected readonly movement: MovementComponent,) {
      movement.teleport$.subscribe(teleport => component.teleport(teleport));
   }
}
