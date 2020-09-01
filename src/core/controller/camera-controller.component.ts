import {Inject, Singleton} from "typescript-ioc";
import {CoreControllerComponent} from "./core-controller.component";
import {Object3D, Quaternion} from "three";
import {MathUtil} from "../../util/math-util";
import {Subject} from "rxjs";

@Singleton
export class CameraControllerComponent {
   private readonly quaternionSubject = new Subject<Quaternion>();
   public readonly quaternion$ = this.quaternionSubject.pipe();

   private static readonly MOUSE_SENSITIVITY = .002;
   private static readonly PI2 = Math.PI / 2;
   private readonly object = new Object3D();

   constructor(@Inject private readonly controller: CoreControllerComponent) {
      controller.mouseMove$.subscribe(delta => this.move(delta.x, delta.y));
      this.object.rotation.order = "YXZ";
      this.update();
   }

   private move(deltaX: number, deltaY: number) {
      this.object.rotation.y -= deltaX * CameraControllerComponent.MOUSE_SENSITIVITY;
      this.object.rotation.x -= deltaY * CameraControllerComponent.MOUSE_SENSITIVITY;
      this.object.rotation.x = MathUtil.minMax(this.object.rotation.x, -CameraControllerComponent.PI2, CameraControllerComponent.PI2);
      this.update();
   }

   private update() {
      this.quaternionSubject.next(this.object.quaternion);
   }
}
