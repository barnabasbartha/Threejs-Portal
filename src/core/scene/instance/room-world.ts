import {World} from "./world";
import {PortalWorldObject} from "../../object/portal-world-object";
import {
   AmbientLight,
   BackSide,
   BoxBufferGeometry,
   Mesh,
   MeshNormalMaterial,
   MeshStandardMaterial,
   PointLight
} from "three";

export class RoomWorld extends World {
   private readonly portal: PortalWorldObject;
   private readonly box: Mesh;
   private readonly outsideBox: Mesh;

   constructor() {
      super("RoomWorld");
      this.initLight();
      this.addPortal(this.portal = new PortalWorldObject("RoomWorld.portal", "SkyWorld", "SkyWorld.portal"));
      this.portal.getPosition().set(0, 1.5, 0);
      this.portal.getGroup().rotation.y = Math.PI;

      this.add(this.box = new Mesh(new BoxBufferGeometry(1, 2, 1), new MeshNormalMaterial()));
      this.box.position.set(5, 2, 5);

      this.add(this.outsideBox = new Mesh(
         new BoxBufferGeometry(20, 20, 20),
         new MeshStandardMaterial({
            side: BackSide,
            color: 0x555555
         })));
      this.outsideBox.position.set(0, 10, 0);
   }

   private initLight() {
      const directionalLight = new PointLight();
      directionalLight.intensity = 2;
      directionalLight.position.set(5, 5, 5);
      this.add(directionalLight);

      const ambientLight = new AmbientLight();
      this.add(ambientLight);
   }

   step(delta: number) {
      this.box.rotation.y += 0.01;
   }
}
