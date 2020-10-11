import {AbstractBoxWorld} from "./abstract-box-world";

export class BoxWorld2 extends AbstractBoxWorld {
   constructor() {
      super(2, 0x008800);
   }

   step(delta: number) {
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y -= 0.01;
      this.mesh.rotation.z += 0.01;
   }
}
