import {Singleton} from "typescript-ioc";
import {SkyWorld} from "./instance/sky-world";
import {World} from "./instance/world";
import {PortalWorldObject} from "../object/portal-world-object";
import {RoomWorld} from "./instance/room-world";

@Singleton
export class SceneComponent {
   private worlds = new Map<string, World>();
   private readonly mainWorld: World;

   constructor() {
      this.add(this.mainWorld = new RoomWorld());
      this.add(new SkyWorld());
   }

   getWorld(): World {
      return this.mainWorld;
   }

   getWorlds(): Map<string, World> {
      return this.worlds;
   }

   step(delta: number) {
      Array.from(this.worlds.values()).forEach(scene => scene.step(delta));
   }

   getPortals(): Map<string, PortalWorldObject> {
      const portals = new Map<string, PortalWorldObject>();
      Array.from(this.worlds.values()).forEach(scene => scene.getPortals().forEach(portal => portals.set(portal.getName(), portal)));
      return portals;
   }

   private add(world: World) {
      this.worlds.set(world.getName(), world);
      this.updatePortals();
   }

   private updatePortals() {
      const portals = this.getPortals();
      Array.from(portals.values()).forEach((portal: PortalWorldObject) => {
         if (!portal.getDestination()) {
            if (portals.has(portal.getDestinationPortalName())) {
               const otherPortal = portals.get(portal.getDestinationPortalName());
               portal.setDestination(otherPortal);
               otherPortal.setDestination(portal);
            }
         }
      })
   }
}
