import {Inject, Singleton} from "typescript-ioc";
import {CoreMovementControllerComponent} from "./core-movement-controller.component";
import {Observable, ReplaySubject} from "rxjs";
import {Vector3} from "three";
import {map} from "rxjs/operators";
import {PortalWorldObject} from "../object/portal-world-object";
import {PhysicsComponent} from "../physics/physics.component";
import {Teleport} from "../scene/teleport/teleport.model";

@Singleton
export class MovementComponent {
   public readonly position$: Observable<Vector3>;

   private readonly teleportSubject = new ReplaySubject<Teleport>();
   public readonly teleport$ = this.teleportSubject.pipe();

   private readonly position = new Vector3(0, 1, 3);

   constructor(@Inject private readonly movementController: CoreMovementControllerComponent,
               @Inject private readonly physics: PhysicsComponent) {
      this.position$ = movementController.movement$.pipe(
         map(movement => {
            const collision = physics.checkPortalCollision(this.position, movement);
            if (collision) {
               if (collision.object instanceof PortalWorldObject) {
                  this.teleportSubject.next({
                     sourcePortal: collision.object,
                     collision
                  } as Teleport);
               }
               movement.multiplyScalar(collision.ratio);
            }
            return this.position.add(movement);
         }),
      );
   }

   setPosition(position: Vector3) {
      this.position.x = position.x;
      this.position.z = position.z;
   }
}
