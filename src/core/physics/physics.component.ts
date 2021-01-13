import {Inject, Singleton} from "typescript-ioc";
import {Object3D, Raycaster, Vector3} from "three";
import {WorldObject} from "../object/world-object";
import {Collision} from "./physics.model";
import {WorldComponent} from "../world/world.component";
import {World} from "../world/world";
import {PortalWorldObject} from "../object/portal-world-object";

@Singleton
export class PhysicsComponent {
   private static readonly MAX_RECURSION_LEVEL = 3;
   private static readonly EPS = 0.01;
   private readonly raycaster = new Raycaster();
   private readonly physicalObjectToWorldObject = new Map<Object3D,
      WorldObject>();
   private physicalObjects: Object3D[] = [];
   private worldLoaded = false;

   constructor(@Inject private readonly world: WorldComponent) {
   }

   setWorld(world: World): void {
      this.clear();
      world.getObjects().forEach((object) => {
         object.getPhysicalObjects().forEach((physicalObject) => {
            this.physicalObjectToWorldObject.set(physicalObject, object);
            this.physicalObjects.push(physicalObject);
         });
      });
      this.worldLoaded = true;
   }

   isWorldLoaded(): boolean {
      return this.worldLoaded;
   }

   private clear(): void {
      this.physicalObjectToWorldObject.clear();
      this.physicalObjects = [];
   }

   private readonly tmpPosition = new Vector3();
   private readonly tmpMovement = new Vector3();

   // Returns the last collision if there is at least one
   handleCollision(position: Vector3, movement: Vector3): Collision | null {
      // TODO: Use multiple origins to represent the player's hitbox (cylinder)
      const [collision, newMovement] = this.getRecursiveCollisionMovement(
         this.tmpPosition.copy(position),
         movement
      );
      movement.copy(newMovement);
      return collision;
   }

   private getRecursiveCollisionMovement(
      position: Vector3,
      movement: Vector3,
      recursionLevelLeft: number = PhysicsComponent.MAX_RECURSION_LEVEL
   ): [Collision | null, Vector3] {
      const collision = this.checkCollision(position, movement);
      if (collision) {
         const movementBefore = this.tmpMovement.copy(movement);
         if (!collision.isPortal) {
            collision.ratioToPosition = Math.max(
               collision.ratioToPosition -
               PhysicsComponent.EPS / movement.length(),
               0
            );
         }
         movement.multiplyScalar(collision.ratioToPosition);

         if (recursionLevelLeft && !collision.isPortal) {
            position.add(movement);
            const ratioAfterPosition = 1 - collision.ratioToPosition;
            const movementProjectedOnPlane = movementBefore
               .projectOnPlane(collision.normal)
               .multiplyScalar(ratioAfterPosition);
            if (movementProjectedOnPlane.length() > PhysicsComponent.EPS) {
               const [
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  _,
                  recursionMovement,
               ] = this.getRecursiveCollisionMovement(
                  position,
                  movementProjectedOnPlane.clone(),
                  recursionLevelLeft--
               );
               movement.add(recursionMovement);
            }
         }
      }
      return [collision, movement];
   }

   private checkCollision(
      position: Vector3,
      movement: Vector3
   ): Collision | null {
      const movementLength = movement.length();
      this.raycaster.set(position, movement);
      this.raycaster.far = movementLength + PhysicsComponent.EPS;
      const intersections = this.raycaster.intersectObjects(
         this.physicalObjects,
         true
      );
      if (!intersections.length) {
         return null;
      }
      const intersection = intersections[0];
      if (intersection.distance > movementLength) {
         return null;
      }
      const object = this.physicalObjectToWorldObject.get(intersection.object);
      const ratioToPosition = intersection.distance / movementLength;
      return {
         ratioToPosition,
         ratioAfterPosition: 1 - ratioToPosition,
         object,
         intersection,
         normal: intersection.face.normal.transformDirection(
            intersection.object.matrixWorld
         ),
         movement,
         isPortal: object instanceof PortalWorldObject,
      };
   }
}
