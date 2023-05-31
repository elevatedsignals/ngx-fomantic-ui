import { ElementRef } from "@angular/core";
import {
  autoPlacement,
  computePosition,
  ComputePositionReturn,
  Placement,
  Middleware,
  shift,
  offset,
  autoUpdate,
  arrow,
} from "@floating-ui/dom";

export type PositioningPlacement =
  | "auto"
  | "top left"
  | "top"
  | "top right"
  | "bottom left"
  | "bottom"
  | "bottom right"
  | "left top"
  | "left"
  | "left bottom"
  | "right top"
  | "right"
  | "right bottom";

export const PositioningPlacement = {
  Auto: "auto" as PositioningPlacement,
  TopLeft: "top left" as PositioningPlacement,
  Top: "top" as PositioningPlacement,
  TopRight: "top right" as PositioningPlacement,
  LeftTop: "left top" as PositioningPlacement,
  Left: "left" as PositioningPlacement,
  LeftBottom: "left bottom" as PositioningPlacement,
  BottomLeft: "bottom left" as PositioningPlacement,
  Bottom: "bottom" as PositioningPlacement,
  BottomRight: "bottom right" as PositioningPlacement,
  RightTop: "right top" as PositioningPlacement,
  Right: "right" as PositioningPlacement,
  RightBottom: "right bottom" as PositioningPlacement,
};

export interface IPositionBoundingBox {
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

// Converting to popperjs placement
function placementToFloatingUI(
  placement: PositioningPlacement
): Placement | undefined {
  if (!placement || placement === PositioningPlacement.Auto) {
    return undefined;
  }

  // All placements of the format: `direction alignment`, e.g. `top left`.
  const [direction, alignment] = placement.split(" ");

  // Direction alone covers case of just `top`, `left`, `bottom`, `right`.
  const chosenPlacement = [direction];

  // Add `start` / `end` to placement, depending on alignment direction.
  switch (alignment) {
    case "top":
    case "left":
      chosenPlacement.push("start");
      break;
    case "bottom":
    case "right":
      chosenPlacement.push("end");
      break;
  }

  // Join with hyphen to create Popper compatible placement.
  return chosenPlacement.join("-") as Placement;
}

// Convert popperjs placement to ngx-fomantic-ui placement
function popperToPlacement(popper: string): PositioningPlacement {
  if (!popper || popper === "auto") {
    return "auto";
  }

  const [direction, alignment] = popper.split("-");

  const chosenPlacement = [direction];

  switch (direction) {
    case "top":
    case "bottom":
      switch (alignment) {
        case "start":
          chosenPlacement.push("left");
          break;
        case "end":
          chosenPlacement.push("right");
          break;
      }
      break;
    case "left":
    case "right":
      switch (alignment) {
        case "start":
          chosenPlacement.push("top");
          break;
        case "end":
          chosenPlacement.push("bottom");
          break;
      }
      break;
  }

  return chosenPlacement.join(" ") as PositioningPlacement;
}

export class PositioningService {
  public readonly anchor: ElementRef;
  public readonly subject: ElementRef;

  private _popperState: ComputePositionReturn;
  private _arrowSelector: string | undefined;
  private _middleware: Middleware[] = [];
  private _cleanUp: () => void;

  constructor(
    anchor: ElementRef,
    subject: ElementRef,
    placement: PositioningPlacement,
    arrowSelector?: string
  ) {
    this.anchor = anchor;
    this.subject = subject;
    this._placement = placement;
    this._arrowSelector = arrowSelector;
    this.init();
  }

  public get actualPlacement(): PositioningPlacement {
    if (!this._popperState) {
      return PositioningPlacement.Auto;
    }

    return popperToPlacement(this._popperState.placement);
  }

  public get state(): ComputePositionReturn {
    return this._popperState;
  }

  private _placement: PositioningPlacement;

  public get placement(): PositioningPlacement {
    return this._placement;
  }

  public set placement(placement: PositioningPlacement) {
    this._placement = placement;

    // if (this._popper) {
    //   this._popper.options.placement = placementToFloatingUI(placement);
    // }
  }

  private _hasArrow: boolean;

  public set hasArrow(hasArrow: boolean) {
    this._hasArrow = hasArrow;
  }

  public init(): void {
    const arrowCenter = this.arrowCenter;

    this._middleware = [offset(arrowCenter / 2), shift()];

    if (this._arrowSelector) {
      const pointerArrow = document.querySelector(this._arrowSelector);

      if (pointerArrow) {
        this._middleware.push(
          arrow({
            element: pointerArrow,
          })
        );
      }
    }

    if (this._placement === "auto") {
      this._middleware.push(autoPlacement());
    }

    this._cleanUp = autoUpdate(this.anchor.nativeElement, this.subject.nativeElement, () => {
      this.calculatePostion().then((computePositionReturn) => {
        const blah = this.calculateOffsets();

        Object.assign(this.subject.nativeElement.style, {
          left: `${computePositionReturn.x + blah.left}px`,
          top: `${computePositionReturn.y + blah.top}px`,
        });

        if (computePositionReturn.middlewareData.arrow) {
          const { x, y } = computePositionReturn.middlewareData.arrow;

          const pointerArrow = document.querySelector(this._arrowSelector);

          Object.assign((pointerArrow as HTMLElement).style, {
            left: x != null ? `${x}px` : "",
            top: y != null ? `${y}px` : "",
          });
        }

        this._popperState = computePositionReturn;
      });
    });
  }

  private get arrowCenter() {
    // To support correct positioning for all popup sizes we should calculate offset using em
    const fontSize = parseFloat(
      window
        .getComputedStyle(this.subject.nativeElement)
        .getPropertyValue("font-size")
    );
    // The Fomantic UI popup arrow width and height are 0.71428571em and the margin from the popup edge is 1em
    const arrowCenter = (0.71428571 / 2 + 1) * fontSize;

    return arrowCenter;
  }

  private calculatePostion(): Promise<ComputePositionReturn> {
    return computePosition(
      this.anchor.nativeElement,
      this.subject.nativeElement,
      {
        placement: placementToFloatingUI(this._placement),
        middleware: this._middleware,
      }
    );
  }

  public destroy(): void {
    this._cleanUp();
  }

  private calculateOffsets(): { top: number; left: number } {
    let left = 0;
    let top = 0;

    const arrowCenter = this.arrowCenter;

    if (this.anchor.nativeElement.offsetWidth <= arrowCenter * 2) {
      const anchorCenterWidth = this.anchor.nativeElement.offsetWidth / 2;
      if (
        this._placement === PositioningPlacement.TopLeft ||
        this._placement === PositioningPlacement.BottomLeft
      ) {
        left = anchorCenterWidth - arrowCenter;
      }
      if (
        this._placement === PositioningPlacement.TopRight ||
        this._placement === PositioningPlacement.BottomRight
      ) {
        left = arrowCenter - anchorCenterWidth;
      }
    }

    if (this.anchor.nativeElement.offsetHeight <= arrowCenter * 2) {
      const anchorCenterHeight = this.anchor.nativeElement.offsetHeight / 2;
      if (
        this._placement === PositioningPlacement.LeftTop ||
        this._placement === PositioningPlacement.RightTop
      ) {
        top = anchorCenterHeight - arrowCenter;
      }

      if (
        this._placement === PositioningPlacement.LeftBottom ||
        this._placement === PositioningPlacement.RightBottom
      ) {
        top = arrowCenter - anchorCenterHeight;
      }
    }

    return { top, left };
  }
}
