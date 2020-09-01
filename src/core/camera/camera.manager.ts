import {Inject, Singleton} from "typescript-ioc";
import {CameraComponent} from "./camera.component";
import {CoreControllerComponent} from "../controller/core-controller.component";
import {CameraControllerComponent} from "../controller/camera-controller.component";

@Singleton
export class CameraManager {
   constructor(@Inject private readonly component: CameraComponent,
               @Inject private readonly controller: CoreControllerComponent,
               @Inject private readonly cameraController: CameraControllerComponent) {
      controller.resize$.subscribe(size => component.setAspectRatio(size.x / size.y));
      cameraController.quaternion$.subscribe(quaternion => component.setQuaternion(quaternion));
   }
}
