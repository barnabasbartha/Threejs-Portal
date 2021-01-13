export class TeleportUtils {
   private static readonly EPS = 0.000001;

   static getBuggyRotationConstant(sourceY: number, targetY: number): number {
      const sBuggy = this.isRotationBuggy(sourceY);
      const tBuggy = this.isRotationBuggy(targetY);
      const isBuggy = (sBuggy || tBuggy) && !(sBuggy && tBuggy);
      return !isBuggy ? Math.PI : 0;
   }

   private static isRotationBuggy(y: number): boolean {
      return Math.abs(y) < TeleportUtils.EPS && y !== 0;
   }
}
