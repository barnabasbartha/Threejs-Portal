import {MeshObject} from "../../object/mesh-object";
import {Object3D, Scene} from "three";

export abstract class World {
   protected readonly scene = new Scene();
   private readonly objects = new Set<MeshObject>();

   getScene(): Scene {
      return this.scene;
   }

   step(delta: number) {
      for (const object of this.objects.values()) {
         object.step(delta);
      }
   }

   addObject(object: MeshObject) {
      if (!this.objects.has(object)) {
         this.objects.add(object);
         this.add(object.getGroup());
      }
   }

   removeObject(object: MeshObject) {
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
}
