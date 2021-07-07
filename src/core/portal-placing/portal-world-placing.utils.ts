import {Color, Mesh, MeshStandardMaterial, PlaneBufferGeometry} from "three";

const portalGeometry = new PlaneBufferGeometry(2.05, 2.05);

export const createPortalMesh = (color: number): Mesh => {
   const material = new MeshStandardMaterial();
   material.color = new Color(color);
   material.polygonOffset = true;
   material.polygonOffsetUnits = -1;
   material.polygonOffsetFactor = -1;
   material.wireframe = true;
   return new Mesh(portalGeometry, material);
}
