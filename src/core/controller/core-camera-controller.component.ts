import {Inject, Singleton} from "typescript-ioc";
import {CoreControllerComponent} from "./core-controller.component";
import {Object3D, Quaternion} from "three";
import {MathUtil} from "../../util/math-util";
import {Subject} from "rxjs";

@Singleton
export class CoreCameraControllerComponent {
   private readonly quaternionSubject = new Subject<Quaternion>();
   public readonly quaternion$ = this.quaternionSubject.pipe();

   private static readonly SENSITIVITY = .002;
   private static readonly PI2 = Math.PI / 2;
   private readonly object = new Object3D();

   constructor(@Inject private readonly controller: CoreControllerComponent) {
      controller.mouseMove$.subscribe(delta => this.move(delta.x, delta.y));
      this.object.rotation.order = "YXZ";
      this.update();
   }

   private move(deltaX: number, deltaY: number) {
      this.object.rotation.y -= deltaX * CoreCameraControllerComponent.SENSITIVITY;
      this.object.rotation.x -= deltaY * CoreCameraControllerComponent.SENSITIVITY;
      this.object.rotation.x = MathUtil.minMax(this.object.rotation.x, -CoreCameraControllerComponent.PI2, CoreCameraControllerComponent.PI2);
      this.update();
   }

   private update() {
      this.quaternionSubject.next(this.object.quaternion);
   }
}
