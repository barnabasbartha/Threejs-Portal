import {WorldObject} from "../object/world-object";
import {Vector3} from "three";

export interface Collision {
   ratioToPosition: number;
   object: WorldObject;
   position: Vector3;
   movement: Vector3;
}
