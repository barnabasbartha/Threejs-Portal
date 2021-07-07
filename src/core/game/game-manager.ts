import {Inject, Singleton} from "typescript-ioc";
import {TeleportComponent} from "../teleport/teleport.component";
import {WorldComponent} from "../world/world.component";
import {MapComponent} from "../map/map.component";

@Singleton
export class GameManager {
   constructor(@Inject private readonly map: MapComponent,
               @Inject private readonly teleport: TeleportComponent,
               @Inject private readonly worlds: WorldComponent) {
   }
}
