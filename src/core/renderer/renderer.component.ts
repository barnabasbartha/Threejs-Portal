import {Singleton} from "typescript-ioc";
import {
   BoxBufferGeometry,
   Camera,
   CircleBufferGeometry,
   DoubleSide,
   Group,
   LinearEncoding,
   Matrix4,
   Mesh,
   MeshBasicMaterial,
   NoToneMapping,
   PerspectiveCamera,
   Plane,
   Scene,
   Vector3,
   Vector4,
   WebGLRenderer
} from "three";
import {Subject} from "rxjs";
import {PortalWorldObject} from "../object/portal-world-object";
import {World} from "../scene/instance/world";
import {Config} from "../../config/config";

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
      this.context = this.renderer.getContext();
      this.initSubject.next();
   }

   setSize(width: number, height: number) {
      this.renderer?.setSize(width, height);
   }

   private readonly cameraMatrixWorld = new Matrix4();
   private readonly cameraProjectionMatrix = new Matrix4();


   //
   private readonly frontCircle = new Mesh(
      new CircleBufferGeometry(1, 32),
      new MeshBasicMaterial({
         side: DoubleSide,
         transparent: true,
         opacity: 0,
         //color: new Color(Math.random(),Math.random(),Math.random())
      }),
   );
   private readonly backCircle = new Mesh(
      new CircleBufferGeometry(1, 32),
      new MeshBasicMaterial({
         side: DoubleSide,
         transparent: true,
         opacity: 0,
         //color: new Color(Math.random(),Math.random(),Math.random())
      }),
   );

   private readonly frontBox = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial({color: 0x00ff00}));
   private readonly backBox = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial({color: 0xff0000}));

   //

   private readonly portalsGroup = new Group();

   render(worlds: Map<string, World>, world: World, camera: PerspectiveCamera) {
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
      this.renderer.clear();


      ///
      /*
      gl.enable(gl.STENCIL_TEST);
      gl.enable(gl.DEPTH_TEST);
      this.frontCircle.position.set(.5, 1, -1);
      this.backCircle.position.set(-.5, 1, -1.5);
      this.frontBox.position.set(.5, 1, -5);
      this.backBox.position.set(-.5, 1, -6);
      this.frontBox.rotation.x += 0.01;
      this.frontBox.rotation.z += 0.01;
      this.backBox.rotation.x -= 0.01;
      this.backBox.rotation.z -= 0.01;

      // TODO: Stencil front circle
      //this.frontCircle.material.opacity = 1;
      //this.backCircle.material.opacity = 1;
      gl.colorMask(false, false, false, false);
      //this.stencilScene.children = [this.frontCircle, this.backCircle];
      //this.renderer.render(this.stencilScene, camera);
      //gl.depthMask(false);
      gl.stencilFunc(gl.NEVER, 1, 0xFF);
      gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);
      this.stencilScene.children = [this.frontCircle];
      this.renderer.render(this.stencilScene, camera);
      gl.colorMask(true, true, true, true);
      //gl.depthMask(true);

      // TODO: Draw front box
      //this.frontCircle.material.opacity = 0;
      //this.backCircle.material.opacity = 0
      gl.stencilFunc(gl.EQUAL, 1, 0xFF);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
      this.stencilScene.children = [this.frontCircle, this.backCircle, this.frontBox];
      this.renderer.render(this.stencilScene, camera);
      this.renderer.clear(false, false, true);

      // TODO: Stencil back circle
      //this.frontCircle.material.opacity = 1;
      //this.backCircle.material.opacity = 1;
      gl.colorMask(false, false, false, false);
      //this.stencilScene.children = [this.frontCircle, this.backCircle];
      //this.renderer.render(this.stencilScene, camera);
      //gl.depthMask(false);
      gl.stencilFunc(gl.NEVER, 1, 0xFF);
      gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);
      this.stencilScene.children = [this.backCircle];
      this.renderer.render(this.stencilScene, camera);
      gl.colorMask(true, true, true, true);
      //gl.depthMask(true);

      // TODO: Draw back box
      //this.frontCircle.material.opacity = 0;
      //this.backCircle.material.opacity = 0
      gl.stencilFunc(gl.EQUAL, 1, 0xFF);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
      this.stencilScene.children = [this.frontCircle, this.backCircle, this.backBox];
      this.renderer.render(this.stencilScene, camera);
      this.renderer.clear(false, false, true);



      gl.disable(gl.STENCIL_TEST);
      this.renderer.clear(false, true, false);
      gl.colorMask(false, false, false, false);
      this.stencilScene.children = [this.frontCircle, this.backCircle];
      this.renderer.render(this.stencilScene, camera);
      gl.colorMask(true, true, true, true);
      this.renderer.render(scene, camera);
      return;
      */


      gl.enable(gl.STENCIL_TEST);
      gl.enable(gl.DEPTH_TEST);
      // enable stencil test
      // disable stencil mask
      //gl.depthFunc(gl.GREATER);
      //gl.clearDepth(1);
      //gl.depthMask(true);
      // portalsInScene.forEach(portal => portal.disableTransparency());

      const portalGroups = portalsInScene.map(portal => portal.getGroup());
      this.portalsGroup.children = portalGroups;
      portalsInScene
         .forEach((portal) => {
            // disable color + depth
            // only the stencil buffer will be drawn into
            gl.colorMask(false, false, false, false);
            //gl.depthMask(false);

            // the stencil test will always fail (this is cheaper to compute)
            gl.stencilFunc(gl.NEVER, 1, 0xFF);
            // fragments where the portal is drawn will have a stencil value of 1
            // other fragments will retain a stencil value of 0
            gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);
            //  gl.depthFunc(gl.LESS);

            // render the portal shape using the settings above
            // set the portal as the only child of the stencil scene
            this.stencilScene.children = [portal.getGroup()];
            this.renderer.render(this.stencilScene, camera);

            // enable color + depth
            gl.colorMask(true, true, true, true);
            //gl.depthMask(true);

            // fragments with a stencil value of 1 will be rendered
            gl.stencilFunc(gl.EQUAL, 1, 0xFF);
            // stencil buffer is not changed
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);


            //this.stencilScene.children = portalGroups;
            //this.renderer.render(this.stencilScene, camera);

            // compute the view through the portal
            camera.matrixAutoUpdate = false;
            const destinationScene = worlds.get(portal.getDestinationSceneName()).getGroup();
            //destinationScene.matrixWorld.identity().multiply(portal.getMatrix()).multiply(portal.getDestination().getGroup().matrixWorld);
            // destinationScene.updateWorldMatrix(true, true);
            camera.matrixWorldInverse.getInverse(camera.matrixWorld); // TODO: Could be cached
            camera.matrixWorld.copy(this.computePortalViewMatrix(portal, camera));
            camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            camera.projectionMatrix.copy(this.computePortalProjectionMatrix(portal, portal.getDestination(), camera));

            // render the view through the portal
            //gl.depthMask(false);
            // this.stencilScene.children = [ ...destinationScene.children];
            this.portalsGroup.matrixAutoUpdate = false;
            //this.portalsGroup.matrixWorld.identity().multiply(camera.matrixWorld).multiply(new Matrix4().getInverse(this.cameraMatrixWorld));
            // this.portalsGroup.matrixWorld.identity().multiply(this.cameraMatrixWorld).multiply(new Matrix4().getInverse(camera.matrixWorld));
            this.stencilScene.children = [this.portalsGroup, ...destinationScene.children];
            this.renderer.render(this.stencilScene, camera);
            //this.renderer.render(destinationScene, camera);
            //gl.depthMask(true);

            // clear the depth buffer to remove the portal views' depth from the current scene
            // clear the stencil buffer for the next portal
            this.renderer.clear(false, false, true);

            // restore original camera matrices for the next portal
            camera.matrixAutoUpdate = true;
            camera.matrixWorld.copy(this.cameraMatrixWorld);
            camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            camera.projectionMatrix.copy(this.cameraProjectionMatrix);
            //destinationScene.updateMatrixWorld(true);
            //destinationScene.updateWorldMatrix(true, true);
         });

      // after all portals have been drawn, we can disable the stencil test
      gl.disable(gl.STENCIL_TEST);

      // clear the depth buffer to remove the portal views' depth from the current scene
      this.renderer.clear(false, true, false);

      // disable color
      gl.colorMask(false, false, false, false);
      // draw the portal shapes into the depth buffer
      // this will make the portals appear as flat shapes
      // this.stencilScene.children = [portalsInScene[0].getGroup()];
      this.stencilScene.children = portalGroups;
      this.renderer.render(this.stencilScene, camera);

      // enable color
      gl.colorMask(true, true, true, true);

      // finally, render the current scene
      //gl.depthFunc(gl.LESS);
      //gl.clearDepth(Infinity);
      // portalsInScene.forEach(portal => portal.enableTransparency());
      this.renderer.render(scene, camera);
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
