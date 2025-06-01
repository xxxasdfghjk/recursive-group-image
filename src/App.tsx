import { useRef, useState } from "react";
import CanvasDisplay from "./components/CanvasDisplay";
import { Slider } from "@mui/material";
import { LinearProgressWithLabel } from "./components/LinearProgressWithLabel";

export const BUTTON_HEIGHT = 200;
export default function App() {
    const childRef = useRef<{ run: () => void; reset: () => void; init: () => void }>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [step, setStep] = useState(500);
    const [currentStep, setCurrentStep] = useState(0);
    const waitTime = 30;

    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const img = new Image();
            img.onload = () => setImage(img);
            img.src = URL.createObjectURL(file);
            childRef.current?.reset();
            childRef.current?.init();

            setProgress(0);
            setCurrentStep(0);
            inputRef.current!.value = ""; // Clear the input value
        }
    };

    return (
        <div className="max-h-screen">
            <input type="file" accept="image/*" onChange={handleFileChange} ref={inputRef} hidden />
            <div className={`p-2 h-[${BUTTON_HEIGHT}px] flex justify-center items-center`}>
                <div className="w-84">
                    <Slider
                        value={step}
                        step={1}
                        onChange={(_, value) => setStep(value)}
                        valueLabelDisplay="on"
                        min={1}
                        max={10000}
                    />
                </div>
                <div>
                    <button
                        className={`p-4 m-2 border rounded hover:opacity-50 bg-slate-200 font-bold cursor-pointer h-full w-full transition`}
                        onClick={() => inputRef.current?.click()}
                    >
                        Upload Image
                    </button>
                    <button
                        className={`p-4 m-2 border rounded hover:opacity-50 bg-slate-200 font-bold cursor-pointer h-full w-full transition`}
                        onClick={() => {
                            setCurrentStep((prev) => prev + step);
                            childRef.current?.run();
                        }}
                        disabled={progress < currentStep}
                    >
                        Start
                    </button>
                </div>
            </div>
            {image && (
                <CanvasDisplay
                    image={image}
                    steps={step}
                    incrementProgress={() => setProgress((prev) => prev + 1)}
                    waitTime={waitTime}
                    ref={childRef}
                />
            )}
            <div className={"fixed bottom-0 right-0"}>
                <LinearProgressWithLabel value={progress} maxValue={currentStep}></LinearProgressWithLabel>
            </div>
        </div>
    );
}
