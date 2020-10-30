import {
   LinearEncoding,
   Matrix4,
   NoToneMapping,
   Object3D,
   PerspectiveCamera,
   Plane,
   Scene,
   Vector3,
   Vector4,
   WebGLRenderer,
} from "three";
import {Subject} from "rxjs";
import {PortalWorldObject} from "../object/portal-world-object";
import {World} from "../world/world";
import {Config} from "../../config/config";
import {Singleton} from "typescript-ioc";

@Singleton
export class RendererComponent {
   private readonly initSubject = new Subject<void>();
   public readonly init$ = this.initSubject.pipe();

   private renderer?: WebGLRenderer;
   private tmpScene = new Scene();
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
            antialias: true
         } as WebGLContextAttributes) as WebGL2RenderingContext,
         powerPreference: 'high-performance',
         stencil: true,
         depth: true,
         antialias: true
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
      if (this.renderer) {
         this.renderer.clear();
         camera.updateMatrixWorld(true);
         this.renderWorldPortals(worlds, world, null, camera, camera.matrixWorld.clone(), camera.projectionMatrix.clone());
      }
   }

   private renderWorldPortals(worlds: Map<string, World>, world: World, excludePortal: PortalWorldObject | null, camera: PerspectiveCamera, viewMat: Matrix4, projMat: Matrix4, recursionLevel: number = 0) {
      const recursionLevelLeft = Config.MAX_PORTAL_RENDERING_RECURSION_LEVEL - recursionLevel;
      const portalsInWorld = world.getPortals();
      portalsInWorld
         .filter(portal => portal !== excludePortal)
         .forEach(portal => {
            const destinationWorld = worlds.get(portal.getDestinationWorldName());

            this.gl.colorMask(false, false, false, false);
            this.gl.depthMask(false);
            this.gl.disable(this.gl.DEPTH_TEST);
            this.gl.enable(this.gl.STENCIL_TEST);
            this.gl.stencilFunc(this.gl.NOTEQUAL, recursionLevel, 0xFF);
            this.gl.stencilOp(this.gl.INCR, this.gl.KEEP, this.gl.KEEP);
            this.gl.stencilMask(0xFF);
            this.renderScene(camera, [portal.getGroup()], viewMat, projMat);

            const destViewMat = this.computePortalViewMatrix(portal, viewMat).clone();
            const destProjMat = this.computePortalProjectionMatrix(portal, destViewMat, projMat).clone();

            if (recursionLevelLeft > 0) {
               this.renderWorldPortals(worlds, destinationWorld, portal.getDestination(), camera, destViewMat, destProjMat, recursionLevel + 1);
            } else {
               this.gl.colorMask(true, true, true, true);
               this.gl.depthMask(true);
               this.renderer.clear(false, true, false);
               this.gl.enable(this.gl.DEPTH_TEST);
               this.gl.enable(this.gl.STENCIL_TEST);
               this.gl.stencilMask(0x00);
               this.gl.stencilFunc(this.gl.EQUAL, recursionLevel + 1, 0xFF);

               this.renderScene(camera, destinationWorld.getGroup().children
                  .filter(object => object !== excludePortal?.getGroup()), destViewMat, destProjMat);
            }

            this.gl.colorMask(false, false, false, false);
            this.gl.depthMask(false);
            this.gl.enable(this.gl.STENCIL_TEST);
            this.gl.stencilMask(0xFF);
            this.gl.stencilFunc(this.gl.NOTEQUAL, recursionLevel + 1, 0xFF);
            this.gl.stencilOp(this.gl.DECR, this.gl.KEEP, this.gl.KEEP);

            this.renderScene(camera, [portal.getGroup()], viewMat, projMat);
         });

      this.gl.disable(this.gl.STENCIL_TEST);
      this.gl.stencilMask(0x00);
      this.gl.colorMask(false, false, false, false);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthMask(true);
      this.gl.depthFunc(this.gl.ALWAYS);
      this.renderer.clear(false, true, false);

      this.renderScene(camera, portalsInWorld
         .filter(portal => portal !== excludePortal)
         .map(portal => portal.getGroup()), viewMat, projMat);

      this.gl.depthFunc(this.gl.LESS);
      this.gl.enable(this.gl.STENCIL_TEST);
      this.gl.stencilMask(0x00);
      this.gl.stencilFunc(this.gl.LEQUAL, recursionLevel, 0xFF);
      this.gl.colorMask(true, true, true, true);
      this.gl.depthMask(true);

      this.renderScene(camera, world.getGroup().children
         .filter(object => object !== excludePortal?.getGroup()), viewMat, projMat);
   }

   private originalCameraMatrixWorld = new Matrix4();
   private originalCameraProjectionMatrix = new Matrix4();

   private renderScene(camera: PerspectiveCamera, children: Object3D[], viewMat: Matrix4, projMat: Matrix4) {
      this.tmpScene.children = children;
      this.originalCameraMatrixWorld.copy(camera.matrixWorld);
      this.originalCameraProjectionMatrix.copy(camera.projectionMatrix);
      camera.matrixAutoUpdate = false;
      camera.matrixWorld.copy(viewMat);
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);
      camera.projectionMatrix.copy(projMat);
      this.renderer.render(this.tmpScene, camera);
      camera.matrixAutoUpdate = true;
      camera.matrixWorld.copy(this.originalCameraMatrixWorld);
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);
      camera.projectionMatrix.copy(this.originalCameraProjectionMatrix);
   }

   private readonly rotationYMatrix = new Matrix4().makeRotationY(Math.PI);
   private readonly inverse = new Matrix4();
   private readonly dstInverse = new Matrix4();
   private readonly srcToCam = new Matrix4();
   private readonly srcToDst = new Matrix4();
   private readonly result = new Matrix4();

   private computePortalViewMatrix(sourcePortal: PortalWorldObject, viewMat: Matrix4): Matrix4 {
      this.srcToCam.multiplyMatrices(this.inverse.getInverse(viewMat), sourcePortal.getMatrix().clone());
      this.dstInverse.getInverse(sourcePortal.getDestination().getMatrix().clone());
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
   private readonly cameraInverseViewMat = new Matrix4();

   // Use custom projection matrix to align portal camera's near clip plane with the surface of the portal
   // See http://www.terathon.com/code/oblique.html
   // See www.terathon.com/lengyel/Lengyel-Oblique.pdf
   private computePortalProjectionMatrix(sourcePortal: PortalWorldObject, viewMat: Matrix4, projMat: Matrix4): Matrix4 {
      const destinationPortal = sourcePortal.getDestination();
      this.cameraInverseViewMat.getInverse(viewMat);
      this.dstRotationMatrix.identity().extractRotation(destinationPortal.getMatrix());

      // TODO: Use -1 if dot product is negative (?)
      this.normal.set(0, 0, 1).applyMatrix4(this.dstRotationMatrix);

      this.clipPlane.setFromNormalAndCoplanarPoint(this.normal, destinationPortal.getAbsolutePosition());
      this.clipPlane.applyMatrix4(this.cameraInverseViewMat);

      this.clipVector.set(this.clipPlane.normal.x, this.clipPlane.normal.y, this.clipPlane.normal.z, this.clipPlane.constant);
      this.projectionMatrix.copy(projMat);

      this.q.x = (Math.sign(this.clipVector.x) + this.projectionMatrix.elements[8]) / this.projectionMatrix.elements[0];
      this.q.y = (Math.sign(this.clipVector.y) + this.projectionMatrix.elements[9]) / this.projectionMatrix.elements[5];
      this.q.z = -1.0;
      this.q.w = (1.0 + this.projectionMatrix.elements[10]) / projMat.elements[14];

      this.clipVector.multiplyScalar(2 / this.clipVector.dot(this.q));

      this.projectionMatrix.elements[2] = this.clipVector.x;
      this.projectionMatrix.elements[6] = this.clipVector.y;
      this.projectionMatrix.elements[10] = this.clipVector.z + 1.0;
      this.projectionMatrix.elements[14] = this.clipVector.w;

      return this.projectionMatrix;
   }
}
