import {Inject, Singleton} from 'typescript-ioc';
import {TeleportComponent} from './teleport.component';
import {MovementComponent} from '../controller/movement-component';
import {filter} from "rxjs/operators";

@Singleton
export class TeleportManager {
   constructor(
      @Inject private readonly component: TeleportComponent,
      @Inject private readonly movement: MovementComponent,
   ) {
      movement.teleport$
         .pipe(filter(context => !!context.sourcePortal.getDestinationWorldName()))
         .subscribe(teleport => component.teleport(teleport));
   }
}
