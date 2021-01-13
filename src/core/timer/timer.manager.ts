import {Inject, Singleton} from "typescript-ioc";
import {TimerComponent} from "./timer.component";
import {CoreControllerComponent} from "../controller/core-controller.component";
import {MapComponent} from "../map/map.component";

@Singleton
export class TimerManager {
   private mapLoaded = false;
   private pointerLocked = false;

   constructor(
      @Inject private readonly component: TimerComponent,
      @Inject private readonly controller: CoreControllerComponent,
      @Inject private readonly map: MapComponent
   ) {
      map.mapLoaded$.subscribe(() => {
         this.mapLoaded = true;
         this.checkStart();
      });
      controller.pointerLock$.subscribe((status) => {
         this.pointerLocked = !!status;
         this.checkStart();
      });
   }

   private checkStart(): void {
      if (this.mapLoaded && this.pointerLocked) this.component.enable();
      else this.component.disable();
   }
}
