import {Inject, Singleton} from "typescript-ioc";
import {MovementComponent} from "../../controller/movement-component";
import {CoreCameraControllerComponent} from "../../controller/core-camera-controller.component";
import {SceneComponent} from "../scene.component";
import {Vector3} from "three";

@Singleton
export class TeleportComponent {
   private readonly tmpVector = new Vector3();

   constructor(@Inject protected readonly movement: MovementComponent,
               @Inject protected readonly camera: CoreCameraControllerComponent,
               @Inject protected readonly scene: SceneComponent) {
      // TODO: Add the rest of the movement vector when teleporting
      movement.teleport$.subscribe(teleport => {
         const sourcePortal = teleport.sourcePortal;
         const targetWorld = scene.getWorld(sourcePortal.getDestinationSceneName());
         const targetPortal = targetWorld.getPortal(sourcePortal.getDestinationPortalName());
         // TODO: Calculate new position and orientation by source portal and target portal

         // Switch scene
         scene.setCurrentWorld(targetWorld);

         // TODO: Set new position (MovementComponent) and camera orientation (CoreCameraControllerComponent)
         this.tmpVector.copy(teleport.collision.position).sub(sourcePortal.getAbsolutePosition());
         movement.setPosition(this.tmpVector.add(targetPortal.getAbsolutePosition()));
      });
   }
}
