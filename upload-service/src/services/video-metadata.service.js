/**
 * Hàm thực hiện gọi HTTP API sang Video Service để đồng bộ hóa và tạo tài liệu Metadata ban đầu
 * @param {Object} metadataPayload - Thông tin khởi tạo video
 * @returns {Promise<String|null>} - Trả về videoId được cấp phát từ Video Service
 */
export const createInitialMetadata = async (metadataPayload) => {
    const videoServiceUrl = process.env.VIDEO_SERVICE_URL || 'http://video-service:3003';

    try {
        // Thực hiện gửi request POST đồng bộ trạng thái ban đầu
        const response = await fetch(`${videoServiceUrl}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Có thể bổ sung mã token bảo mật nội bộ (Internal Auth Token) nếu cần ở các phase sau
            },
            body: JSON.stringify(metadataPayload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Video-Service responded with code ${response.status}: ${errText}`);
        }

        const result = await response.json();
        // Trả về videoId được tạo ra từ database Firestore của Video Service
        return result.data.videoId;
    } catch (error) {
        console.error(`[Video Service Connection Error] Thất bại khi tạo metadata: ${error.message}`);
        throw error;
    }
};