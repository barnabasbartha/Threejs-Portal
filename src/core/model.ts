export enum GameColor {
   NO_COLOR = "nocolor",
   BLUE = "blue",
   RED = "red",
}

export const GameColorValue: { [key in GameColor]: number | null } = {
   [GameColor.NO_COLOR]: null,
   [GameColor.BLUE]: 0x7777ff,
   [GameColor.RED]: 0xff7777,
}
