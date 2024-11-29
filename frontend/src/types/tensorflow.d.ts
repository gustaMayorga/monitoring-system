declare module '@tensorflow/tfjs' {
  export interface Tensor {
    dataSync(): Float32Array;
    dispose(): void;
    cast(dtype: string): Tensor;
    expandDims(axis?: number): Tensor;
  }

  export interface GraphModel {
    predict(input: Tensor): Tensor | Tensor[];
  }

  export const ready: () => Promise<void>;
  export const loadGraphModel: (url: string) => Promise<GraphModel>;
  export const dispose: (tensors: Tensor[]) => void;
  
  export namespace browser {
    export function fromPixels(pixels: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Tensor;
  }

  export namespace image {
    export function resizeBilinear(tensor: Tensor, size: [number, number]): Tensor;
  }
}

declare module '@tensorflow/tfjs-backend-webgl' {
  export {};
} 