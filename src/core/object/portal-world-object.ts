import {WorldObject} from './world-object';
import {Object3D} from 'three';

export class PortalWorldObject extends WorldObject {
   private destination?: PortalWorldObject;

   constructor(
      private readonly object: Object3D | null,
      private readonly worldName: string,
      protected readonly name: string,
      private destinationWorldName: string,
      private destinationPortalName: string,
      private teleportEnabled: boolean,
   ) {
      super(name);
      this.addPhysicalObject(object);
   }

   getWorldName(): string {
      return this.worldName;
   }

   getDestinationWorldName(): string {
      return this.destinationWorldName;
   }

   getDestinationPortalName(): string | undefined {
      return this.destinationPortalName;
   }

   setDestination(portal: PortalWorldObject): void {
      this.destination = portal;
      this.destinationWorldName = portal.getWorldName();
      this.destinationPortalName = portal.getName();
      this.show();
   }

   getDestination(): PortalWorldObject | undefined {
      return this.destination;
   }

   removeDestination(): void {
      this.destination = undefined;
      this.destinationWorldName = undefined;
      this.destinationPortalName = undefined;
      this.hide();
   }

   getName(): string {
      return this.name;
   }

   disable(): void {
      this.teleportEnabled = false;
   }

   enable(): void {
      this.teleportEnabled = true;
   }

   isEnabled(): boolean {
      return this.teleportEnabled && !!this.destination;
   }

   makeInvisible(): void {
      super.makeInvisible();
      this.object.visible = false;
   }

   makeVisible(): void {
      super.makeVisible();
      this.object.visible = true;
   }
}
