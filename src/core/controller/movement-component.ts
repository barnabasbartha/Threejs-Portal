import {Inject, Singleton} from "typescript-ioc";
import {CoreMovementControllerComponent} from "./core-movement-controller.component";
import {merge, Observable, ReplaySubject} from "rxjs";
import {Vector3} from "three";
import {filter, map} from "rxjs/operators";
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

   private readonly positionSubject = new ReplaySubject<Vector3>();
   private readonly position = new Vector3(0, 1, 2);

   constructor(@Inject private readonly movementController: CoreMovementControllerComponent,
               @Inject private readonly physics: PhysicsComponent,
               @Inject private readonly scene: SceneComponent) {
      this.position$ = merge(this.positionSubject, movementController.movement$.pipe(
         map(movement => {
            const collision = physics.checkPortalCollision(this.position, movement);
            if (collision) {
               if (collision.object instanceof PortalWorldObject) {
                  if (collision.object.isTeleportEnabled()) {
                     this.teleportSubject.next({
                        sourcePortal: collision.object,
                        collision
                     } as Teleport);
                  }
                  return null;
               } else {
                  movement.multiplyScalar(collision.ratioToPosition);
               }
            }
            this.position.add(movement);
            this.limitWorldSize();
            return this.position;
         }),
         filter(position => !!position),
      ));
   }

   setPosition(position: Vector3) {
      this.position.copy(position);
      this.update();
   }

   private limitWorldSize() {
      const size = this.scene.getCurrentWorld().getSize();
      this.position.x = MathUtil.minMax(this.position.x, -size, size);
      this.position.z = MathUtil.minMax(this.position.z, -size, size);
   }

   private update() {
      this.positionSubject.next(this.position);
   }
}
