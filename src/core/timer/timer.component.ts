import {Singleton} from "typescript-ioc";
import {Subject} from "rxjs";
import {Clock} from "three";

@Singleton
export class TimerComponent {
   private readonly stepSubject = new Subject<number>();
   public readonly step$ = this.stepSubject.pipe();
   private readonly frame: number = 1000 / 60;
   private readonly clock = new Clock();
   private readonly bindStep: FrameRequestCallback;

   constructor() {
      this.bindStep = this.step.bind(this);
      this.step();
   }

   private step() {
      const delta = this.clock.getDelta() ?? this.frame;
      const deltaRatio = delta * 1000 / this.frame;
      this.stepSubject.next(deltaRatio);
      requestAnimationFrame(this.bindStep);
   }
}
