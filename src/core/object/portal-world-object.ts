import {WorldObject} from "./world-object";
import {BoxGeometry, Face3, Geometry, Mesh, MeshBasicMaterial, Vector3} from "three";

export class PortalWorldObject extends WorldObject {
   private readonly mesh: Mesh;

   constructor() {
      super();
      this.add(this.mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial()));
   }
}

class PortalGeometry extends Geometry {
   constructor() {
      super();
      for (let i = 0; i < 8; i++) {
         this.vertices.push(new Vector3());
      }

      // front is front facing
      // volume is back facing
      // material index from PortalMaterial
      this.faces.push(
         // front
         new Face3(0, 1, 2),
         new Face3(1, 3, 2),
         // volume
         new Face3(1, 3, 5, null, null, 1),
         new Face3(7, 5, 3, null, null, 1),
         new Face3(3, 6, 7, null, null, 1),
         new Face3(2, 6, 3, null, null, 1),
         new Face3(0, 4, 6, null, null, 1),
         new Face3(0, 6, 2, null, null, 1),
         new Face3(0, 5, 4, null, null, 1),
         new Face3(1, 5, 0, null, null, 1),
         new Face3(4, 5, 6, null, null, 1),
         new Face3(5, 7, 6, null, null, 1)
      );
   }
}
