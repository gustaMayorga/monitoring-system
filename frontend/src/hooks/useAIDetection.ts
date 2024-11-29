import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

interface UseAIDetectionOptions {
  modelUrl: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  onDetection?: (detections: Detection[]) => void;
  threshold?: number;
}

export const useAIDetection = ({
  modelUrl,
  videoRef,
  onDetection,
  threshold = 0.5
}: UseAIDetectionOptions) => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await tf.loadGraphModel(modelUrl);
        setModel(loadedModel);
      } catch (err) {
        setError(err as Error);
      }
    };

    loadModel();
  }, [modelUrl]);

  const detect = async () => {
    if (!model || !videoRef.current) return;

    try {
      const video = tf.browser.fromPixels(videoRef.current);
      const resized = tf.image.resizeBilinear(video, [640, 480]);
      const casted = resized.cast('float32');
      const expanded = casted.expandDims(0);
      
      const predictions = await model.predict(expanded) as tf.Tensor;
      const detections = await processDetections(predictions, threshold);
      
      onDetection?.(detections);

      tf.dispose([video, resized, casted, expanded, predictions]);
    } catch (err) {
      setError(err as Error);
    }
  };

  const startDetection = () => {
    setIsRunning(true);
    requestAnimationFrame(function detect() {
      if (isRunning) {
        detect();
        requestAnimationFrame(detect);
      }
    });
  };

  const stopDetection = () => {
    setIsRunning(false);
  };

  return {
    isRunning,
    error,
    startDetection,
    stopDetection
  };
};

async function processDetections(predictions: tf.Tensor, threshold: number): Promise<Detection[]> {
  const detections: Detection[] = [];
  // Implementar el procesamiento de las predicciones según el modelo usado
  return detections;
} 