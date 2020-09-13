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

export class AbstractBoxWorld extends World {
   protected readonly mesh: Mesh;
   private readonly portal: PortalWorldObject;
   private readonly outsideBox: Mesh;

   constructor(private number: number,
               private color: number) {
      super(`BoxWorld${number}`);
      this.initLight();
      this.addPortal(this.portal = new PortalWorldObject(`BoxWorld${number}.portal`, "RoomWorld", `RoomWorld.boxPortal${number}`, .5));
      this.addObject(this.portal);
      this.portal.getGroup().position.set(0, 0, 0);

      this.add(this.mesh = new Mesh(new BoxBufferGeometry(.2, .2, .2), new MeshNormalMaterial()));

      this.add(this.outsideBox = new Mesh(
         new BoxBufferGeometry(1, 1, 1),
         new MeshStandardMaterial({
            side: BackSide,
            color,
            shadowSide: BackSide
         })));

      //const sky = new Sky();
      //sky.scale.setScalar(10000);
      //this.add(sky);
   }

   private initLight() {
      const directionalLight = new PointLight();
      directionalLight.intensity = 1;
      directionalLight.position.set(0, 1, .5);
      this.add(directionalLight);

      const ambientLight = new AmbientLight();
      this.add(ambientLight);
   }

   step(delta: number) {
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.01;
      this.mesh.rotation.z += 0.01;
   }
}
