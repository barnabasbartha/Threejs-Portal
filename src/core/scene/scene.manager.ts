import {Inject, Singleton} from "typescript-ioc";
import {SceneComponent} from "./scene.component";
import {TimerComponent} from "../timer/timer.component";
import {CoreControllerComponent} from "../controller/core-controller.component";
import {AmbientLight, DirectionalLight, Vector3} from "three";
import {Sky} from "three/examples/jsm/objects/Sky";
import {RendererComponent} from "../renderer/renderer.component";

@Singleton
export class SceneManager {
   constructor(@Inject private readonly component: SceneComponent,
               @Inject private readonly timer: TimerComponent,
               @Inject private readonly controller: CoreControllerComponent,
               @Inject private readonly renderer: RendererComponent) {
      renderer.init$.subscribe(() => {
         timer.step$.subscribe(delta => component.step(delta));

         // TODO: Move Scene Instance related stuff to a separate instantiable object
         this.initLight();
         this.initSky();
      });
   }

   private initLight() {
      const directionalLight = new DirectionalLight();
      directionalLight.intensity = 2;
      directionalLight.position.set(50, 50, 50);
      directionalLight.target.position.set(0, 0, 0);
      this.component.add(directionalLight);

      const ambientLight = new AmbientLight();
      this.component.add(ambientLight);
   }

   private initSky() {
      const sky = new Sky();
      sky.scale.setScalar(10000);

      const inclination = .5;
      const azimuth = 0.6771;
      const turbidity = 10;
      const rayleigh = 2;
      const mieCoefficient = .005;
      const mieDirectionalG = .8;

      const uniforms = sky.material.uniforms;
      uniforms["turbidity"].value = turbidity;
      uniforms["rayleigh"].value = rayleigh;
      uniforms["mieCoefficient"].value = mieCoefficient;
      uniforms["mieDirectionalG"].value = mieDirectionalG;

      const theta = Math.PI * (inclination - 0.5);
      const phi = 2 * Math.PI * (azimuth - 0.5);

      const sun = new Vector3(
         Math.cos(phi),
         Math.sin(phi) * Math.sin(theta),
         Math.sin(phi) * Math.cos(theta)
      );
      uniforms["sunPosition"].value.copy(sun);

      this.component.add(sky);
   }
}
