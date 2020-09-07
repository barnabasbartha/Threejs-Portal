import {Singleton} from "typescript-ioc";
import {PerspectiveCamera, Quaternion, Vector3} from "three";

@Singleton
export class CameraComponent {
   private readonly camera: PerspectiveCamera;

   constructor() {
      this.camera = new PerspectiveCamera(70, 1, 0.0001, 5000);
      this.camera.matrixAutoUpdate = false;
   }

   getCamera(): PerspectiveCamera {
      return this.camera;
   }

   setAspectRatio(ratio: number) {
      this.camera.aspect = ratio;
      this.camera.updateProjectionMatrix();
   }

   setQuaternion(quaternion: Quaternion) {
      this.camera.quaternion.copy(quaternion);
   }

   setPosition(position: Vector3) {
      this.camera.position.copy(position);
   }
}
