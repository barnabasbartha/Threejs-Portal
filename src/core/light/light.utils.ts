import {PointLight} from "three";
import {LightColor} from "./light.model";

export const GameColorValue: { [key in LightColor]: number | null } = {
   [LightColor.NO_COLOR]: null,
   [LightColor.BLUE]: 0x7777ff,
   [LightColor.RED]: 0xff7777,
}

export const createLight = (color: LightColor): PointLight =>
   new PointLight(
      GameColorValue[color],
      .5,
      5,
   );
