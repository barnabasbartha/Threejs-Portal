import {Quaternion, Vector3} from "three";

const normal = new Vector3(0, 0, -1);

export const quaternionToVector = (quaternion: Quaternion, target: Vector3): Vector3 =>
   target.copy(normal).applyQuaternion(quaternion);
