import {expose} from "threads/worker";
import {Container, Inject, Singleton} from "typescript-ioc";
import {RendererComponent} from "./renderer/renderer.component";
import {RendererManager} from "./renderer/renderer.manager";
import {SceneManager} from "./scene/scene.manager";
import {CoreControllerComponent} from "./controller/core-controller.component";
import {CameraManager} from "./camera/camera.manager";
import {KeyEvent} from "../common/controller/controller.model";
import {TeleportComponent} from "./scene/teleport/teleport.component";
import {TimerManager} from "./timer/timer.manager";
import {EventStatus} from "../common/event.model";
import {MapComponent} from "./map/map.component";

@Singleton
export class CoreThread {
   constructor(@Inject private readonly rendererManager: RendererManager,
               @Inject private readonly renderer: RendererComponent,
               @Inject private readonly sceneManager: SceneManager,
               @Inject private readonly cameraManager: CameraManager,
               @Inject private readonly controller: CoreControllerComponent,
               @Inject private readonly teleport: TeleportComponent,
               @Inject private readonly timer: TimerManager,
               @Inject private readonly mapComponent: MapComponent) {
      this.waitForCanvas();
   }

   private waitForCanvas() {
      onmessage = (event) => {
         const canvas: HTMLCanvasElement = event?.data?.canvas;
         if (canvas) {
            this.init(canvas);
         }
      };
   }

   setSize(width: number, height: number) {
      this.controller.resize(width, height);
   }

   setPointerLock(status: EventStatus) {
      this.controller.setPointerLock(status);
   }

   mouseMove(x: number, y: number) {
      this.controller.move(x, y);
   }

   keyEvent(keyEvent: KeyEvent) {
      this.controller.keyEvent(keyEvent);
   }

   private init(canvas: HTMLCanvasElement) {
      this.renderer.init(canvas);
      this.setSize(canvas.width, canvas.height);
      console.log("Core thread OK");
      this.mapComponent.load();
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
