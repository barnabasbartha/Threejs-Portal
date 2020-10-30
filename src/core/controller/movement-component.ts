import {Inject, Singleton} from "typescript-ioc";
import {CoreMovementControllerComponent} from "./core-movement-controller.component";
import {merge, Observable, ReplaySubject} from "rxjs";
import {Vector3} from "three";
import {filter, map} from "rxjs/operators";
import {PhysicsComponent} from "../physics/physics.component";
import {TeleportContext} from "../teleport/teleport.model";
import {WorldComponent} from "../world/world.component";
import {PortalWorldObject} from "../object/portal-world-object";

@Singleton
export class MovementComponent {
   public readonly position$: Observable<Vector3>;

   private readonly teleportSubject = new ReplaySubject<TeleportContext>();
   public readonly teleport$ = this.teleportSubject.pipe();

   private readonly positionSubject = new ReplaySubject<Vector3>();
   private readonly position = new Vector3();

   constructor(@Inject private readonly movementController: CoreMovementControllerComponent,
               @Inject private readonly physics: PhysicsComponent,
               @Inject private readonly world: WorldComponent) {
      // TODO: Use this movement as the player's intended direction but use acceleration (g) and velocity to calculate
      //  the actual movement vector before looking for collisions
      this.position$ = merge(this.positionSubject, movementController.movement$.pipe(
         filter(() => physics.isWorldLoaded()),
         map(movement => {
            const collision = physics.handleCollision(this.position, movement);
            if (collision?.isPortal) {
               const sourcePortal = collision.object as PortalWorldObject;
               if (sourcePortal.isTeleportEnabled()) {
                  // TODO: Check the rest of the movement vector in the destination world as well to avoid jumping across the wall there
                  this.teleportSubject.next({sourcePortal, collision} as TeleportContext);
               }
               return null;
            }
            return movement;
         }),
         filter(movement => !!movement),
         map(movement => this.position.add(movement))
      ));
   }

   setPosition(position: Vector3) {
      this.position.copy(position);
      this.update();
   }

   private update() {
      this.positionSubject.next(this.position);
   }
}
