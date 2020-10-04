import {WorldObject} from "./world-object";
import {PortalWorldObject} from "./portal-world-object";

export class PortalHolderWorldObject extends WorldObject {
   constructor(private portal1: PortalWorldObject,
               private portal2: PortalWorldObject,
               private portal3: PortalWorldObject,
               private portal4: PortalWorldObject) {
      super();
      const width = 1;
      const height = 2;
      this.addObject(this.portal1);
      this.addObject(this.portal2);
      this.addObject(this.portal3);
      this.addObject(this.portal4);

portal1.getGroup().position.z = -1;
portal2.getGroup().position.z = -.3;
portal3.getGroup().position.z = .4;
portal4.getGroup().position.z = 1.1;
      /*
           portal1.getGroup().position.z = -width / 2;
           portal2.getGroup().position.x = -width / 2;
           portal2.getGroup().rotation.y = Math.PI / 2;
           portal3.getGroup().position.z = width / 2;
           portal3.getGroup().rotation.y = Math.PI;
           portal4.getGroup().position.x = width / 2;
           portal4.getGroup().rotation.y = -Math.PI / 2; */

   }
}
