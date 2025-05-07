import { useState } from "react";
import CanvasDisplay from "./components/CanvasDisplay";

export default function App() {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const img = new Image();
            img.onload = () => setImage(img);
            img.src = URL.createObjectURL(file);
        }
    };

    return (
        <div className="p-4">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {image && <CanvasDisplay image={image} steps={6000} />}
        </div>
    );
}
