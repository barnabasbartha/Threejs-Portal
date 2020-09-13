import {WorldObject} from "./world-object";
import {CircleBufferGeometry, DoubleSide, Mesh, MeshBasicMaterial} from "three";

export class PortalWorldObject extends WorldObject {
   private readonly mesh: Mesh;
   private destination?: PortalWorldObject;

   constructor(private name: string,
               private destinationSceneName: string,
               private destinationPortalName: string,
               private size: number = 1) {
      super();

      this.addPhysicalObject(this.mesh = new Mesh(
         new CircleBufferGeometry(size, 100),
         new MeshBasicMaterial({
            side: DoubleSide,
            transparent: true,
            opacity: 0
         }),
         )
      );
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
