import {WorldObject} from "./world-object";
import {Mesh, MeshBasicMaterial, PlaneBufferGeometry} from "three";

export class PortalWorldObject extends WorldObject {
   private readonly mesh: Mesh;
   private destination?: PortalWorldObject;

   constructor(private name: string,
               private destinationSceneName: string,
               private destinationPortalName: string) {
      super();
      this.add(this.mesh = new Mesh(new PlaneBufferGeometry(3, 3, 1, 1), new MeshBasicMaterial()));
   }

   getDestinationSceneName(): string {
      return this.destinationSceneName;
   }

   getDestinationPortalName(): string {
      return this.destinationPortalName;
   }

   setDestination(portal: PortalWorldObject) {
      this.destination = portal;
   }

   getDestination(): PortalWorldObject {
      return this.destination;
   }

   getName(): string {
      return this.name;
   }
}
