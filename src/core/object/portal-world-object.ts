import {WorldObject} from './world-object';
import {Object3D, PointLight} from 'three';

export class PortalWorldObject extends WorldObject {
   private destination?: PortalWorldObject;

   constructor(
      object: Object3D | null,
      private name: string,
      private destinationWorldName: string,
      private destinationPortalName: string,
      private teleportEnabled: boolean,
      private color?: number,
   ) {
      super();
      if (this.color) {
         this.addLight();
      }
      this.addPhysicalObject(object);
   }

   getDestinationWorldName(): string {
      return this.destinationWorldName;
   }

   getDestinationPortalName(): string {
      return this.destinationPortalName;
   }

   setDestination(portal: PortalWorldObject): void {
      this.destination = portal;
   }

   getDestination(): PortalWorldObject {
      return this.destination;
   }

   getName(): string {
      return this.name;
   }

   isTeleportEnabled(): boolean {
      return this.teleportEnabled;
   }

   private addLight(): void {
      this.add(new PointLight(this.color, .5, 5));
   }
}
