import {Singleton} from "typescript-ioc";
import {Scene} from "three";
import {SkyWorld} from "./instance/sky-world";

@Singleton
export class SceneComponent {
   private readonly scene1 = new SkyWorld();

   getScene(): Scene {
      return this.scene1.getGroup();
   }

   step(delta: number) {
      this.scene1.step(delta);
   }
}
