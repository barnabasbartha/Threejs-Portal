import {
   Camera,
   Group,
   LinearEncoding,
   Matrix4,
   NoToneMapping,
   PerspectiveCamera,
   Plane,
   Scene,
   Vector3,
   Vector4,
   WebGLRenderer,
} from "three";
import {Subject} from "rxjs";
import {PortalWorldObject} from "../object/portal-world-object";
import {World} from "../scene/instance/world";
import {Config} from "../../config/config";
import {Singleton} from "typescript-ioc";

@Singleton
export class RendererComponent {
   private readonly initSubject = new Subject<void>();
   public readonly init$ = this.initSubject.pipe();

   private renderer?: WebGLRenderer;
   private stencilScene = new Scene();
   private gl?: WebGLRenderingContext;

   init(canvas: HTMLCanvasElement) {
      // @ts-ignore
      canvas['style'] = {width: canvas.width, height: canvas.height};
      this.renderer = new WebGLRenderer({
         canvas,
         context: canvas.getContext('webgl2', {
            stencil: true,
            depth: true,
            powerPreference: 'high-performance' as WebGLPowerPreference,
            antialias: false
         } as WebGLContextAttributes) as WebGL2RenderingContext,
         powerPreference: 'high-performance',
         stencil: true,
         depth: true,
         antialias: false
      });
      this.renderer.autoClear = false;
      this.renderer.setPixelRatio(Config.RENDERER_PIXEL_RATIO);
      this.renderer.shadowMap.enabled = false;
      this.renderer.outputEncoding = LinearEncoding; //sRGBEncoding;
      this.renderer.toneMapping = NoToneMapping;
      this.renderer.toneMappingExposure = 1;
      this.gl = this.renderer.getContext();
      this.initSubject.next();
   }

   setSize(width: number, height: number) {
      this.renderer?.setSize(width, height);
   }

   render(worlds: Map<string, World>, world: World, camera: PerspectiveCamera) {
      if (!this.renderer) {
         return;
      }

      this.renderer.clear();

      this.gl.enable(this.gl.STENCIL_TEST);
      this.gl.enable(this.gl.DEPTH_TEST);

      const drawPortalGroups = this.renderWorldPortals(worlds, world, camera, 0);

      this.gl.disable(this.gl.STENCIL_TEST);
      this.renderer.clear(false, true, false);

      this.gl.colorMask(false, false, false, false);
      this.stencilScene.children = drawPortalGroups;
      this.renderer.render(this.stencilScene, camera);
      this.gl.colorMask(true, true, true, true);

      const scene = world.getGroup();
      this.renderer.render(scene, camera);
   }

   private renderWorldPortals(worlds: Map<string, World>, world: World, camera: PerspectiveCamera, recursiveLevel: number): Group[] {
      const portalsInScene = world.getPortals();
      const portalGroups = portalsInScene.map(portal => portal.getGroup());
      const drawPortalGroups = [...portalGroups];

      const cameraMatrixWorld = camera.matrixWorld.clone();
      //const cameraProjectionMatrix = camera.projectionMatrix.clone();
      portalsInScene
         .forEach((portal) => {
            const destinationWorld = worlds.get(portal.getDestinationSceneName());
            const destinationScene = destinationWorld.getGroup();


            if (recursiveLevel > 0) {
               camera.matrixAutoUpdate = false;
               camera.matrixWorld.copy(this.computePortalViewMatrix(portal, camera));
               const childPortalGroups = this.renderWorldPortals(worlds, destinationWorld, camera, recursiveLevel - 1);
               drawPortalGroups.push(...childPortalGroups);
               camera.matrixAutoUpdate = true;
               camera.matrixWorld.copy(cameraMatrixWorld);
               //camera.projectionMatrix.copy(cameraProjectionMatrix);
            }
            this.renderer.clear(false, false, true);

            this.gl.colorMask(false, false, false, false);
            this.gl.stencilFunc(this.gl.NEVER, 1, 0xFF);
            this.gl.stencilOp(this.gl.REPLACE, this.gl.KEEP, this.gl.KEEP);
            this.stencilScene.children = [portal.getGroup()];
            this.renderer.render(this.stencilScene, camera);
            this.gl.colorMask(true, true, true, true);

            this.gl.stencilFunc(this.gl.EQUAL, 1, 0xFF);
            this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
            camera.matrixAutoUpdate = false;
            //camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            camera.matrixWorld.copy(this.computePortalViewMatrix(portal, camera));
            //camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            //camera.projectionMatrix.copy(this.computePortalProjectionMatrix(portal, portal.getDestination(), camera));



            //this.stencilScene.children = [...portalGroups, ...destinationScene.children];
            //this.stencilScene.children = [...children, ...destinationScene.children];
            this.stencilScene.children = destinationScene.children;
            this.renderer.render(this.stencilScene, camera);
            this.renderer.clear(false, false, true);

            camera.matrixAutoUpdate = true;
            camera.matrixWorld.copy(cameraMatrixWorld);
            //camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            //camera.projectionMatrix.copy(cameraProjectionMatrix);
         });
      return drawPortalGroups;
   }

   private readonly rotationYMatrix = new Matrix4().makeRotationY(Math.PI);
   private readonly dstInverse = new Matrix4();
   private readonly srcToCam = new Matrix4();
   private readonly srcToDst = new Matrix4();
   private readonly result = new Matrix4();

   private computePortalViewMatrix(sourcePortal: PortalWorldObject, camera: Camera): Matrix4 {
      const destinationPortal = sourcePortal.getDestination();
      this.srcToCam.multiplyMatrices(camera.matrixWorldInverse, sourcePortal.getMatrix());
      this.dstInverse.getInverse(destinationPortal.getMatrix());
      this.srcToDst.identity().multiply(this.srcToCam).multiply(this.rotationYMatrix).multiply(this.dstInverse);
      this.result.getInverse(this.srcToDst);
      return this.result;
   }

   private readonly dstRotationMatrix = new Matrix4();
   private readonly normal = new Vector3();
   private readonly clipPlane = new Plane();
   private readonly clipVector = new Vector4();
   private readonly q = new Vector4();
   private readonly projectionMatrix = new Matrix4();

   // Use custom projection matrix to align portal camera's near clip plane with the surface of the portal
   // See http://www.terathon.com/code/oblique.html
   // See www.terathon.com/lengyel/Lengyel-Oblique.pdf
   private computePortalProjectionMatrix(sourcePortal: PortalWorldObject, destinationPortal: PortalWorldObject, camera: Camera): Matrix4 {
      this.dstRotationMatrix.identity();
      this.dstRotationMatrix.extractRotation(destinationPortal.getMatrix());

      // TODO: Use -1 if dot product is negative (?)
      this.normal.set(0, 0, 1).applyMatrix4(this.dstRotationMatrix);

      this.clipPlane.setFromNormalAndCoplanarPoint(this.normal, destinationPortal.getAbsolutePosition());
      this.clipPlane.applyMatrix4(camera.matrixWorldInverse);

      this.clipVector.set(this.clipPlane.normal.x, this.clipPlane.normal.y, this.clipPlane.normal.z, this.clipPlane.constant);
      this.projectionMatrix.copy(camera.projectionMatrix);

      this.q.x = (Math.sign(this.clipVector.x) + this.projectionMatrix.elements[8]) / this.projectionMatrix.elements[0];
      this.q.y = (Math.sign(this.clipVector.y) + this.projectionMatrix.elements[9]) / this.projectionMatrix.elements[5];
      this.q.z = -1.0;
      this.q.w = (1.0 + this.projectionMatrix.elements[10]) / camera.projectionMatrix.elements[14];

      this.clipVector.multiplyScalar(2 / this.clipVector.dot(this.q));

      this.projectionMatrix.elements[2] = this.clipVector.x;
      this.projectionMatrix.elements[6] = this.clipVector.y;
      this.projectionMatrix.elements[10] = this.clipVector.z + 1.0;
      this.projectionMatrix.elements[14] = this.clipVector.w;

      return this.projectionMatrix;
   }
}
