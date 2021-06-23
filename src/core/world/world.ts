import {WorldObject} from '../object/world-object';
import {Scene} from 'three';
import {AbstractObject} from '../object/abstract-object';
import {PortalWorldObject} from '../object/portal-world-object';

export class World extends AbstractObject<Scene> {
   protected readonly group = new Scene();
   private readonly objects = new Set<WorldObject>();
   protected readonly groupWithoutPortals = new Scene();
   private portals = new Map<string, PortalWorldObject>();

   constructor(private name: string) {
      super();
   }

   getGroupWithoutPortals(): Scene {
      return this.groupWithoutPortals;
   }

   getName(): string {
      return this.name;
   }

   step(delta: number): void {
      for (const object of Array.from(this.objects.values())) {
         object.step(delta);
      }
   }

   addObject(object: WorldObject): void {
      if (!this.objects.has(object)) {
         this.objects.add(object);
         if (!(object instanceof PortalWorldObject)) {
            this.groupWithoutPortals.add(object.getGroup());
         }
         this.add(object.getGroup());
      }
   }

   getObjects(): WorldObject[] {
      return Array.from(this.objects.values());
   }

   addPortal(portal: PortalWorldObject): void {
      this.portals.set(portal.getName(), portal);
      this.addObject(portal);
   }

   getPortals(): PortalWorldObject[] {
      return Array.from(this.portals.values());
   }

   getPortal(name: string): PortalWorldObject {
      return this.portals.get(name);
   }
}
