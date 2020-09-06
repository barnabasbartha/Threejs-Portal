import {PortalWorldObject} from "../../object/portal-world-object";
import {Collision} from "../../physics/physics.model";

export interface Teleport {
   sourcePortal: PortalWorldObject;
   collision: Collision;
}
