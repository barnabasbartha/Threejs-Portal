import {WorldObject} from './world-object';
import {Object3D} from 'three';
import {createLight} from "../light/light.utils";
import {LightColor} from "../light/light.model";

export class PortalWorldObject extends WorldObject {
   private destination?: PortalWorldObject;

   constructor(
      private object: Object3D | null,
      private worldName: string,
      private name: string,
      private destinationWorldName: string,
      private destinationPortalName: string,
      private teleportEnabled: boolean,
      private color: LightColor,
   ) {
      super();
      if (this.color) {
         this.add(createLight(color));
      }
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
      this.object.visible = true;
   }

   getDestination(): PortalWorldObject | undefined {
      return this.destination;
   }

   removeDestination(): void {
      this.destination = undefined;
      this.destinationWorldName = undefined;
      this.destinationPortalName = undefined;
      this.object.visible = false;
   }

   getName(): string {
      return this.name;
   }

   isVisible(): boolean {
      return this.object.visible;
   }

   isEnabled(): boolean {
      return this.teleportEnabled && this.isVisible();
   }
}
