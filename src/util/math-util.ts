export class MathUtil {
   static minMax(value: number, min: number, max: number): number {
      return Math.min(max, Math.max(min, value));
   }
}
