import {Inject, Singleton} from "typescript-ioc";
import {CameraComponent} from "./camera.component";
import {CoreControllerComponent} from "../controller/core-controller.component";
import {CoreCameraControllerComponent} from "../controller/core-camera-controller.component";
import {MovementComponent} from "../controller/movement-component";
import {TimerComponent} from "../timer/timer.component";

@Singleton
export class CameraManager {
   private static CAMERA_INTENSITY = .2;

   constructor(@Inject private readonly component: CameraComponent,
               @Inject private readonly controller: CoreControllerComponent,
               @Inject private readonly cameraController: CoreCameraControllerComponent,
               @Inject private readonly timer: TimerComponent,
               @Inject private readonly movement: MovementComponent) {
      controller.resize$.subscribe(size => component.setAspectRatio(size.x / size.y));
      timer.step$.subscribe(delta => component.setQuaternion(cameraController.getQuaternion(), delta * CameraManager.CAMERA_INTENSITY));
      movement.position$.subscribe(position => component.setPosition(position));
   }
}
