import {Singleton} from "typescript-ioc";
import {Intersection} from "three";
import {Subject} from "rxjs";

@Singleton
export class PortalPlacingComponent {
   private readonly leftPortalSubject = new Subject<Intersection>();
   readonly leftPortal$ = this.leftPortalSubject.pipe();
   private readonly rightPortalSubject = new Subject<Intersection>();
   readonly rightPortal$ = this.rightPortalSubject.pipe();

   private target?: Intersection;

   setTarget(target: Intersection): void {
      this.target = target;
   }

   removeTarget(): void {
      this.target = null;
   }

   placeLeftPortal(): void {
      if (this.target) {
         this.leftPortalSubject.next(this.target);
      }
   }

   placeRightPortal(): void {
      if (this.target) {
         this.rightPortalSubject.next(this.target);
      }
   }
}
