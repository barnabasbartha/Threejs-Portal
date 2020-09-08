import {WorldObject} from "../../object/world-object";
import {Scene} from "three";
import {AbstractObject} from "../../object/abstract-object";
import {PortalWorldObject} from "../../object/portal-world-object";

export abstract class World extends AbstractObject<Scene> {
   protected readonly group = new Scene();
   private readonly objects = new Set<WorldObject>();
   private portals = new Map<string, PortalWorldObject>();

   protected constructor(private name: string,
                         private size: number = Infinity) {
      super();
   }

   getName(): string {
      return this.name;
   }

   getSize(): number {
      return this.size;
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
      this.portals.set(portal.getName(), portal);
   }

   getPortals(): PortalWorldObject[] {
      return Array.from(this.portals.values());
   }

   getPortal(name: string): PortalWorldObject {
      return this.portals.get(name);
   }
}
