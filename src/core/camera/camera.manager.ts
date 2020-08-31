import {Inject, Singleton} from "typescript-ioc";
import {CameraComponent} from "./camera.component";
import {CoreControllerComponent} from "../controller/core-controller.component";
import {MathUtil} from "../../util/math-util";

@Singleton
export class CameraManager {
   private targetAngle = 0;
   private readonly limit = Math.PI / 20;
   private readonly intensity = 0.0001;

   constructor(@Inject private readonly component: CameraComponent,
               @Inject private readonly controller: CoreControllerComponent) {
      controller.mouseMove$.subscribe(delta => this.move(delta.x, delta.y));
      controller.resize$.subscribe(size => component.setAspectRatio(size.x / size.y));

      this.update();
      component.getCamera().position.set(1, 0, 1);
   }

   private move(x: number, y: number) {
      this.targetAngle = this.targetAngle + x * this.intensity;
      this.update();
   }

   private update() {
      const target = MathUtil.minMax(this.targetAngle, -this.limit, this.limit)
      this.component.getCamera().rotation.y = target * 2;
      this.component.getCamera().position.x = target * 50;
      this.component.getCamera().position.z = -2;
      this.component.getCamera().lookAt(1, 0, 1);
   }
}
