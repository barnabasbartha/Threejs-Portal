import {AbstractBoxWorld} from "./abstract-box-world";

export class BoxWorld1 extends AbstractBoxWorld {
   constructor() {
      super(1, 0x880000);
   }

   step(delta: number) {
      this.mesh.rotation.x -= 0.01;
      this.mesh.rotation.y += 0.01;
      this.mesh.rotation.z += 0.01;
   }
}
