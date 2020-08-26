import {Group} from "three";

export abstract class MeshObject {
   protected readonly group = new Group();

   getGroup(): Group {
      return this.group;
   }

   step(delta: number) {
   }
}
