




export const createInitialMetadata = async (metadataPayload) => {
    const videoServiceUrl = process.env.VIDEO_SERVICE_URL || 'http://video-service:3003';

    try {

        const response = await fetch(`${videoServiceUrl}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(metadataPayload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Video-Service responded with code ${response.status}: ${errText}`);
        }

        const result = await response.json();

        return result.data.id || result.data.videoId;
    } catch (error) {
        console.error(`[Video Service Connection Error] Thất bại khi tạo metadata: ${error.message}`);
        throw error;
    }
};