import {Inject, Singleton} from "typescript-ioc";
import {PortalPlacingComponent} from "./portal-placing.component";
import {Intersection, Mesh} from "three";
import {WorldComponent} from "../world/world.component";
import {PortalWorldObject} from "../object/portal-world-object";
import {MapComponent} from "../map/map.component";
import {createPortalMesh} from "./portal-world-placing.utils";

@Singleton
export class PortalWorldPlacingManager {
   private leftPortal?: PortalWorldObject;
   private leftPortalMesh?: Mesh;
   private rightPortal?: PortalWorldObject;
   private rightPortalMesh?: Mesh;

   constructor(@Inject private readonly portalPlacing: PortalPlacingComponent,
               @Inject private readonly worlds: WorldComponent,
               @Inject private readonly map: MapComponent) {
      map.mapLoaded$.subscribe(() => {
         const mainWorld = worlds.getWorld('main');
         this.leftPortal = mainWorld.getPortal('leftportal');
         this.rightPortal = mainWorld.getPortal('rightportal');

         this.leftPortalMesh = createPortalMesh(0xff0000);
         this.leftPortalMesh.position.copy(this.leftPortal.getGroup().position);
         this.rightPortalMesh = createPortalMesh(0x0000ff);
         this.rightPortalMesh.position.copy(this.rightPortal.getGroup().position);

         mainWorld.add(this.leftPortalMesh);
         mainWorld.add(this.rightPortalMesh);
      });
      portalPlacing.leftPortal$.subscribe(target => this.placePortal(this.leftPortal, this.leftPortalMesh, target));
      portalPlacing.rightPortal$.subscribe(target => this.placePortal(this.rightPortal, this.rightPortalMesh, target));
   }

   private placePortal(portal: PortalWorldObject, mesh: Mesh, target: Intersection): void {
      portal.getGroup().position.copy(target.point);
      portal.getGroup().position.z += .1;
      mesh.position.copy(portal.getGroup().position);
   }
}
