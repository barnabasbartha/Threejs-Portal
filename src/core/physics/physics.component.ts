import {Inject, Singleton} from "typescript-ioc";
import {Object3D, Raycaster, Vector3} from "three";
import {WorldObject} from "../object/world-object";
import {Collision} from "./physics.model";
import {SceneComponent} from "../scene/scene.component";

@Singleton
export class PhysicsComponent {
   private readonly raycaster = new Raycaster();
   private readonly physicalObjectToWorldObject = new Map<Object3D, WorldObject>();
   private physicalObjects: Object3D[] = [];

   constructor(@Inject private readonly scene: SceneComponent) {
   }

   setWorld(world: WorldObject) {
      this.clear();
      world.getPhysicalObjects()
   }

   private clear() {
      this.physicalObjectToWorldObject.clear();
      this.physicalObjects = [];
   }


   ///

   // In case of collision, it returns the ratioToPosition of "movement" vector to the hit point
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
            ratioToPosition: intersection.distance / this.raycaster.far,
            object: objectToWorldObject.get(intersection.object),
            position: intersection.point,
            movement
         }
      }
      return null;
   }

   checkPortalCollision(position: Vector3, movement: Vector3): Collision | null {
      if (!this.scene.getCurrentWorld()) {
         return null;
      }
      return this.checkCollision(position, movement, this.scene.getCurrentWorld().getPortals());
   }
}
