import {Singleton} from "typescript-ioc";

@Singleton
export class GuiComponent {
   private static readonly CLASS_VISIBLE = "visible";
   private readonly layer: HTMLDivElement;
   private readonly container: HTMLDivElement;

   constructor() {
      this.layer = document.createElement("div");
      this.layer.classList.add("gui-layer", GuiComponent.CLASS_VISIBLE);

      this.layer.innerHTML = `<div class="container visible">

    <h1>Click to start</h1>
    <p>Use WASD and Cursor to move.</p>

</div>`;

      document.getElementsByTagName("body")[0].appendChild(this.layer);
      this.container = document.getElementsByClassName("container")[0] as HTMLDivElement;
   }

   show() {
      this.layer.classList.add(GuiComponent.CLASS_VISIBLE);
      this.container.classList.add(GuiComponent.CLASS_VISIBLE);
   }

   hide() {
      this.layer.classList.remove(GuiComponent.CLASS_VISIBLE);
      this.container.classList.remove(GuiComponent.CLASS_VISIBLE);
   }

   getLayer(): HTMLDivElement {
      return this.layer;
   }
}
