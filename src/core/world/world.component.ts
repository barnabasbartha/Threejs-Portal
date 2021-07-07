import {Singleton} from 'typescript-ioc';
import {World} from './world';
import {PortalWorldObject} from '../object/portal-world-object';
import {Subject} from 'rxjs';

@Singleton
export class WorldComponent {
   private readonly worldChangedSubject = new Subject<World>();
   readonly worldChanged$ = this.worldChangedSubject.pipe();

   private worlds = new Map<string, World>();
   private currentWorld?: World;

   getCurrentWorld(): World {
      return this.currentWorld;
   }

   setCurrentWorld(world: World): void {
      this.currentWorld = world;
      this.worldChangedSubject.next(world);
   }

   getWorld(name: string): World {
      return this.worlds.get(name);
   }

   getWorlds(): Map<string, World> {
      return this.worlds;
   }

   step(delta: number): void {
      Array.from(this.worlds.values()).forEach((world) => world.step(delta));
   }

   getPortals(): Map<string, PortalWorldObject> {
      const portals = new Map<string, PortalWorldObject>();
      Array.from(this.worlds.values()).forEach((world) =>
         world.getPortals().forEach((portal) => portals.set(portal.getName(), portal)),
      );
      return portals;
   }

   add(world: World): void {
      this.worlds.set(world.getName(), world);
      this.updatePortals();
   }

   private updatePortals(): void {
      const portals = this.getPortals();
      Array.from(portals.values()).forEach((portal: PortalWorldObject) => {
         if (!portal.getDestination() && portals.has(portal.getDestinationPortalName())) {
            const otherPortalName = portal.getDestinationPortalName();
            if (otherPortalName) {
               const otherPortal = portals.get(otherPortalName);
               portal.setDestination(otherPortal);
               otherPortal.setDestination(portal);
            }
         }
      });
   }
}
