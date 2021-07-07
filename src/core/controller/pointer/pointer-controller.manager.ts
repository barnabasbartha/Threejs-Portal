import {Inject} from "typescript-ioc";
import {CoreCameraControllerComponent} from "../core-camera-controller.component";
import {PointerControllerComponent} from "./pointer-controller.component";
import {MovementComponent} from "../movement-component";
import {combineLatest} from "rxjs";
import {WorldComponent} from "../../world/world.component";

export class PointerControllerManager {
   constructor(@Inject private readonly controller: PointerControllerComponent,
               @Inject private readonly movementController: MovementComponent,
               @Inject private readonly cameraController: CoreCameraControllerComponent,
               @Inject private readonly worlds: WorldComponent) {
      combineLatest([
         movementController.position$,
         cameraController.quaternion$,
      ]).subscribe(([position, quaternion]) =>
         controller.update(
            position,
            quaternion,
            worlds.getCurrentWorld().getRawObjects()
         )
      )
   }
}
