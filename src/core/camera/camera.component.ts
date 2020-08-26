import {Singleton} from "typescript-ioc";
import {Camera, PerspectiveCamera} from "three";

@Singleton
export class CameraComponent {
   private readonly camera: PerspectiveCamera;

   constructor() {
      this.camera = new PerspectiveCamera(70, 1, 0.01, 5000);
   }

   getCamera(): Camera {
      return this.camera;
   }

   setAspectRatio(ratio: number) {
      this.camera.aspect = ratio;
      this.camera.updateProjectionMatrix();
   }
}
