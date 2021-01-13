import {Singleton} from "typescript-ioc";
import {KeyEvent} from "../../common/controller/controller.model";
import {EventStatus, IVector2} from "../../common/event.model";
import {fromEvent, merge, Observable, Subject} from "rxjs";
import {distinctUntilChanged, map, tap} from "rxjs/operators";

@Singleton
export class MainControllerComponent {
   private readonly resizeObject: IVector2 = {x: 0, y: 0};
   readonly resize$: Observable<IVector2>;
   readonly key$: Observable<KeyEvent>;

   private readonly mouseMoveObject: IVector2 = {x: 0, y: 0};
   private readonly mouseMoveSubject = new Subject<IVector2>();
   readonly mouseMove$ = this.mouseMoveSubject.pipe();

   private readonly pointerLockSubject = new Subject<EventStatus>();
   readonly pointerLock$ = this.pointerLockSubject.pipe();

   constructor() {
      this.resize$ = fromEvent(window, "resize").pipe(
         tap(() => {
            this.resizeObject.x = window.innerWidth;
            this.resizeObject.y = window.innerHeight;
         }),
         map(() => this.resizeObject)
      );

      this.key$ = merge(
         (fromEvent(window, "keydown") as Observable<KeyboardEvent>).pipe(
            map((event) => ({
               status: EventStatus.ON,
               key: event.code,
            }))
         ),
         (fromEvent(window, "keyup") as Observable<KeyboardEvent>).pipe(
            map((event) => ({
               status: EventStatus.OFF,
               key: event.code,
            }))
         )
      ).pipe(
         distinctUntilChanged((prev, curr) => {
            return prev.key === curr.key && prev.status === curr.status;
         })
      );
   }

   init(canvas: HTMLElement, guiLayer: HTMLDivElement): void {
      (fromEvent(canvas, "mousemove") as Observable<MouseEvent>)
         .pipe(
            tap((event) => {
               this.mouseMoveObject.x = event.movementX;
               this.mouseMoveObject.y = event.movementY;
            }),
            map(() => this.mouseMoveObject)
         )
         .subscribe((object) => this.mouseMoveSubject.next(object));

      fromEvent(document, "pointerlockchange")
         .pipe(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            map(
               () =>
                  document.pointerLockElement === canvas ||
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  document.mozPointerLockElement === canvas
            ),
            map((locked) => (locked ? EventStatus.ON : EventStatus.OFF))
         )
         .subscribe((status) => this.pointerLockSubject.next(status));

      fromEvent(guiLayer, "mousedown").subscribe(() =>
         canvas.requestPointerLock()
      );
   }
}
