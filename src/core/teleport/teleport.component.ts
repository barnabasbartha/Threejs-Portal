import {Inject, Singleton} from "typescript-ioc";
import {MovementComponent} from "../controller/movement-component";
import {CoreCameraControllerComponent} from "../controller/core-camera-controller.component";
import {SceneComponent} from "../scene/scene.component";
import {Euler} from "three";
import {TeleportContext} from "./teleport.model";

@Singleton
export class TeleportComponent {
   private static readonly EPS = 0.000001;

   constructor(@Inject protected readonly movement: MovementComponent,
               @Inject protected readonly camera: CoreCameraControllerComponent,
               @Inject protected readonly scene: SceneComponent) {
   }

   teleport(teleport: TeleportContext) {
      const sourcePortal = teleport.sourcePortal;
      const targetWorld = this.scene.getWorld(sourcePortal.getDestinationSceneName());
      const targetPortal = targetWorld.getPortal(sourcePortal.getDestinationPortalName());

      // Switch scene
      this.scene.setCurrentWorld(targetWorld);

      const collisionSourcePortalDeltaPosition = teleport.collision.position.clone().sub(sourcePortal.getAbsolutePosition());
      const cameraRotation = this.camera.getRotation();
      const targetPortalRotation = targetPortal.getAbsoluteRotation();
      const sourcePortalRotation = sourcePortal.getAbsoluteRotation();

      // For some reason, if the source/target portal's rotation is less than EPS, it will rotate 180 deg
      const extraRotation = (Math.abs(sourcePortalRotation.y) < TeleportComponent.EPS &&
         sourcePortalRotation.y !== 0) ||
      (Math.abs(targetPortalRotation.y) < TeleportComponent.EPS &&
         targetPortalRotation.y !== 0) ? 0 : Math.PI;

      const deltaRotation = new Euler(
         0, //targetPortalRotation.x - sourcePortalRotation.x,
         targetPortalRotation.y - sourcePortalRotation.y + extraRotation,
         0, //targetPortalRotation.z - sourcePortalRotation.z
      );
      // cameraRotation.x += deltaRotation.x;
      cameraRotation.y += deltaRotation.y;
      // cameraRotation.z += deltaRotation.z;
      collisionSourcePortalDeltaPosition.applyEuler(deltaRotation);

      const remainingMovementAfterCollision = teleport.collision.movement.clone().multiplyScalar(1 - teleport.collision.ratioToPosition);
      remainingMovementAfterCollision.applyEuler(deltaRotation);

      this.camera.setRotation(cameraRotation);
      this.movement.setPosition(
         collisionSourcePortalDeltaPosition
            .add(remainingMovementAfterCollision)
            .add(targetPortal.getAbsolutePosition())
      );
   }
}
