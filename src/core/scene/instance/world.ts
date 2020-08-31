import {WorldObject} from "../../object/world-object";
import {Scene} from "three";
import {AbstractObject} from "../../object/abstract-object";
import {PortalWorldObject} from "../../object/portal-world-object";

export abstract class World extends AbstractObject<Scene> {
   protected readonly group = new Scene();
   private readonly objects = new Set<WorldObject>();
   private portals: PortalWorldObject[] = [];

   protected constructor(private name: string) {
      super();
   }

   step(delta: number) {
      for (const object of Array.from(this.objects.values())) {
         object.step(delta);
      }
   }

   addObject(object: WorldObject) {
      if (!this.objects.has(object)) {
         this.objects.add(object);
         this.add(object.getGroup());
      }
   }

   removeObject(object: WorldObject) {
      if (this.objects.has(object)) {
         this.objects.delete(object);
         this.group.remove(object.getGroup());
      }
   }

   addPortal(portal: PortalWorldObject) {
      this.portals.push(portal);
      this.addObject(portal);
   }

   getPortals(): PortalWorldObject[] {
      return this.portals;
   }

   getName(): string {
      return this.name;
   }
}
