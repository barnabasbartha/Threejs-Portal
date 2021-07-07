import {Inject, Singleton} from 'typescript-ioc';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {WorldComponent} from '../world/world.component';
import {World} from '../world/world';
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
import {WorldObject} from '../object/world-object';
import {Subject} from 'rxjs';
import {PortalWorldObject} from '../object/portal-world-object';
import {Config} from '../../config/config';

type ObjectType = 'world' | 'mesh' | 'portal' | 'raw';

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
      polygonOffset: true,
      polygonOffsetUnits: -1,
      polygonOffsetFactor: -1,
   });

   constructor(@Inject private readonly worldComponent: WorldComponent) {
   }

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
         () => {
         },
         () => {
            console.error('Error during loading model', url);
         },
      );
   }

   private parseMap(scene: Group): [World[], World] {
      const worlds: World[] = [];
      let mainWorld: World = null;
      const objects = this.parseObjectParameters(scene.children);

      this.filterObjectsByType(objects, 'world').forEach(([mapObject, parameters]) => {
         const world = new World(parameters.world);
         world.addObject(this.createWorldObject(mapObject as Mesh));

         const objectsInWorld = this.parseObjectParameters(mapObject.children);

         this.filterObjectsByType(objectsInWorld, 'portal').forEach(([portalObject, parameters]) => {
            this.addPortal(world, mapObject, portalObject, parameters as PortalObjectParameters);
         });

         this.filterObjectsByType(objectsInWorld, 'mesh').forEach(([meshObject]) => {
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

   private filterObjectsByType(objects: [Object3D, ObjectParameters][], type: ObjectType): [Object3D, ObjectParameters][] {
      return objects.filter(([_, parameters]) => parameters.type === type);
   }

   private parseObjectParameters(objects: Object3D[]): [Object3D, ObjectParameters][] {
      return objects.map((object) => {
         const parametersString = object.name.split('_');
         const parameters: ObjectParameters = {
            type: parametersString[0] as ObjectType,
            world: parametersString[1],
            name: parametersString[2],
         };
         if (parameters.type === 'portal') {
            (parameters as PortalObjectParameters).targetWorld = parametersString[3];
            (parameters as PortalObjectParameters).target = parametersString[4];
         }
         return [object, parameters];
      });
   }

   private createWorldObject(mesh: Mesh): WorldObject {
      const worldObject = new WorldObject(mesh.name);
      worldObject.addPhysicalObject(mesh);
      worldObject.add(this.createMeshOutline(mesh));
      mesh.material = MapComponent.MESH_MATERIAL;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return worldObject;
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
         new Mesh(new PlaneBufferGeometry()),
         world.getName(),
         parameters.name,
         parameters.targetWorld,
         parameters.target,
         true,
      );
      portal.getGroup().position.copy(portalObject.position);
      portal.getGroup().quaternion.copy(portalObject.quaternion);
      portal.getGroup().scale.copy(portalObject.scale).multiplyScalar(2);
      world.addPortal(portal);
   }
}
