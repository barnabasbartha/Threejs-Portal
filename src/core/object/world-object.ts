import {Euler, Group, Matrix4, Object3D, Quaternion, Vector3} from "three";
import {AbstractObject} from "./abstract-object";

export abstract class WorldObject extends AbstractObject<Group> {
   protected readonly group = new Group();
   private readonly physicalObjects: Object3D[] = [];
   private readonly tmpVector = new Vector3();
   private readonly tmpQuaternion = new Quaternion();

   getMatrix(): Matrix4 {
      this.group.updateMatrixWorld(true);
      return this.group.matrixWorld;
   }

   getAbsolutePosition(): Vector3 {
      this.group.getWorldPosition(this.tmpVector);
      return this.tmpVector;
   }

   getAbsoluteQuaternion(): Quaternion {
      this.group.getWorldQuaternion(this.tmpQuaternion);
      return this.tmpQuaternion;
   }

   protected addPhysicalObject(object: Object3D) {
      this.add(object);
      this.physicalObjects.push(object);
   }

   getPhysicalObjects(): Object3D[] {
      return this.physicalObjects;
   }
}
