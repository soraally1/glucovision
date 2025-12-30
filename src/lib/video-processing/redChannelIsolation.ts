/**
 * Extracts average color intensities from the center region of interest (ROI)
 * of a video frame. The red channel is crucial for PPG signal detection
 * as it penetrates tissue effectively.
 */
export interface RGB {
    r: number;
    g: number;
    b: number;
}

export const extractRedChannelAverage = (
    canvas: HTMLCanvasElement,
    roiSize: number = 50
): RGB => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { r: 0, g: 0, b: 0 };

    const width = canvas.width;
    const height = canvas.height;

    // Calculate ROI (Center of the frame)
    const startX = Math.floor((width - roiSize) / 2);
    const startY = Math.floor((height - roiSize) / 2);

    // Ensure ROI is within bounds
    if (startX < 0 || startY < 0) return { r: 0, g: 0, b: 0 };

    try {
        const frameData = ctx.getImageData(startX, startY, roiSize, roiSize);
        const data = frameData.data;

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            sumR += data[i];     // Red
            sumG += data[i + 1]; // Green
            sumB += data[i + 2]; // Blue
            // data[i+3] is Alpha, ignored
        }

        return {
            r: sumR / pixelCount,
            g: sumG / pixelCount,
            b: sumB / pixelCount
        };
    } catch (error) {
        console.error("Error extracting red channel:", error);
        return { r: 0, g: 0, b: 0 };
    }
};
