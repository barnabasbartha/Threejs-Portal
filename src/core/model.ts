export enum GameColor {
   BLUE = "blue",
   RED = "red",
}

export const GameColorValue: { [key in GameColor]: number } = {
   [GameColor.BLUE]: 0x7777ff,
   [GameColor.RED]: 0xff7777,
}
