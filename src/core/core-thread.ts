import {expose} from "threads/worker";
import {Container, Inject, Singleton} from "typescript-ioc";
import {RendererComponent} from "./renderer/renderer.component";
import {RendererManager} from "./renderer/renderer.manager";
import {WorldManager} from "./world/world.manager";
import {CoreControllerComponent} from "./controller/core-controller.component";
import {CameraManager} from "./camera/camera.manager";
import {KeyEvent} from "../common/controller/controller.model";
import {TimerManager} from "./timer/timer.manager";
import {EventStatus} from "../common/event.model";
import {MapComponent} from "./map/map.component";
import {TeleportManager} from "./teleport/teleport.manager";
import {PhysicsManager} from "./physics/physics.manager";

@Singleton
export class CoreThread {
   constructor(
      @Inject private readonly renderer: RendererManager,
      @Inject private readonly rendererComponent: RendererComponent,
      @Inject private readonly world: WorldManager,
      @Inject private readonly camera: CameraManager,
      @Inject private readonly controller: CoreControllerComponent,
      @Inject private readonly teleport: TeleportManager,
      @Inject private readonly timer: TimerManager,
      @Inject private readonly physics: PhysicsManager,
      @Inject private readonly map: MapComponent
   ) {
      this.waitForCanvas();
   }

   private waitForCanvas(): void {
      onmessage = (event) => {
         const canvas: HTMLCanvasElement = event?.data?.canvas;
         if (canvas) {
            this.init(canvas);
         }
      };
   }

   setSize(width: number, height: number): void {
      this.controller.resize(width, height);
   }

   setPointerLock(status: EventStatus): void {
      this.controller.setPointerLock(status);
   }

   mouseMove(x: number, y: number): void {
      this.controller.move(x, y);
   }

   keyEvent(keyEvent: KeyEvent): void {
      this.controller.keyEvent(keyEvent);
   }

   private init(canvas: HTMLCanvasElement): void {
      this.rendererComponent.init(canvas);
      this.setSize(canvas.width, canvas.height);
      console.log("Core thread OK");
      this.map.load();
   }
}

const coreThread = Container.get(CoreThread);

// TODO: Auto spread to exposed

expose({
   setSize: coreThread.setSize.bind(coreThread),
   setPointerLock: coreThread.setPointerLock.bind(coreThread),
   mouseMove: coreThread.mouseMove.bind(coreThread),
   keyEvent: coreThread.keyEvent.bind(coreThread),
});
