import { Singleton } from 'typescript-ioc';
import { PerspectiveCamera, Quaternion, Vector3 } from 'three';

@Singleton
export class CameraComponent {
   private readonly camera: PerspectiveCamera;

   constructor() {
      this.camera = new PerspectiveCamera(70, 1, 0.0001, 5000);
   }

   getCamera(): PerspectiveCamera {
      return this.camera;
   }

   setAspectRatio(ratio: number): void {
      this.camera.aspect = ratio;
      this.camera.updateProjectionMatrix();
   }

   setQuaternion(quaternion: Quaternion): void {
      this.camera.quaternion.copy(quaternion);
   }

   setPosition(position: Vector3): void {
      this.camera.position.copy(position);
   }
}
