import {spawn, Worker} from "threads/dist";
import {CoreThread} from "../core/core-thread";
import "./main.scss";
import {Container, Inject, Singleton} from "typescript-ioc";
import {WorkerImplementation} from "threads/dist/types/master";
import {MainControllerComponent} from "./controller/main-controller.component";

@Singleton
class Main {
   private canvas: HTMLCanvasElement;
   private coreThread?: CoreThread;

   constructor(@Inject private controllerComponent: MainControllerComponent) {
      this.initCanvas();
      this.initCoreThread();
      this.initComponents();
      console.log("Main thread OK");
   }

   private async initThread<T>(worker: WorkerImplementation): Promise<[T, WorkerImplementation]> {
      const thread = await spawn<any>(worker) as unknown as T;
      return [thread, worker];
   }

   private initCanvas() {
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas);
   }

   private initCoreThread() {
      const offscreenCanvas = this.canvas.transferControlToOffscreen();
      offscreenCanvas.width = this.canvas.clientWidth;
      offscreenCanvas.height = this.canvas.clientHeight;
      this.initThread<CoreThread>(new Worker("../core/core-thread"))
         .then(([coreThread, coreWorker]) => {
            this.coreThread = coreThread;
            console.log("Core thread created");
            coreWorker.postMessage({canvas: offscreenCanvas}, [offscreenCanvas]);
         });
   }

   private initComponents() {
      this.controllerComponent.init(this.canvas);
      this.controllerComponent.mouseMove$.subscribe(event => this.coreThread?.mouseMove(event.x, event.y));
      this.controllerComponent.resize$.subscribe(() => this.coreThread?.setSize(window.innerWidth, window.innerHeight));
   }
}

Container.get(Main);


