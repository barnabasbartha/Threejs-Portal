import {Inject, Singleton} from "typescript-ioc";
import {Object3D, Raycaster, Vector3} from "three";
import {WorldObject} from "../object/world-object";
import {Collision} from "./physics.model";
import {SceneComponent} from "../scene/scene.component";

@Singleton
export class PhysicsComponent {
   private readonly raycaster = new Raycaster();

   constructor(@Inject private readonly scene: SceneComponent) {
   }

   // In case of collision, it returns the ratio of "movement" vector to the hit point
   // If the collision is at the third of the "movement" vector, then it will return 0.33
   // If there is no collision, it will return null
   checkCollision(position: Vector3, movement: Vector3, objects: WorldObject[]): Collision | null {
      this.raycaster.set(position, movement);
      this.raycaster.far = movement.length();
      const objectToWorldObject = new Map<Object3D, WorldObject>();
      const physicalObjects: Object3D[] = [];
      objects.forEach(object => {
         object.getPhysicalObjects().forEach(physicalObject => {
            objectToWorldObject.set(physicalObject, object);
            physicalObjects.push(physicalObject);
         })
      })
      const intersections = this.raycaster.intersectObjects(physicalObjects, true);

      if (intersections.length) {
         const intersection = intersections[0];
         return {
            ratio: intersection.distance / this.raycaster.far,
            object: objectToWorldObject.get(intersection.object),
            position: intersection.point
         }
      }
      return null;
   }

   checkPortalCollision(position: Vector3, movement: Vector3): Collision | null {
      return this.checkCollision(position, movement, this.scene.getCurrentWorld().getPortals());
   }
}
