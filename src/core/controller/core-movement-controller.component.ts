import {Inject, Singleton} from 'typescript-ioc';
import {Vector3} from 'three';
import {ReplaySubject} from 'rxjs';
import {CoreKeyboardControllerComponent} from './core-keyboard-controller.component';
import {CoreCameraControllerComponent} from './core-camera-controller.component';
import {TimerComponent} from '../timer/timer.component';
import {Config} from '../../config/config';

@Singleton
export class CoreMovementControllerComponent {
   private static readonly PLANE_NORMAL = new Vector3(0, 1, 0);
   private static readonly DEG_45 = Math.PI / 4;
   private static readonly DEG_180 = Math.PI;
   private static readonly KEY_FORWARD = 'KeyW';
   private static readonly KEY_LEFT = 'KeyA';
   private static readonly KEY_BACKWARDS = 'KeyS';
   private static readonly KEY_RIGHT = 'KeyD';
   private static readonly KEY_UP = 'Space';
   private static readonly KEY_DOWN = 'KeyC';

   private readonly movementSubject = new ReplaySubject<Vector3>();
   readonly movement$ = this.movementSubject.pipe();

   private static readonly SENSITIVITY = 0.05 * Config.PLAYER_SPEED;
   private readonly lookingDirection = new Vector3();
   private readonly movement = new Vector3();
   private keyDirection = KeyDirection.IDLE;

   constructor(
      @Inject
      private readonly keyboardController: CoreKeyboardControllerComponent,
      @Inject private readonly cameraController: CoreCameraControllerComponent,
      @Inject private readonly timer: TimerComponent,
   ) {
      keyboardController.keys$.subscribe(() => (this.keyDirection = this.getKeyDirection()));
      cameraController.quaternion$.subscribe(() => this.lookingDirection.copy(cameraController.getDirection()));
      timer.step$.subscribe((delta) => this.step(delta));
      this.movementSubject.next(this.movement);
   }

   private getKeyDirection(): KeyDirection {
      if (
         this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_FORWARD) &&
         this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_LEFT)
      )
         return KeyDirection.FORWARD_LEFT;
      if (
         this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_FORWARD) &&
         this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_RIGHT)
      )
         return KeyDirection.FORWARD_RIGHT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_FORWARD)) return KeyDirection.FORWARD;
      if (
         this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_BACKWARDS) &&
         this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_LEFT)
      )
         return KeyDirection.BACKWARDS_LEFT;
      if (
         this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_BACKWARDS) &&
         this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_RIGHT)
      )
         return KeyDirection.BACKWARDS_RIGHT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_BACKWARDS))
         return KeyDirection.BACKWARDS;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_LEFT)) return KeyDirection.LEFT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_RIGHT)) return KeyDirection.RIGHT;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_UP)) return KeyDirection.UPWARDS;
      if (this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_DOWN)) return KeyDirection.DOWNWARDS;
      return KeyDirection.IDLE;
   }

   private step(delta: number): void {
      if (this.keyDirection !== KeyDirection.IDLE) {
         this.movement
            .copy(this.lookingDirection)
            //.projectOnPlane(CoreMovementControllerComponent.PLANE_NORMAL)
            .normalize();
         const additionalAngle =
            this.keyDirection * CoreMovementControllerComponent.DEG_45 + CoreMovementControllerComponent.DEG_180;
         let moveVectorDeg = Math.atan2(this.movement.x, this.movement.z);
         moveVectorDeg -= additionalAngle;
         this.movement.x = Math.sin(moveVectorDeg);
         this.movement.z = Math.cos(moveVectorDeg);
         this.movement.y *= this.isGoingBackward() ? 1 : this.isGoingForward() ? -1 : 0;
         if (this.isGoingUpwards()) {
            this.movement.x = 0;
            this.movement.z = 0;
            this.movement.y = .5;
         }
         if (this.isGoingDownwards()) {
            this.movement.x = 0;
            this.movement.z = 0;
            this.movement.y = -.5;
         }
         this.movement.multiplyScalar(CoreMovementControllerComponent.SENSITIVITY).multiplyScalar(delta);
         this.movementSubject.next(this.movement);
      }
   }

   private isGoingForward(): boolean {
      return this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_FORWARD);
   }

   private isGoingBackward(): boolean {
      return this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_BACKWARDS);
   }

   private isGoingUpwards(): boolean {
      return this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_UP);
   }

   private isGoingDownwards(): boolean {
      return this.keyboardController.isPressed(CoreMovementControllerComponent.KEY_DOWN);
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
   UPWARDS,
   DOWNWARDS
}
