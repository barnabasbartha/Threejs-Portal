import {Inject, Singleton} from "typescript-ioc";
import {CoreMovementControllerComponent} from "./core-movement-controller.component";
import {Observable, ReplaySubject} from "rxjs";
import {Vector3} from "three";
import {map} from "rxjs/operators";
import {PortalWorldObject} from "../object/portal-world-object";
import {PhysicsComponent} from "../physics/physics.component";
import {Teleport} from "../scene/teleport/teleport.model";
import {SceneComponent} from "../scene/scene.component";
import {MathUtil} from "../../util/math-util";

@Singleton
export class MovementComponent {
   public readonly position$: Observable<Vector3>;

   private readonly teleportSubject = new ReplaySubject<Teleport>();
   public readonly teleport$ = this.teleportSubject.pipe();

   private readonly position = new Vector3(0, 1, 2);

   constructor(@Inject private readonly movementController: CoreMovementControllerComponent,
               @Inject private readonly physics: PhysicsComponent,
               @Inject private readonly scene: SceneComponent) {
      this.position$ = movementController.movement$.pipe(
         map(movement => {
            const collision = physics.checkPortalCollision(this.position, movement);
            if (collision) {
               if (collision.object instanceof PortalWorldObject) {
                  this.teleportSubject.next({
                     sourcePortal: collision.object,
                     collision
                  } as Teleport);
               } else {
                  movement.multiplyScalar(collision.ratio);
               }
            }
            this.position.add(movement);
            this.limitWorldSize();
            return this.position;
         }),
      );
   }

   setPosition(position: Vector3) {
      this.position.x = position.x;
      this.position.z = position.z;
   }

   private limitWorldSize() {
      const size = this.scene.getCurrentWorld().getSize();
      this.position.x = MathUtil.minMax(this.position.x, -size, size);
      this.position.z = MathUtil.minMax(this.position.z, -size, size);
   }
}
