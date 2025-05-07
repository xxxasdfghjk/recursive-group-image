import { useEffect, useRef } from "react";
import { runSegmentationSteps } from "../utils/imageUtils";

export default function CanvasDisplay({ image, steps }: { image: HTMLImageElement; steps: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        runSegmentationSteps(image, canvasRef.current, steps);
    }, [image, steps]);

    return <canvas ref={canvasRef} width={image.width} height={image.height} />;
}
