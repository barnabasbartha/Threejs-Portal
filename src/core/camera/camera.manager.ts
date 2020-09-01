import {Inject, Singleton} from "typescript-ioc";
import {CameraComponent} from "./camera.component";
import {CoreControllerComponent} from "../controller/core-controller.component";
import {CoreCameraControllerComponent} from "../controller/core-camera-controller.component";
import {CoreMovementControllerComponent} from "../controller/core-movement-controller.component";

@Singleton
export class CameraManager {
   constructor(@Inject private readonly component: CameraComponent,
               @Inject private readonly controller: CoreControllerComponent,
               @Inject private readonly cameraController: CoreCameraControllerComponent,
               @Inject private readonly movementController: CoreMovementControllerComponent) {
      controller.resize$.subscribe(size => component.setAspectRatio(size.x / size.y));
      cameraController.quaternion$.subscribe(quaternion => component.setQuaternion(quaternion));
      movementController.position$.subscribe(position => component.setPosition(position));
   }
}
