import {Group} from "three";

export abstract class AbstractObject {
   protected readonly group = new Group();

   getGroup(): Group {
      return this.group;
   }

   step(delta: number) {
   }
}
