import {WorldObject} from '../object/world-object';
import {AmbientLight, Scene} from 'three';
import {AbstractObject} from '../object/abstract-object';
import {PortalWorldObject} from '../object/portal-world-object';

export class World extends AbstractObject<Scene> {
   protected readonly group = new Scene();
   private readonly objects = new Set<WorldObject>();
   protected readonly groupWithoutPortals = new Scene();
   private portals = new Map<string, PortalWorldObject>();

   constructor(protected readonly name: string) {
      super(name);

      const ambientLight = new AmbientLight(0xffffff, .7);
      this.group.add(ambientLight);
   }

   getGroupWithoutPortals(): Scene {
      return this.groupWithoutPortals;
   }

   step(delta: number): void {
      for (const object of this.getObjects()) {
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

   getObject(name: string): WorldObject | undefined {
      return this.getObjects()
         .filter(object => object.getName() === name)?.[0];
   }
}
