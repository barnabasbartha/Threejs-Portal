import { Inject, Singleton } from 'typescript-ioc';
import { CoreControllerComponent } from './core-controller.component';
import { Euler, Object3D, Quaternion, Vector3 } from 'three';
import { MathUtil } from '../../util/math-util';
import { Subject } from 'rxjs';

@Singleton
export class CoreCameraControllerComponent {
   private readonly quaternionSubject = new Subject<Quaternion>();
   readonly quaternion$ = this.quaternionSubject.pipe();

   private static readonly SENSITIVITY = 0.002;
   private static readonly PI2 = Math.PI / 2;
   private readonly object = new Object3D();
   private readonly direction = new Vector3();

   constructor(@Inject private readonly controller: CoreControllerComponent) {
      controller.mouseMove$.subscribe((delta) => this.move(delta.x, delta.y));
      this.object.rotation.order = 'YXZ';
      this.update();
   }

   getDirection(): Vector3 {
      return this.direction.set(0, 0, 1).applyQuaternion(this.object.quaternion);
   }

   getRotation(): Euler {
      return this.object.rotation;
   }

   setRotation(rotation: Euler): void {
      this.object.setRotationFromEuler(rotation);
      this.update();
   }

   private move(deltaX: number, deltaY: number): void {
      this.object.rotation.y -= deltaX * CoreCameraControllerComponent.SENSITIVITY;
      this.object.rotation.x -= deltaY * CoreCameraControllerComponent.SENSITIVITY;
      this.object.rotation.x = MathUtil.minMax(
         this.object.rotation.x,
         -CoreCameraControllerComponent.PI2,
         CoreCameraControllerComponent.PI2,
      );
      this.update();
   }

   private update(): void {
      this.quaternionSubject.next(this.object.quaternion);
   }
}
