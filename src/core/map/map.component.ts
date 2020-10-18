import {Inject, Singleton} from "typescript-ioc";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {SceneComponent} from "../scene/scene.component";
import {World} from "../scene/instance/world";
import {
   BackSide,
   EdgesGeometry,
   LineBasicMaterial,
   LineSegments,
   Mesh,
   MeshBasicMaterial,
   Object3D,
   PlaneBufferGeometry
} from "three";
import {WorldObject} from "../object/world-object";
import {Subject} from "rxjs";
import {PortalWorldObject} from "../object/portal-world-object";

interface ObjectParameters {
   type: string;
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
   public readonly mapLoaded$ = this.mapLoadedSubject.pipe();

   constructor(@Inject private readonly scene: SceneComponent) {
   }

   load() {
      const url = "../asset/map04.glb";
      new GLTFLoader().load(url,
         (gltf: GLTF) => {
            console.log(url, gltf.scene.clone());

            const worlds = new Map<string, World>();

            this.getObjects(gltf.scene.children)
               .filter(([_, parameters]) => parameters.type === 'mesh')
               .forEach(([mapObject, parameters]) => {
                  const world = new World(parameters.world);
                  worlds.set(parameters.world, world);


                  const worldObject = new WorldObject();
                  worldObject.add(mapObject);
                  const mapObjectMesh = mapObject as Mesh;
                  mapObjectMesh.material = new MeshBasicMaterial({
                     color: 0xffffff,
                     side: BackSide,
                     polygonOffset: true,
                     polygonOffsetFactor: 1,
                     polygonOffsetUnits: 1
                  });
                  world.addObject(worldObject);
                  //world.add(new PointLight(0xff0000, 1))

                  const edges = new LineSegments(new EdgesGeometry(mapObjectMesh.geometry), new LineBasicMaterial({
                     color: 0x000000,
                     linewidth: 3,
                     polygonOffset: true,
                     polygonOffsetUnits: -1,
                     polygonOffsetFactor: -1
                  }));
                  worldObject.add(edges);

                  this.getObjects([...mapObject.children])
                     .filter(([_, parameters]) => parameters.type === 'portal')
                     .forEach(([portalObject, parameters]) => {
                        mapObject.remove(portalObject);
                        const world = worlds.get(parameters.world);
                        const portalParameters = parameters as PortalObjectParameters;

                        const portal = new PortalWorldObject(
                           new Mesh(new PlaneBufferGeometry(2, 2)),
                           parameters.name,
                           portalParameters.targetWorld,
                           portalParameters.target,
                           true,
                        );
                        portal.getGroup().position.copy(portalObject.position);
                        portal.getGroup().quaternion.copy(portalObject.quaternion);
                        portal.getGroup().scale.copy(portalObject.scale);
                        world.addPortal(portal);
                     });
               });

            const worldsArray = Array.from(worlds.values());


            worldsArray.forEach(world => this.scene.add(world));
            this.scene.setCurrentWorld(worldsArray.find(world => world.getName() === 'main'));

            this.mapLoadedSubject.next();
         },
         () => {
         },
         (e) => {
            console.error('Error during loading model', url);
         },
      );
   }

   private getObjects(objects: Object3D[]): [Object3D, ObjectParameters][] {
      return [...objects].map(object => {
         const parametersString = object.name.split('_');
         const parameters: ObjectParameters = {
            type: parametersString[0],
            world: parametersString[1],
            name: parametersString[2],
         };
         if (parametersString[3]) (parameters as PortalObjectParameters).targetWorld = parametersString[3];
         if (parametersString[4]) (parameters as PortalObjectParameters).target = parametersString[4];
         return [object, parameters];
      });
   }
}
