import {Singleton} from "typescript-ioc";
import {Intersection, Object3D, Quaternion, Raycaster, Vector3} from "three";
import {quaternionToVector} from "./pointer-controller.utils";
import {Subject} from "rxjs";


@Singleton
export class PointerControllerComponent {
   private readonly raycaster = new Raycaster();
   private readonly rotation = new Vector3();

   private readonly targetSubject = new Subject<Intersection | null>();
   readonly target$ = this.targetSubject.pipe();

   private previousTarget?: Object3D = null;

   update(position: Vector3, quaternion: Quaternion, objects: Object3D[]): void {
      this.raycaster.set(position, quaternionToVector(quaternion, this.rotation));
      const intersections = this.raycaster.intersectObjects(objects);
      const target = intersections?.[0]?.object;
      if (target !== null || this.previousTarget !== null) {
         this.previousTarget = target;
         this.targetSubject.next(intersections[0]);
      }
   }
}
