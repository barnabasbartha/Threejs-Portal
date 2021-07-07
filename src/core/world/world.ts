import {WorldObject} from '../object/world-object';
import {DirectionalLight, DirectionalLightHelper, HemisphereLight, Scene} from 'three';
import {AbstractObject} from '../object/abstract-object';
import {PortalWorldObject} from '../object/portal-world-object';
import {Sky} from "three/examples/jsm/objects/Sky";

export class World extends AbstractObject<Scene> {
   protected readonly group = new Scene();
   private readonly objects = new Set<WorldObject>();
   protected readonly groupWithoutPortals = new Scene();
   private portals = new Map<string, PortalWorldObject>();

   constructor(protected readonly name: string) {
      super(name);

      const ambientLight = new HemisphereLight(0xfffefe, 0xfffefe, .3);
      this.add(ambientLight);

      const sky = new Sky();
      sky.scale.setScalar(1000);
      // this.add(sky);

      const sun = new DirectionalLight(0xfffefe, .6);
      sun.position.set(10, 40, 10);
      sun.target.position.set(0, 0, 0)
      sun.castShadow = true;
      sun.shadow.mapSize.width = 512 * 6;
      sun.shadow.mapSize.height = 512 * 6;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 100;
      sun.shadow.camera.top = 100;
      sun.shadow.camera.bottom = -100;
      sun.shadow.camera.left = 100;
      sun.shadow.camera.right = -100;
      sun.shadow.bias = -0.001;
      this.add(sun);
      this.add(new DirectionalLightHelper(sun, 3, 0xff0000))
   }

   getGroupWithoutPortals(): Scene {
      return this.groupWithoutPortals;
   }

   step(delta: number): void {
      for (const object of this.getObjects()) {
         object.step(delta);
      }
   }

   addObject(object: WorldObject): void {
      if (!this.objects.has(object)) {
         this.objects.add(object);
         if (!(object instanceof PortalWorldObject)) {
            this.groupWithoutPortals.add(object.getGroup());
         }
         this.add(object.getGroup());
      }
   }

   getObjects(): WorldObject[] {
      return Array.from(this.objects.values());
   }

   addPortal(portal: PortalWorldObject): void {
      this.portals.set(portal.getName(), portal);
      this.addObject(portal);
   }

   getPortals(): PortalWorldObject[] {
      return Array.from(this.portals.values());
   }

   getPortal(name: string): PortalWorldObject {
      return this.portals.get(name);
   }

   getObject(name: string): WorldObject | undefined {
      return this.getObjects()
         .filter(object => object.getName() === name)?.[0];
   }
}
