import {Singleton} from "typescript-ioc";
import {World} from "./world";
import {PortalWorldObject} from "../object/portal-world-object";

@Singleton
export class WorldComponent {
   private worlds = new Map<string, World>();
   private currentWorld?: World;

   getCurrentWorld(): World {
      return this.currentWorld;
   }

   setCurrentWorld(world: World) {
      this.currentWorld = world;
   }

   getWorld(name: string): World {
      return this.worlds.get(name);
   }

   getWorlds(): Map<string, World> {
      return this.worlds;
   }

   step(delta: number) {
      Array.from(this.worlds.values()).forEach(world => world.step(delta));
   }

   getPortals(): Map<string, PortalWorldObject> {
      const portals = new Map<string, PortalWorldObject>();
      Array.from(this.worlds.values()).forEach(world => world.getPortals().forEach(portal => portals.set(portal.getName(), portal)));
      return portals;
   }

   add(world: World) {
      this.worlds.set(world.getName(), world);
      this.updatePortals();
   }

   private updatePortals() {
      const portals = this.getPortals();
      Array.from(portals.values()).forEach((portal: PortalWorldObject) => {
         if (!portal.getDestination() && portals.has(portal.getDestinationPortalName())) {
            const otherPortal = portals.get(portal.getDestinationPortalName());
            portal.setDestination(otherPortal);
            otherPortal.setDestination(portal);
         }
      })
   }
}
