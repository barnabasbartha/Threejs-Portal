import {Inject, Singleton} from "typescript-ioc";
import {TeleportComponent} from "./teleport.component";
import {MovementComponent} from "../controller/movement-component";

@Singleton
export class TeleportManager {
   constructor(
      @Inject private readonly component: TeleportComponent,
      @Inject private readonly movement: MovementComponent
   ) {
      movement.teleport$.subscribe((teleport) => component.teleport(teleport));
   }
}
