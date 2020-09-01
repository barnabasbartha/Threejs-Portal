import {Singleton} from "typescript-ioc";
import {Camera, LinearEncoding, Matrix4, NoToneMapping, Scene, WebGLRenderer} from "three";
import {Subject} from "rxjs";
import {PortalWorldObject} from "../object/portal-world-object";
import {World} from "../scene/instance/world";

@Singleton
export class RendererComponent {
   private readonly initSubject = new Subject<void>();
   public readonly init$ = this.initSubject.pipe();

   private renderer: WebGLRenderer;
   private stencilScene = new Scene();
   private context: WebGLRenderingContext;

   init(canvas: HTMLCanvasElement) {
      // @ts-ignore
      canvas['style'] = {width: canvas.width, height: canvas.height};
      this.renderer = new WebGLRenderer({
         canvas,
         context: canvas.getContext('webgl2') as WebGLRenderingContext,
         powerPreference: 'high-performance',
         stencil: true,
         depth: true
      });
      this.renderer.autoClear = false;
      this.renderer.setPixelRatio(.8);
      this.renderer.shadowMap.enabled = false;
      this.renderer.outputEncoding = LinearEncoding; //sRGBEncoding;
      this.renderer.toneMapping = NoToneMapping;
      this.renderer.toneMappingExposure = 1;
      this.context = this.renderer.getContext();
      this.initSubject.next();
   }

   setSize(width: number, height: number) {
      this.renderer?.setSize(width, height);
   }

   private readonly cameraMatrixWorld = new Matrix4();
   private readonly cameraProjectionMatrix = new Matrix4();

   render(worlds: Map<string, World>, world: World, camera: Camera) {
      if (!this.renderer) {
         return;
      }
      const scene = world.getGroup();
      const portalsInScene = world.getPortals();
      const gl = this.context;

      // save camera matrices because they will be modified when rending a view through a portal
      camera.updateMatrixWorld();
      this.cameraMatrixWorld.copy(camera.matrixWorld);
      this.cameraProjectionMatrix.copy(camera.projectionMatrix);

      // full clear (color, depth and stencil)
      this.renderer.clear(true, true, true);
      // enable stencil test
      gl.enable(gl.STENCIL_TEST);
      // disable stencil mask
      gl.stencilMask(0xFF);

      portalsInScene.forEach(portal => {
         // disable color + depth
         // only the stencil buffer will be drawn into
         gl.colorMask(false, false, false, false);
         gl.depthMask(false);

         // the stencil test will always fail (this is cheaper to compute)
         gl.stencilFunc(gl.NEVER, 1, 0xFF);
         // fragments where the portal is drawn will have a stencil value of 1
         // other fragments will retain a stencil value of 0
         gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);

         // render the portal shape using the settings above
         // set the portal as the only child of the stencil scene
         this.stencilScene.children = [portal.getGroup()];
         this.renderer.render(this.stencilScene, camera);

         // enable color + depth
         gl.colorMask(true, true, true, true);
         gl.depthMask(true);

         // fragments with a stencil value of 1 will be rendered
         gl.stencilFunc(gl.EQUAL, 1, 0xff);
         // stencil buffer is not changed
         gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

         // compute the view through the portal
         camera.matrixAutoUpdate = false;
         camera.matrixWorld.copy(this.computePortalViewMatrix(portal, camera));
         camera.matrixWorldInverse.getInverse(camera.matrixWorld);

         // render the view through the portal
         const destinationScene = worlds.get(portal.getDestinationSceneName()).getGroup();
         this.renderer.render(destinationScene, camera);

         // clear the stencil buffer for the next portal
         this.renderer.clear(false, false, true);

         // restore original camera matrices for the next portal
         camera.matrixAutoUpdate = true;
         camera.matrixWorld.copy(this.cameraMatrixWorld);
      });

      // after all portals have been drawn, we can disable the stencil test
      gl.disable(gl.STENCIL_TEST);

      // clear the depth buffer to remove the portal views' depth from the current scene
      this.renderer.clear(false, true, false);

      // all the current scene portals will be drawn this time
      this.stencilScene.children = portalsInScene.map(portal => portal.getGroup());

      // disable color
      gl.colorMask(false, false, false, false);
      // draw the portal shapes into the depth buffer
      // this will make the portals appear as flat shapes
      this.renderer.render(this.stencilScene, camera);

      // enable color
      gl.colorMask(true, true, true, true);

      // finally, render the current scene
      this.renderer.render(scene, camera);
   }

   private readonly dstInverse = new Matrix4();
   private readonly srcToCam = new Matrix4();
   private readonly srcToDst = new Matrix4();
   private readonly result = new Matrix4();

   private computePortalViewMatrix(sourcePortal: PortalWorldObject, camera: Camera): Matrix4 {
      const destinationPortal = sourcePortal.getDestination();
      this.srcToCam.multiplyMatrices(camera.matrixWorldInverse, sourcePortal.getMatrix());
      this.dstInverse.getInverse(destinationPortal.getMatrix());
      this.srcToDst.identity().multiply(this.srcToCam).multiply(this.dstInverse);
      this.result.getInverse(this.srcToDst);
      return this.result;
   }
}
