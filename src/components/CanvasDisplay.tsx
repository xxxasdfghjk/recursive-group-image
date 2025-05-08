import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { runSegmentationSteps, type Region } from "../utils/imageUtils";

export type ChildHandle = {
    run: () => void;
    reset: () => void;
    init: () => void;
};

export const CanvasDisplay = forwardRef<
    ChildHandle,
    {
        image: HTMLImageElement;
        steps: number;
        incrementProgress: () => void;
        waitTime: number;
    }
>(({ image, steps, incrementProgress, waitTime }, ref) => {
    const [regions, setRegions] = useState<Region[]>([]);
    useImperativeHandle(ref, () => {
        return {
            run: async () => {
                if (!canvasRef.current) return;
                const resultRegions = await runSegmentationSteps(
                    image,
                    canvasRef.current,
                    steps,
                    incrementProgress,
                    waitTime,
                    regions
                );
                setRegions(resultRegions);
            },
            reset: () => {
                setRegions([]);
            },
            init: () => {
                if (!canvasRef.current) return;
                const ctx = canvasRef.current.getContext("2d")!;
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(image, 0, 0);
            },
        };
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <canvas ref={canvasRef} width={image.width} height={image.height} />
            </div>
        </div>
    );
});

export default CanvasDisplay;
