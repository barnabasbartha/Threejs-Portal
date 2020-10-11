import {AbstractBoxWorld} from "./abstract-box-world";

export class BoxWorld3 extends AbstractBoxWorld {
   constructor() {
      super(3, 0x000088);
   }

   step(delta: number) {
      this.mesh.rotation.x -= 0.01;
      this.mesh.rotation.y -= 0.11;
      this.mesh.rotation.z -= 0.01;
   }
}
