import {Inject, Singleton} from 'typescript-ioc';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {WorldComponent} from '../world/world.component';
import {World} from '../world/world';
import {DoubleSide, Group, Material, Mesh, MeshStandardMaterial, Object3D, PlaneBufferGeometry,} from 'three';
import {WorldObject} from '../object/world-object';
import {Subject} from 'rxjs';
import {PortalWorldObject} from '../object/portal-world-object';
import {Config} from '../../config/config';
import {LightColor} from "../light/light.model";
import {createLight} from "../light/light.utils";

type ObjectType = 'world' | 'mesh' | 'portal' | 'light' | 'raw';

interface ObjectParameters {
   type: ObjectType;
   world: string;
   name: string;
}

interface LightObjectParamteres extends ObjectParameters {
   color: LightColor;
}

interface PortalObjectParameters extends LightObjectParamteres {
   targetWorld: string;
   target: string;
}

@Singleton
export class MapComponent {
   private readonly mapLoadedSubject = new Subject<void>();
   readonly mapLoaded$ = this.mapLoadedSubject.pipe();
   private static MESH_MATERIAL = new MeshStandardMaterial({
      side: DoubleSide,
      metalness: 0,
      roughness: 1,
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

         this.filterObjectsByType(objectsInWorld, 'raw').forEach(([meshObject]) => {
            world.addObject(this.createRawWorldObject(meshObject as Mesh));
         });

         this.filterObjectsByType(objectsInWorld, 'mesh').forEach(([meshObject]) => {
            world.addObject(this.createWorldObject(meshObject as Mesh));
         });

         this.filterObjectsByType(objectsInWorld, 'light').forEach(([meshObject, parameters]) => {
            mapObject.remove(meshObject);
            world.addObject(this.createLight(meshObject as Mesh, parameters as LightObjectParamteres));
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
            (parameters as PortalObjectParameters).color = parametersString[5] ? parametersString[5] as LightColor : LightColor.BLUE;
         } else if (parameters.type === 'light') {
            (parameters as PortalObjectParameters).name = parametersString[1];
            (parameters as PortalObjectParameters).color = parametersString[2] as LightColor;
         }
         return [object, parameters];
      });
   }

   private createRawWorldObject(mesh: Mesh): WorldObject {
      const worldObject = new WorldObject();
      worldObject.addPhysicalObject(mesh);
      const material = (mesh.material as Material);
      material.polygonOffset = true;
      material.polygonOffsetFactor = -1;
      material.polygonOffsetUnits = -1;
      material.needsUpdate = true;
      return worldObject;
   }

   private createWorldObject(mesh: Mesh): WorldObject {
      const worldObject = this.createRawWorldObject(mesh);
      this.handleMeshMaterial(mesh);
      return worldObject;
   }

   private createLight(mesh: Mesh, parameters: LightObjectParamteres): WorldObject {
      const worldObject = new WorldObject();
      worldObject.add(createLight(parameters.color));
      worldObject.getGroup().position.copy(mesh.position);
      return worldObject;
   }

   private handleMeshMaterial(mesh: Mesh): void {
      mesh.material = MapComponent.MESH_MATERIAL;
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
         world.getName(),
         parameters.name,
         parameters.targetWorld,
         parameters.target,
         true,
         parameters.color,
      );
      portal.getGroup().position.copy(portalObject.position);
      portal.getGroup().quaternion.copy(portalObject.quaternion);
      portal.getGroup().scale.copy(portalObject.scale);
      world.addPortal(portal);
   }
}
