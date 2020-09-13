import {Inject, Singleton} from "typescript-ioc";
import {MovementComponent} from "../../controller/movement-component";
import {CoreCameraControllerComponent} from "../../controller/core-camera-controller.component";
import {SceneComponent} from "../scene.component";
import {Matrix4, Quaternion, Vector3} from "three";

@Singleton
export class TeleportComponent {
   private readonly tmpVector = new Vector3();

   constructor(@Inject protected readonly movement: MovementComponent,
               @Inject protected readonly camera: CoreCameraControllerComponent,
               @Inject protected readonly scene: SceneComponent) {
      movement.teleport$.subscribe(teleport => {
         const sourcePortal = teleport.sourcePortal;
         const targetWorld = scene.getWorld(sourcePortal.getDestinationSceneName());
         const targetPortal = targetWorld.getPortal(sourcePortal.getDestinationPortalName());

         // Switch scene
         scene.setCurrentWorld(targetWorld);

         this.tmpVector.copy(teleport.collision.position).sub(sourcePortal.getAbsolutePosition());
         movement.setPosition(this.tmpVector.add(targetPortal.getAbsolutePosition()));

         // const deltaQuaternion = targetPortal.getAbsoluteQuaternion().inverse().multiply(sourcePortal.getAbsoluteQuaternion());
         // const deltaQuaternion = targetPortal.getAbsoluteQuaternion().inverse().multiply(sourcePortal.getAbsoluteQuaternion());
         // camera.setQuaternion(deltaQuaternion);

         // TODO: Add the rest of the movement vector to the new direction (maybe two times)
      });
   }
}
