import {Euler, Group, Matrix4, Object3D, Quaternion, Vector3} from 'three';
import {AbstractObject} from './abstract-object';

export class WorldObject extends AbstractObject<Group> {
   protected readonly group = new Group();
   private readonly physicalObjects: Object3D[] = [];
   private readonly tmpVector = new Vector3();
   private readonly tmpEuler = new Euler();
   private readonly tmpQuaternion = new Quaternion();
   private invisible = false;

   constructor(protected name: string) {
      super(name);
   }

   getMatrix(): Matrix4 {
      this.group.updateMatrixWorld(true);
      return this.group.matrixWorld;
   }

   getAbsolutePosition(): Vector3 {
      this.group.getWorldPosition(this.tmpVector);
      return this.tmpVector;
   }

   getAbsoluteRotation(): Euler {
      return this.tmpEuler.setFromQuaternion(this.getAbsoluteQuaternion());
   }

   getAbsoluteQuaternion(): Quaternion {
      this.group.getWorldQuaternion(this.tmpQuaternion);
      return this.tmpQuaternion;
   }

   addPhysicalObject(object: Object3D): void {
      this.add(object);
      this.physicalObjects.push(object);
   }

   getPhysicalObjects(): Object3D[] {
      return this.physicalObjects;
   }

   hide(): void {
      this.group.visible = false;
   }

   show(): void {
      this.group.visible = true;
   }

   makeInvisible(): void {
      this.invisible = true;
   }

   makeVisible(): void {
      this.invisible = false;
   }

   isVisible(): boolean {
      return this.group.visible && !this.invisible;
   }

   isInvisible(): boolean {
      return this.invisible;
   }
}
