import {Inject, Singleton} from "typescript-ioc";
import {Vector3} from "three";
import {ReplaySubject} from "rxjs";
import {CoreKeyboardControllerComponent} from "./core-keyboard-controller.component";
import {CoreCameraControllerComponent} from "./core-camera-controller.component";
import {TimerComponent} from "../timer/timer.component";

@Singleton
export class CoreMovementControllerComponent {
   private static readonly PLANE_NORMAL = new Vector3(0, 1, 0);
   private static readonly DEG_45 = Math.PI / 4;
   private static readonly DEG_180 = Math.PI;
   private static readonly KEY_FORWARD = "KeyW";
   private static readonly KEY_LEFT = "KeyA";
   private static readonly KEY_BACKWARDS = "KeyS";
   private static readonly KEY_RIGHT = "KeyD";

   private readonly movementSubject = new ReplaySubject<Vector3>();
   public readonly movement$ = this.movementSubject.pipe();

   private static readonly SENSITIVITY = .05 * 2;
   private readonly lookingDirection = new Vector3();
   private readonly movement = new Vector3();
   private keyDirection = KeyDirection.IDLE;

   constructor(@Inject private readonly keyboardController: CoreKeyboardControllerComponent,
               @Inject private readonly cameraController: CoreCameraControllerComponent,
               @Inject private readonly timer: TimerComponent) {
      keyboardController.keys$.subscribe(() => this.keyDirection = this.getKeyDirection())
      cameraController.quaternion$.subscribe(() => this.lookingDirection.copy(cameraController.getDirection()));
      timer.step$.subscribe(delta => this.step(delta));
      this.movementSubject.next(this.movement);
   }

   private getKeyDirection(): KeyDirection {
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_FORWARD) && this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_LEFT))
         return KeyDirection.FORWARD_LEFT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_FORWARD) && this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_RIGHT))
         return KeyDirection.FORWARD_RIGHT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_FORWARD))
         return KeyDirection.FORWARD;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_BACKWARDS) && this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_LEFT))
         return KeyDirection.BACKWARDS_LEFT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_BACKWARDS) && this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_RIGHT))
         return KeyDirection.BACKWARDS_RIGHT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_BACKWARDS))
         return KeyDirection.BACKWARDS;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_LEFT))
         return KeyDirection.LEFT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_RIGHT))
         return KeyDirection.RIGHT;
      return KeyDirection.IDLE;
   }

   private step(delta: number) {
      if (this.keyDirection !== KeyDirection.IDLE) {
         this.movement.copy(this.lookingDirection)
            //.projectOnPlane(CoreMovementControllerComponent.PLANE_NORMAL)
            .normalize();
         const additionalAngle = this.keyDirection * CoreMovementControllerComponent.DEG_45 + CoreMovementControllerComponent.DEG_180;
         let moveVectorDeg = Math.atan2(this.movement.x, this.movement.z);
         moveVectorDeg -= additionalAngle;
         this.movement.x = Math.sin(moveVectorDeg);
         this.movement.z = Math.cos(moveVectorDeg);
         this.movement.y *= -1;
         this.movement
            .multiplyScalar(CoreMovementControllerComponent.SENSITIVITY)
            .multiplyScalar(delta);
         this.movementSubject.next(this.movement);
      }
   }
}

enum KeyDirection {
   FORWARD,
   FORWARD_RIGHT,
   RIGHT,
   BACKWARDS_RIGHT,
   BACKWARDS,
   BACKWARDS_LEFT,
   LEFT,
   FORWARD_LEFT,
   IDLE,
}
