import {Inject, Singleton} from "typescript-ioc";
import {CoreMovementControllerComponent} from "../controller/core-movement-controller.component";
import {Observable} from "rxjs";
import {Vector3} from "three";
import {filter, map, tap} from "rxjs/operators";

@Singleton
export class MovementComponent {
   public readonly position$: Observable<Vector3>;

   private readonly position = new Vector3(0, 1, 3);

   constructor(@Inject private readonly movementController: CoreMovementControllerComponent) {
      this.position$ = movementController.movement$.pipe(
         tap(movement => {
            // TODO: Detect portal collisions. Do the same as in wouldCollide but
            //  search for portals only instead of every world object
            // TODO: In case of collision, expose the event (portalCollision$)
            // TODO: Create a TeleportComponent that listens this portalCollision$ and applies the necessary
            //  changes like scene switching, position (MovementComponent) and 
            //  camera (CoreCameraControllerComponent) changes
         }),
         filter(movement => !this.wouldCollide(this.position, movement)),
         map(movement => this.position.add(movement)),
      );
   }

   private wouldCollide(position: Vector3, movement: Vector3): boolean {
      // TODO: Check if position+movement is in an blocking object in the scene
      // TODO: Make a "blocking" parameter in world objects
      // TODO: Make a "isPointInside" function to check if it collides
      return false;
   }
}
