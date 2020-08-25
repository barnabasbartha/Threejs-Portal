import {Singleton} from "typescript-ioc";
import {Camera, PerspectiveCamera} from "three";

@Singleton
export class CameraComponent {
   private readonly camera: PerspectiveCamera;

   constructor() {
      this.camera = new PerspectiveCamera(70, 1, 0.01, 5000);
      this.camera.position.z = 10;
      this.camera.lookAt(0, 0, 0);
   }

   getCamera(): Camera {
      return this.camera;
   }

   setAspectRatio(ratio: number) {
      this.camera.aspect = ratio;
      this.camera.updateProjectionMatrix();
   }
}
