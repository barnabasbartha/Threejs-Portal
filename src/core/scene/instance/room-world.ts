import {World} from "./world";
import {PortalWorldObject} from "../../object/portal-world-object";
import {
   AmbientLight,
   BackSide,
   BoxBufferGeometry,
   DoubleSide,
   Mesh,
   MeshNormalMaterial,
   MeshStandardMaterial,
   PointLight
} from "three";
import {PortalHolderWorldObject} from "../../object/portal-holder-world-object";

export class RoomWorld extends World {
   private readonly box: Mesh;
   private readonly outsideBox: Mesh;

   constructor() {
      super("RoomWorld", 4.99);
      this.initLight();

      this.add(this.box = new Mesh(new BoxBufferGeometry(1, 2, 1), new MeshNormalMaterial({side: DoubleSide})));
      this.box.position.set(0, 1.5, 3.5);

      this.add(this.outsideBox = new Mesh(
         new BoxBufferGeometry(10, 6, 10),
         new MeshStandardMaterial({
            side: BackSide,
            color: 0x888888
         })));
      this.outsideBox.position.set(0, 3, 0);


      //const mirrorPortal = new PortalWorldObject("RoomWorld.mirror", "RoomWorld", "RoomWorld.mirror");
      //mirrorPortal.getGroup().position.set(-2.5, 1, 0);
      //this.addPortal(mirrorPortal);
      //this.addObject(mirrorPortal);


      const portalToRoom1 = new PortalWorldObject("RoomWorld.portalToRoom1", "RoomWorld", "RoomWorld.portalToRoom2", true, 2);
      portalToRoom1.getGroup().position.set(5, 1, 0);
      portalToRoom1.getGroup().rotation.y = -Math.PI / 2;
      this.addPortal(portalToRoom1);
      this.addObject(portalToRoom1);
      const portalToRoom2 = new PortalWorldObject("RoomWorld.portalToRoom2", "RoomWorld", "RoomWorld.portalToRoom1", true, 2);
      portalToRoom2.getGroup().position.set(2, 1, -5.0);
      this.addPortal(portalToRoom2);
      this.addObject(portalToRoom2);

      const portal1 = new PortalWorldObject("RoomWorld.boxPortal1", "BoxWorld1", "BoxWorld1.portal", false, 1);
      const portal2 = new PortalWorldObject("RoomWorld.boxPortal2", "BoxWorld2", "BoxWorld2.portal", false, 1);
      const portal3 = new PortalWorldObject("RoomWorld.boxPortal3", "BoxWorld3", "BoxWorld3.portal", false, 1);
      const portal4 = new PortalWorldObject("RoomWorld.boxPortal4", "BoxWorld4", "BoxWorld4.portal", false, 1);
      this.addPortal(portal1);
      this.addPortal(portal2)
      this.addPortal(portal3);
      this.addPortal(portal4);
      const portalHolder = new PortalHolderWorldObject(portal1, portal2, portal3, portal4);
      this.addObject(portalHolder);
      portalHolder.getGroup().position.set(2.5, 1, 0);
   }

   private initLight() {
      const directionalLight = new PointLight(0xffffff, .7);
      directionalLight.position.set(0, 2.5, 0);
      this.add(directionalLight);

      const ambientLight = new AmbientLight(0xffffff);
      this.add(ambientLight);
   }

   step(delta: number) {
      this.box.rotation.y += 0.01;
   }
}
