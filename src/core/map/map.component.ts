import { Inject, Singleton } from 'typescript-ioc';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { WorldComponent } from '../world/world.component';
import { World } from '../world/world';
import {
   DoubleSide,
   EdgesGeometry,
   Group,
   LineBasicMaterial,
   LineSegments,
   Mesh,
   MeshBasicMaterial,
   Object3D,
   PlaneBufferGeometry,
} from 'three';
import { WorldObject } from '../object/world-object';
import { Subject } from 'rxjs';
import { PortalWorldObject } from '../object/portal-world-object';
import { Config } from '../../config/config';

type ObjectType = 'world' | 'mesh' | 'portal';

interface ObjectParameters {
   type: ObjectType;
   world: string;
   name: string;
}

interface PortalObjectParameters extends ObjectParameters {
   targetWorld: string;
   target: string;
}

@Singleton
export class MapComponent {
   private readonly mapLoadedSubject = new Subject<void>();
   readonly mapLoaded$ = this.mapLoadedSubject.pipe();
   private static MESH_MATERIAL = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
   });
   private static MESH_LINE_MATERIAL = new LineBasicMaterial({
      color: 0x000000,
      linewidth: 3,
      polygonOffset: true,
      polygonOffsetUnits: -1,
      polygonOffsetFactor: -1,
   });

   constructor(@Inject private readonly worldComponent: WorldComponent) {}

   load(): void {
      const url = Config.ASSET_DIR + 'map04.glb';
      new GLTFLoader().load(
         url,
         (gltf: GLTF) => {
            console.log(url, gltf.scene.clone());

            const [worlds, mainWorld] = this.parseMap(gltf.scene);
            worlds.forEach((world) => this.worldComponent.add(world));
            this.worldComponent.setCurrentWorld(mainWorld);

            this.mapLoadedSubject.next();
         },
         // eslint-disable-next-line  @typescript-eslint/no-empty-function
         () => {},
         () => {
            console.error('Error during loading model', url);
         },
      );
   }

   private parseMap(scene: Group): [World[], World] {
      const worlds: World[] = [];
      let mainWorld: World = null;
      this.getObjects(scene, 'world').forEach(([mapObject, parameters]) => {
         const world = new World(parameters.world);
         world.addObject(this.createWorldObject(mapObject as Mesh));

         this.getObjects(mapObject, 'portal').forEach(([portalObject, parameters]) => {
            this.addPortal(world, mapObject, portalObject, parameters as PortalObjectParameters);
         });

         this.getObjects(mapObject, 'mesh').forEach(([meshObject]) => {
            world.addObject(this.createWorldObject(meshObject as Mesh));
         });

         worlds.push(world);
         if (parameters.world === 'main') {
            mainWorld = world;
         }
      });
      if (!mainWorld) {
         throw new Error('Map does not have main world.');
      }
      return [worlds, mainWorld];
   }

   private getObjects(parent: Object3D, type: ObjectType): [Object3D, ObjectParameters][] {
      return this.getObjectsParameters(parent.children).filter(
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         ([_, parameters]) => parameters.type === type,
      );
   }

   private getObjectsParameters(objects: Object3D[]): [Object3D, ObjectParameters][] {
      return objects.map((object) => {
         const parametersString = object.name.split('_');
         const parameters: ObjectParameters = {
            type: parametersString[0] as ObjectType,
            world: parametersString[1],
            name: parametersString[2],
         };
         if (parametersString[3]) (parameters as PortalObjectParameters).targetWorld = parametersString[3];
         if (parametersString[4]) (parameters as PortalObjectParameters).target = parametersString[4];
         return [object, parameters];
      });
   }

   private createWorldObject(mesh: Mesh): WorldObject {
      const worldObject = new WorldObject();
      this.handleMeshMaterial(mesh);
      worldObject.addPhysicalObject(mesh);
      worldObject.add(this.createMeshOutline(mesh));
      return worldObject;
   }

   private handleMeshMaterial(mesh: Mesh): void {
      mesh.material = MapComponent.MESH_MATERIAL;
   }

   private createMeshOutline(mesh: Mesh): Object3D {
      return new LineSegments(new EdgesGeometry(mesh.geometry), MapComponent.MESH_LINE_MATERIAL);
   }

   private addPortal(
      world: World,
      mapObject: Object3D,
      portalObject: Object3D,
      parameters: PortalObjectParameters,
   ): void {
      mapObject.remove(portalObject);

      const portal = new PortalWorldObject(
         new Mesh(new PlaneBufferGeometry(2, 2)),
         parameters.name,
         parameters.targetWorld,
         parameters.target,
         true,
      );
      portal.getGroup().position.copy(portalObject.position);
      portal.getGroup().quaternion.copy(portalObject.quaternion);
      portal.getGroup().scale.copy(portalObject.scale);
      world.addPortal(portal);
   }
}
