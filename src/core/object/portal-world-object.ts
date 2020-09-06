import {WorldObject} from "./world-object";
import {CircleBufferGeometry, DoubleSide, Mesh, MeshBasicMaterial} from "three";
import TWEEN from '@tweenjs/tween.js';

export class PortalWorldObject extends WorldObject {
   private readonly mesh: Mesh;
   private destination?: PortalWorldObject;

   constructor(private name: string,
               private destinationSceneName: string,
               private destinationPortalName: string) {
      super();
      this.addPhysicalObject(this.mesh = new Mesh(
         new CircleBufferGeometry(1, 100),
         new MeshBasicMaterial({
            side: DoubleSide,
            transparent: true,
            opacity: 0
         }))
      );

      // this.startAnimation();
   }

   getDestinationSceneName(): string {
      return this.destinationSceneName;
   }

   getDestinationPortalName(): string {
      return this.destinationPortalName;
   }

   setDestination(portal: PortalWorldObject) {
      this.destination = portal;
   }

   getDestination(): PortalWorldObject {
      return this.destination;
   }

   getName(): string {
      return this.name;
   }

   private startAnimation() {
      const tweenA = new TWEEN.Tween(this.mesh.position)
         .to({
            x: 0,
            y: .4,
            z: 0
         }, 3000)
         .easing(TWEEN.Easing.Sinusoidal.InOut)
         .start();
      const tweenB = new TWEEN.Tween(this.mesh.position)
         .to({
            x: 0,
            y: 0,
            z: 0
         }, 3000)
         .easing(TWEEN.Easing.Sinusoidal.InOut);
      tweenA.chain(tweenB);
      tweenB.chain(tweenA);
   }
}
