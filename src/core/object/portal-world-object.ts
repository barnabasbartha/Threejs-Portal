import {WorldObject} from "./world-object";
import {DoubleSide, Mesh, MeshBasicMaterial, PlaneBufferGeometry} from "three";

export class PortalWorldObject extends WorldObject {
   private readonly mesh: Mesh;
   private destination?: PortalWorldObject;

   constructor(private name: string,
               private destinationSceneName: string,
               private destinationPortalName: string) {
      super();
      this.add(this.mesh = new Mesh(new PlaneBufferGeometry(2, 2, 1, 1), new MeshBasicMaterial({
         side: DoubleSide,
         transparent: true,
         opacity: 0
      })));
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
