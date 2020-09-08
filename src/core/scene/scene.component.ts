import {Singleton} from "typescript-ioc";
import {SkyWorld} from "./instance/sky-world";
import {World} from "./instance/world";
import {PortalWorldObject} from "../object/portal-world-object";
import {RoomWorld} from "./instance/room-world";
import TWEEN from '@tweenjs/tween.js';
import {BoxWorld1} from "./instance/box-world-1";
import {BoxWorld2} from "./instance/box-world-2";
import {BoxWorld3} from "./instance/box-world-3";
import {BoxWorld4} from "./instance/box-world-4";

@Singleton
export class SceneComponent {
   private worlds = new Map<string, World>();
   private currentWorld: World;

   constructor() {
      this.add(this.currentWorld = new RoomWorld());
      this.add(new SkyWorld());
      this.add(new BoxWorld1());
      this.add(new BoxWorld2());
      this.add(new BoxWorld3());
      this.add(new BoxWorld4());
   }

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
      Array.from(this.worlds.values()).forEach(scene => scene.step(delta));
      TWEEN.update();
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
