import {Inject, Singleton} from "typescript-ioc";
import {TeleportComponent} from "../teleport/teleport.component";
import {WorldComponent} from "../world/world.component";
import {PortalWorldObject} from "../object/portal-world-object";

@Singleton
export class GameManager {
   constructor(@Inject private readonly teleport: TeleportComponent,
               @Inject private readonly worlds: WorldComponent) {
      this.initRoomsARoomsA1PortalTargetSwitchingWhenUsed();
   }

   private initRoomsARoomsA1PortalTargetSwitchingWhenUsed(): void {
      this.teleport.subscribeTargetPortal('roomsA', 'roomsA1')
         .subscribe(portalRoomsA1 => this.switchPortalRoomsARoomsA1TargetToRotBBackRBB1(portalRoomsA1));
      this.teleport.subscribeSourcePortal('roomsA', 'roomsA1')
         .subscribe(portalRoomsA1 => this.switchPortalRoomsARoomsA1TargetBackToRotB2RB2(portalRoomsA1));
   }

   private switchPortalRoomsARoomsA1TargetToRotBBackRBB1(portalRoomsA1: PortalWorldObject): void {
      const worldRotBBack = this.worlds.getWorld('rotBBack');
      const portalRBB1 = worldRotBBack.getPortal('rBB1');
      portalRoomsA1.setDestination(portalRBB1);
      portalRBB1.setDestination(portalRoomsA1);
   }

   private switchPortalRoomsARoomsA1TargetBackToRotB2RB2(portalRoomsA1: PortalWorldObject): void {
      const worldRotBBack = this.worlds.getWorld('rotB');
      const portalRB2 = worldRotBBack.getPortal('rB2');
      portalRoomsA1.getDestination().removeDestination();
      portalRoomsA1.setDestination(portalRB2);
      portalRB2.setDestination(portalRoomsA1);
   }
}
