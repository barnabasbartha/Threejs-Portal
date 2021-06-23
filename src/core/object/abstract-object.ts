import {Object3D} from 'three';
import {WorldObject} from './world-object';

export abstract class AbstractObject<T extends Object3D> {
   protected abstract readonly group: T;

   getGroup(): T {
      return this.group;
   }

   add(object: Object3D): void {
      this.group.add(object);
   }

   addObject(object: WorldObject): void {
      this.group.add(object.getGroup());
   }

   remove(object: Object3D): void {
      this.group.remove(object);
   }

   step(): void {
      //
   }
}
