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
import {Sky} from "three/examples/jsm/objects/Sky";

export class RoomWorld extends World {
   private readonly portal: PortalWorldObject;
   private readonly box: Mesh;
   private readonly outsideBox: Mesh;

   constructor() {
      super("RoomWorld");
      this.initLight();
      this.addPortal(this.portal = new PortalWorldObject("RoomWorld.portal", "SkyWorld", "SkyWorld.portal"));
      this.portal.getPosition().set(0, 1, 0);

      this.add(this.box = new Mesh(new BoxBufferGeometry(1, 2, 1), new MeshNormalMaterial()));
      this.box.position.set(0, 1.5, 3.5);

      this.add(this.outsideBox = new Mesh(
         new BoxBufferGeometry(10, 6, 10),
         new MeshStandardMaterial({
            side: BackSide,
            color: 0x888888
         })));
      this.outsideBox.position.set(0, 3, 0);


      const sky = new Sky();
      sky.scale.setScalar(10000);
      this.add(sky);
   }

   private initLight() {
      const directionalLight = new PointLight();
      directionalLight.intensity = 1;
      directionalLight.position.set(4, 4, 4);
      this.add(directionalLight);

      const ambientLight = new AmbientLight();
      this.add(ambientLight);
   }

   step(delta: number) {
      this.box.rotation.y += 0.01;
   }
}
