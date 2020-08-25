import {Singleton} from "typescript-ioc";
import {Fog, Object3D, Scene} from "three";
import {AbstractObject} from "../object/abstract-object";

@Singleton
export class SceneComponent {
   private readonly scene = new Scene();
   private readonly objects = new Set<AbstractObject>();

   getScene(): Scene {
      return this.scene;
   }

   step(delta: number) {
      for (const object of this.objects.values()) {
         object.step(delta)
      }
   }

   addObject(object: AbstractObject) {
      if (!this.objects.has(object)) {
         this.objects.add(object);
         this.add(object.getGroup());
      }
   }

   removeObject(object: AbstractObject) {
      if (this.objects.has(object)) {
         this.objects.delete(object);
         this.scene.remove(object.getGroup());
      }
   }

   add(object: Object3D) {
      this.scene.add(object);
   }

   remove(object: Object3D) {
      this.scene.remove(object);
   }

   setFog(fog: Fog) {
      this.scene.fog = fog;
   }
}
