import {World} from "./world";
import {PortalWorldObject} from "../../object/portal-world-object";
import {AmbientLight, BoxBufferGeometry, DirectionalLight, Mesh, MeshNormalMaterial} from "three";

export class RoomWorld extends World {
   private readonly portal: PortalWorldObject;
   private readonly box: Mesh;

   constructor() {
      super("RoomWorld");
      this.initLight();
      this.addPortal(this.portal = new PortalWorldObject("RoomWorld.portal", "SkyWorld", "SkyWorld.portal"));
      this.portal.getPosition().set(2, 2, 2);

      this.add(this.box = new Mesh(new BoxBufferGeometry(), new MeshNormalMaterial()));
      this.box.position.set(5, 0, 5);
   }

   private initLight() {
      const directionalLight = new DirectionalLight();
      directionalLight.intensity = 2;
      directionalLight.position.set(50, 50, 50);
      directionalLight.target.position.set(0, 0, 0);
      this.add(directionalLight);

      const ambientLight = new AmbientLight();
      this.add(ambientLight);
   }

   step(delta: number) {
      this.box.rotation.y += 0.01;
   }
}
