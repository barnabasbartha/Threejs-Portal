import {Group} from "three";
import {AbstractObject} from "./abstract-object";

export abstract class WorldObject extends AbstractObject<Group>{
   protected readonly group = new Group();
}
