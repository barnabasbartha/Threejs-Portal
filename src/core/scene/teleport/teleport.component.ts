import {Inject, Singleton} from "typescript-ioc";
import {MovementComponent} from "../../controller/movement-component";
import {CoreCameraControllerComponent} from "../../controller/core-camera-controller.component";
import {SceneComponent} from "../scene.component";
import {Euler} from "three";

@Singleton
export class TeleportComponent {
   constructor(@Inject protected readonly movement: MovementComponent,
               @Inject protected readonly camera: CoreCameraControllerComponent,
               @Inject protected readonly scene: SceneComponent) {
      movement.teleport$.subscribe(teleport => {
         const sourcePortal = teleport.sourcePortal;
         const targetWorld = scene.getWorld(sourcePortal.getDestinationSceneName());
         const targetPortal = targetWorld.getPortal(sourcePortal.getDestinationPortalName());

         // Switch scene
         scene.setCurrentWorld(targetWorld);

         const collisionSourcePortalDeltaPosition = teleport.collision.position.clone().sub(sourcePortal.getAbsolutePosition());
         const cameraRotation = camera.getRotation();
         const targetPortalRotation = targetPortal.getAbsoluteRotation();
         const sourcePortalRotation = sourcePortal.getAbsoluteRotation();
         const deltaRotation = new Euler(
            0, //targetPortalRotation.x - sourcePortalRotation.x,
            targetPortalRotation.y - sourcePortalRotation.y + Math.PI, // TODO: Why?
            0, //targetPortalRotation.z - sourcePortalRotation.z
         );
         cameraRotation.x += deltaRotation.x;
         cameraRotation.y += deltaRotation.y;
         cameraRotation.z += deltaRotation.z;
         collisionSourcePortalDeltaPosition.applyEuler(deltaRotation);

         const remainingMovementAfterCollision = teleport.collision.movement.clone().multiplyScalar(1 - teleport.collision.ratioToPosition);
         remainingMovementAfterCollision.applyEuler(deltaRotation);

         camera.setRotation(cameraRotation);
         movement.setPosition(
            collisionSourcePortalDeltaPosition
               .add(remainingMovementAfterCollision)
               .add(targetPortal.getAbsolutePosition())
         );
      });
   }
}
