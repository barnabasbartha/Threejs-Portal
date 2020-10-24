import {Inject, Singleton} from "typescript-ioc";
import {CoreMovementControllerComponent} from "./core-movement-controller.component";
import {merge, Observable, ReplaySubject} from "rxjs";
import {Vector3} from "three";
import {filter, map} from "rxjs/operators";
import {PortalWorldObject} from "../object/portal-world-object";
import {PhysicsComponent} from "../physics/physics.component";
import {TeleportContext} from "../teleport/teleport.model";
import {WorldComponent} from "../world/world.component";

@Singleton
export class MovementComponent {
   public readonly position$: Observable<Vector3>;

   private readonly teleportSubject = new ReplaySubject<TeleportContext>();
   public readonly teleport$ = this.teleportSubject.pipe();

   private readonly positionSubject = new ReplaySubject<Vector3>();
   private readonly position = new Vector3(0, 1, 2);

   constructor(@Inject private readonly movementController: CoreMovementControllerComponent,
               @Inject private readonly physics: PhysicsComponent,
               @Inject private readonly world: WorldComponent) {
      this.position$ = merge(this.positionSubject, movementController.movement$.pipe(
         map(movement => {
            const collision = physics.checkPortalCollision(this.position, movement);
            if (collision) {
               if (collision.object instanceof PortalWorldObject) {
                  if (collision.object.isTeleportEnabled()) {
                     this.teleportSubject.next({
                        sourcePortal: collision.object,
                        collision
                     } as TeleportContext);
                  }
                  return null;
               } else {
                  // TODO: Multiply ratio - CONTACT_DISTANCE and continue checking on surface until a certain level
                  movement.multiplyScalar(collision.ratioToPosition);
               }
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
