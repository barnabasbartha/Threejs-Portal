import {spawn, Worker} from 'threads/dist';
import {CoreThread} from '../core/core-thread';
import './main.css';
import {Container, Inject, Singleton} from 'typescript-ioc';
import {WorkerImplementation} from 'threads/dist/types/master';
import {MainControllerComponent} from './controller/main-controller.component';
import {GuiManager} from './gui/gui.manager';
import {GuiComponent} from './gui/gui.component';

@Singleton
class Main {
   private canvas: HTMLCanvasElement;
   private coreThread?: CoreThread;

   constructor(
      @Inject private readonly controller: MainControllerComponent,
      @Inject private readonly guiManager: GuiManager,
      @Inject private readonly guiComponent: GuiComponent,
   ) {
      this.initCanvas();
      this.initCoreThread();
      console.log('Main thread OK');
   }

   private async initThread<T>(worker: WorkerImplementation): Promise<[T, WorkerImplementation]> {
      // @ts-ignore
      const thread = ((await spawn<unknown>(worker)) as unknown) as T;
      return [thread, worker];
   }

   private initCanvas(): void {
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas);
   }

   private initCoreThread(): void {
      const offscreenCanvas = this.canvas.transferControlToOffscreen();
      offscreenCanvas.width = this.canvas.clientWidth;
      offscreenCanvas.height = this.canvas.clientHeight;
      this.initThread<CoreThread>(new Worker('../core/core-thread'))
         .then(([coreThread, coreWorker]) => {
            this.coreThread = coreThread;
            console.log('Core thread created');
            this.initComponents();
            coreWorker.postMessage({canvas: offscreenCanvas}, [offscreenCanvas]);
         });
   }

   private initComponents(): void {
      this.controller.init(this.canvas, this.guiComponent.getLayer());
      this.controller.mouseMove$.subscribe((event) => this.coreThread?.mouseMove(event.x, event.y));
      this.controller.resize$.subscribe(() => this.coreThread?.setSize(window.innerWidth, window.innerHeight));
      this.controller.pointerLock$.subscribe((status) => this.coreThread?.setPointerLock(status));
      this.controller.key$.subscribe((keyEvent) => this.coreThread?.keyEvent(keyEvent));
   }
}

Container.get(Main);
