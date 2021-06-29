import {Inject, Singleton} from 'typescript-ioc';
import {MovementComponent} from '../controller/movement-component';
import {CoreCameraControllerComponent} from '../controller/core-camera-controller.component';
import {WorldComponent} from '../world/world.component';
import {Euler} from 'three';
import {TeleportContext} from './teleport.model';
import {TeleportUtils} from './teleport-utils';
import {Observable, Subject} from "rxjs";
import {filter} from "rxjs/operators";
import {PortalWorldObject} from "../object/portal-world-object";

@Singleton
export class TeleportComponent {
   private readonly sourcePortalTeleportedSubject = new Subject<PortalWorldObject>();
   private readonly targetPortalTeleportedSubject = new Subject<PortalWorldObject>();

   constructor(
      @Inject private readonly movement: MovementComponent,
      @Inject private readonly camera: CoreCameraControllerComponent,
      @Inject private readonly world: WorldComponent,
   ) {
   }

   teleport(context: TeleportContext): void {
      const sourcePortal = context.sourcePortal;
      const targetWorld = this.world.getWorld(sourcePortal.getDestinationWorldName());
      const targetPortal = targetWorld.getPortal(sourcePortal.getDestinationPortalName());

      // Switch world
      this.world.setCurrentWorld(targetWorld);

      const collisionSourcePortalDeltaPosition = context.collision.intersection.point
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

      const remainingMovementAfterCollision = context.collision.movement
         .clone()
         .multiplyScalar(context.collision.ratioAfterPosition);
      remainingMovementAfterCollision.applyEuler(deltaRotation);

      this.camera.setRotation(cameraRotation);
      this.movement.setPosition(
         collisionSourcePortalDeltaPosition
            .add(remainingMovementAfterCollision)
            .add(targetPortal.getAbsolutePosition()),
      );

      this.targetPortalTeleportedSubject.next(context.sourcePortal.getDestination());
      this.sourcePortalTeleportedSubject.next(context.sourcePortal);
   }

   subscribeSourcePortal(worldName: string, portalName: string): Observable<PortalWorldObject> {
      return this.filterPortal(this.sourcePortalTeleportedSubject, worldName, portalName);
   }

   subscribeTargetPortal(worldName: string, portalName: string): Observable<PortalWorldObject> {
      return this.filterPortal(this.targetPortalTeleportedSubject, worldName, portalName);
   }

   private filterPortal(portal$: Observable<PortalWorldObject>, worldName: string, portalName: string): Observable<PortalWorldObject> {
      return portal$.pipe(filter(portal => portal.getWorldName() === worldName && portal.getName() === portalName));
   }
}
