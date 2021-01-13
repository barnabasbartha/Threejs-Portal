import { PortalWorldObject } from '../object/portal-world-object';
import { Collision } from '../physics/physics.model';

export interface TeleportContext {
   sourcePortal: PortalWorldObject;
   collision: Collision;
}
