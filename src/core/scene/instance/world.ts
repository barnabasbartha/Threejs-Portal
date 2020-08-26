import {WorldObject} from "../../object/world-object";
import {Scene} from "three";
import {AbstractObject} from "../../object/abstract-object";

export abstract class World extends AbstractObject<Scene> {
   protected readonly group = new Scene();
   private readonly objects = new Set<WorldObject>();

   step(delta: number) {
      for (const object of this.objects.values()) {
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
}
