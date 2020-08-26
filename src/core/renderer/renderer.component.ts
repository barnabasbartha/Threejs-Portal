import {Singleton} from "typescript-ioc";
import {Camera, Group, LinearEncoding, NoToneMapping, Scene, WebGLRenderer} from "three";
import {Subject} from "rxjs";

@Singleton
export class RendererComponent {
   private readonly initSubject = new Subject<void>();
   public readonly init$ = this.initSubject.pipe();

   private renderer: WebGLRenderer;

   init(canvas: HTMLCanvasElement) {
      // @ts-ignore
      canvas.style = {width: canvas.width, height: canvas.height};
      this.renderer = new WebGLRenderer({
         canvas,
         context: canvas.getContext('webgl2') as WebGLRenderingContext,
         powerPreference: 'high-performance',
         antialias: false,
         stencil: true,
         depth: true,
         alpha: true,
         logarithmicDepthBuffer: false
      });
      this.renderer.setClearColor(0x000000);
      this.renderer.setPixelRatio(.8);
      this.renderer.shadowMap.enabled = false;
      this.renderer.outputEncoding = LinearEncoding; //sRGBEncoding;
      this.renderer.toneMapping = NoToneMapping;
      this.renderer.toneMappingExposure = 1;
      this.initSubject.next();
   }

   setSize(width: number, height: number) {
      this.renderer?.setSize(width, height);
   }

   render(scene: Scene, camera: Camera) {
      this.renderer?.render(scene, camera);
   }
}
