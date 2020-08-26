import {Object3D} from "three";

export abstract class AbstractObject<T extends Object3D> {
   protected abstract readonly group: T;

   getGroup(): T {
      return this.group;
   }

   add(object: Object3D) {
      this.group.add(object);
   }

   remove(object: Object3D) {
      this.group.remove(object);
   }

   step(delta: number) {
   }
}
