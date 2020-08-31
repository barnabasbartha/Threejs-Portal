import {Group, Matrix4, Vector3} from "three";
import {AbstractObject} from "./abstract-object";

export abstract class WorldObject extends AbstractObject<Group> {
   protected readonly group = new Group();

   getMatrix(): Matrix4 {
      return this.group.matrix;
   }

   getPosition(): Vector3 {
      return this.group.position;
   }
}
