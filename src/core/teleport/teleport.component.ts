import {Inject, Singleton} from 'typescript-ioc';
import {MovementComponent} from '../controller/movement-component';
import {CoreCameraControllerComponent} from '../controller/core-camera-controller.component';
import {WorldComponent} from '../world/world.component';
import {Euler} from 'three';
import {TeleportContext} from './teleport.model';
import {TeleportUtils} from './teleport-utils';

@Singleton
export class TeleportComponent {
   constructor(
      @Inject private readonly movement: MovementComponent,
      @Inject private readonly camera: CoreCameraControllerComponent,
      @Inject private readonly world: WorldComponent,
   ) {
   }

   teleport(teleport: TeleportContext): void {
      const sourcePortal = teleport.sourcePortal;
      const targetWorld = this.world.getWorld(sourcePortal.getDestinationWorldName());
      const targetPortal = targetWorld.getPortal(sourcePortal.getDestinationPortalName());

      // Switch world
      this.world.setCurrentWorld(targetWorld);

      const collisionSourcePortalDeltaPosition = teleport.collision.intersection.point
         .clone()
         .sub(sourcePortal.getAbsolutePosition());
      const cameraRotation = this.camera.getRotation();
      const targetPortalRotation = targetPortal.getAbsoluteRotation();
      const sourcePortalRotation = sourcePortal.getAbsoluteRotation();

      // For some reason, if the source/target portal's rotation is less than EPS, it will rotate 180 deg
      const extraRotation = TeleportUtils.getBuggyRotationConstant(sourcePortalRotation.y, targetPortalRotation.y);

      const deltaRotation = new Euler(
         0, //targetPortalRotation.x - sourcePortalRotation.x,
         targetPortalRotation.y - sourcePortalRotation.y + extraRotation,
         0, //targetPortalRotation.z - sourcePortalRotation.z
      );
      // cameraRotation.x += deltaRotation.x;
      cameraRotation.y += deltaRotation.y;
      // cameraRotation.z += deltaRotation.z;
      collisionSourcePortalDeltaPosition.applyEuler(deltaRotation);

      const remainingMovementAfterCollision = teleport.collision.movement
         .clone()
         .multiplyScalar(teleport.collision.ratioAfterPosition);
      remainingMovementAfterCollision.applyEuler(deltaRotation);

      this.camera.setRotation(cameraRotation);
      this.movement.setPosition(
         collisionSourcePortalDeltaPosition
            .add(remainingMovementAfterCollision)
            .add(targetPortal.getAbsolutePosition()),
      );
   }
}
