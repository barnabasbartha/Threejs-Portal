import {Inject, Singleton} from "typescript-ioc";
import {Vector3} from "three";
import {Subject} from "rxjs";
import {CoreKeyboardControllerComponent} from "./core-keyboard-controller.component";
import {CoreCameraControllerComponent} from "./core-camera-controller.component";
import {TimerComponent} from "../timer/timer.component";

@Singleton
export class CoreMovementControllerComponent {
   private static readonly PLANE_NORMAL = new Vector3(0, 1, 0);
   private static readonly DEG_45 = Math.PI / 4;
   private static readonly KEY_FORWARD = "KeyW";
   private static readonly KEY_LEFT = "KeyA";
   private static readonly KEY_BACKWARDS = "KeyS";
   private static readonly KEY_RIGHT = "KeyD";

   private readonly positionSubject = new Subject<Vector3>();
   public readonly position$ = this.positionSubject.pipe();

   private static readonly SENSITIVITY = .05;
   private readonly position = new Vector3(0, 1, 5);
   private readonly lookingDirection = new Vector3();
   private readonly moveVector = new Vector3();
   private readonly actualMoveVector = new Vector3();
   private keyDirection = KeyDirection.IDLE;

   constructor(@Inject private readonly keyboardController: CoreKeyboardControllerComponent,
               @Inject private readonly cameraController: CoreCameraControllerComponent,
               @Inject private readonly timer: TimerComponent) {
      keyboardController.keys$.subscribe(() => this.keyDirection = this.getKeyDirection())
      cameraController.quaternion$.subscribe(() => this.lookingDirection.copy(cameraController.getDirection()));
      timer.step$.subscribe(delta => this.step(delta));
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
         this.moveVector.copy(this.lookingDirection)
            .projectOnPlane(CoreMovementControllerComponent.PLANE_NORMAL)
            .normalize();
         const additionalAngle = this.keyDirection * CoreMovementControllerComponent.DEG_45;
         let moveVectorDeg = Math.atan2(this.moveVector.x, this.moveVector.z);
         moveVectorDeg -= additionalAngle;
         this.actualMoveVector.x = Math.sin(moveVectorDeg);
         this.actualMoveVector.z = Math.cos(moveVectorDeg);
         this.actualMoveVector
            .multiplyScalar(CoreMovementControllerComponent.SENSITIVITY)
            .multiplyScalar(delta);
         this.position.add(this.actualMoveVector);
      }
      this.positionSubject.next(this.position);
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
