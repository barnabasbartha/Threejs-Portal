import {AmbientLight, DirectionalLight, Vector3} from "three";
import {Sky} from "three/examples/jsm/objects/Sky";
import {World} from "./world";
import {PortalWorldObject} from "../../object/portal-world-object";

export class SkyWorld extends World {
   constructor() {
      super();
      this.initLight();
      this.initSky();
      this.addObject(new PortalWorldObject());
   }

   private initLight() {
      const directionalLight = new DirectionalLight();
      directionalLight.intensity = 2;
      directionalLight.position.set(50, 50, 50);
      directionalLight.target.position.set(0, 0, 0);
      this.add(directionalLight);

      const ambientLight = new AmbientLight();
      this.add(ambientLight);
   }

   private initSky() {
      const sky = new Sky();
      sky.scale.setScalar(10000);

      const inclination = 0.2038;
      const azimuth = 0.0954;
      const turbidity = 2.0;
      const rayleigh = 0.035;
      const mieCoefficient = 0.013;
      const mieDirectionalG = 0.431;

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

      this.add(sky);
   }
}
