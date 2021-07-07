import {Inject, Singleton} from "typescript-ioc";
import {PointerControllerComponent} from "../controller/pointer/pointer-controller.component";
import {filter, map} from "rxjs/operators";
import {CoreKeyboardControllerComponent} from "../controller/core-keyboard-controller.component";
import {EventStatus} from "../../common/event.model";
import {leftMouseKey, rightMouseKey} from "../../common/controller/controller.model";
import {PortalPlacingComponent} from "./portal-placing.component";

@Singleton
export class PortalPlacingManager {
   constructor(@Inject private readonly controller: PortalPlacingComponent,
               @Inject private readonly pointer: PointerControllerComponent,
               @Inject private readonly inputController: CoreKeyboardControllerComponent) {
      pointer.target$.subscribe(intersection => {
         if (intersection && intersection.object.name === "mesh_portalplace") {
            controller.setTarget(intersection);
         } else {
            controller.removeTarget();
         }
      })
      inputController.keys$.pipe(
         filter(event => event.status === EventStatus.OFF),
         filter(event => event.key === leftMouseKey || event.key === rightMouseKey),
         map(event => event.key),
      )
         .subscribe((key) => {
            if (key === leftMouseKey) {
               controller.placeLeftPortal();
            } else {
               controller.placeRightPortal();
            }
         })
   }
}
