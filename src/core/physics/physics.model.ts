import {WorldObject} from "../object/world-object";
import {Vector3} from "three";

export interface Collision {
   ratio: number;
   object: WorldObject;
   position: Vector3;
}
