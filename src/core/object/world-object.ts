import {Group, Matrix4, Object3D, Vector3} from "three";
import {AbstractObject} from "./abstract-object";

export abstract class WorldObject extends AbstractObject<Group> {
   protected readonly group = new Group();
   private readonly physicalObjects: Object3D[] = [];

   getMatrix(): Matrix4 {
      return this.group.matrix;
   }

   getPosition(): Vector3 {
      return this.group.position;
   }

   protected addPhysicalObject(object: Object3D) {
      this.add(object);
      this.physicalObjects.push(object);
   }

   getPhysicalObjects(): Object3D[] {
      return this.physicalObjects;
   }
}
