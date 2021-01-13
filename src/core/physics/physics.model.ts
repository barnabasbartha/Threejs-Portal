import { WorldObject } from '../object/world-object';
import { Intersection, Vector3 } from 'three';

export interface Collision {
   ratioToPosition: number;
   ratioAfterPosition: number;
   object: WorldObject;
   normal: Vector3;
   intersection: Intersection;
   movement: Vector3;
   isPortal: boolean;
}
