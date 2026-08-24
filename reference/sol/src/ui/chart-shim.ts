type DataPoint = number | { x: number; y: number; r?: number };
type Dataset = {
  label?: string;
  data?: DataPoint[];
  backgroundColor?: string | string[];
  borderColor?: string;
  hidden?: boolean;
  borderDash?: number[];
};
type ChartConfiguration = {
  type: "doughnut" | "scatter" | "line";
  data: { labels?: string[]; datasets: Dataset[] };
  options?: Record<string, unknown>;
};
type DrawnPoint = { datasetIndex: number; index: number; x: number; y: number };

export const registerables: unknown[] = [];

export class Chart<TType extends string = string> {
  static register(..._items: unknown[]): void {
    void _items;
  }

  readonly canvas: HTMLCanvasElement;
  readonly type: TType;
  data: ChartConfiguration["data"];
  options: Record<string, unknown>;
  #points: DrawnPoint[] = [];

  constructor(canvas: HTMLCanvasElement, configuration: ChartConfiguration) {
    this.canvas = canvas;
    this.type = configuration.type as TType;
    this.data = configuration.data;
    this.options = configuration.options ?? {};
    this.update();
  }

  update(_mode?: string): void {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(280, this.canvas.clientWidth || 520);
    const height = Math.max(180, this.canvas.clientHeight || 260);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    const context = this.canvas.getContext("2d");
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    this.#points = [];
    if (this.type === "doughnut") this.#drawDoughnut(context, width, height);
    else if (this.type === "scatter") this.#drawScatter(context, width, height);
    else this.#drawLines(context, width, height);
  }

  destroy(): void {
    this.#points = [];
    this.canvas
      .getContext("2d")
      ?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getElementsAtEventForMode(
    event: Event,
  ): { datasetIndex: number; index: number }[] {
    const mouse = event as MouseEvent;
    const bounds = this.canvas.getBoundingClientRect();
    const x = mouse.clientX - bounds.left;
    const y = mouse.clientY - bounds.top;
    const nearest = this.#points
      .map((point) => ({
        point,
        distance: Math.hypot(point.x - x, point.y - y),
      }))
      .sort((left, right) => left.distance - right.distance)[0];
    return nearest && nearest.distance <= 28
      ? [
          {
            datasetIndex: nearest.point.datasetIndex,
            index: nearest.point.index,
          },
        ]
      : [];
  }

  #drawDoughnut(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    const dataset = this.data.datasets[0];
    const values = (dataset?.data ?? []).map(Number);
    const total = values.reduce((sum, value) => sum + value, 0) || 1;
    const colors = Array.isArray(dataset?.backgroundColor)
      ? dataset.backgroundColor
      : [];
    let start = -Math.PI / 2;
    values.forEach((value, index) => {
      const end = start + (value / total) * Math.PI * 2;
      context.beginPath();
      context.arc(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.38,
        start,
        end,
      );
      context.arc(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.22,
        end,
        start,
        true,
      );
      context.closePath();
      context.fillStyle = colors[index] ?? "#0b5f7a";
      context.fill();
      start = end;
    });
  }

  #drawScatter(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    const all = this.data.datasets.flatMap((dataset) =>
      (dataset.data ?? []).filter(
        (point): point is { x: number; y: number; r?: number } =>
          typeof point === "object",
      ),
    );
    const maxX = Math.max(1, ...all.map((point) => point.x));
    const maxY = Math.max(1, ...all.map((point) => point.y));
    this.data.datasets.forEach((dataset, datasetIndex) => {
      if (dataset.hidden) return;
      (dataset.data ?? []).forEach((raw, index) => {
        if (typeof raw !== "object") return;
        const x = 30 + (raw.x / maxX) * (width - 60);
        const y = height - 24 - (raw.y / maxY) * (height - 48);
        context.beginPath();
        context.arc(
          x,
          y,
          Math.min(15, Math.max(4, raw.r ?? 6)),
          0,
          Math.PI * 2,
        );
        context.fillStyle =
          typeof dataset.backgroundColor === "string"
            ? dataset.backgroundColor
            : "#0b5f7a";
        context.globalAlpha = 0.72;
        context.fill();
        context.globalAlpha = 1;
        this.#points.push({ datasetIndex, index, x, y });
      });
    });
  }

  #drawLines(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    const values = this.data.datasets.flatMap((dataset) =>
      dataset.hidden
        ? []
        : (dataset.data ?? []).filter(
            (value): value is number => typeof value === "number",
          ),
    );
    const min = Math.min(0, ...values);
    const max = Math.max(1, ...values);
    this.data.datasets.forEach((dataset) => {
      const data = (dataset.data ?? []).filter(
        (value): value is number => typeof value === "number",
      );
      if (dataset.hidden || data.length === 0) return;
      context.beginPath();
      data.forEach((value, index) => {
        const x = 24 + (index / Math.max(1, data.length - 1)) * (width - 48);
        const y =
          height - 20 - ((value - min) / (max - min || 1)) * (height - 40);
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.strokeStyle = dataset.borderColor ?? "#0b5f7a";
      context.lineWidth = 2;
      context.setLineDash(dataset.borderDash ?? []);
      context.stroke();
      context.setLineDash([]);
    });
  }
}
