// Controller phục vụ HLS files từ GCS
const { getBucket } = require('../storage');

const HLS_PREFIX = process.env.GCS_HLS_PREFIX || 'hls-outputs';

// Map đuôi file → MIME type
const MIME_TYPES = {
  'm3u8': 'application/vnd.apple.mpegurl',
  'ts': 'video/mp2t',
};

/**
 * Lấy file từ GCS và stream thẳng về client
 * @param {string} gcsPath - đường dẫn trong bucket
 * @param {string} mimeType - MIME type của file
 */
async function streamFromGCS(req, res, gcsPath, mimeType) {
  const bucket = getBucket();
  const file = bucket.file(gcsPath);

  try {
    // Kiểm tra file có tồn tại không (timeout 5s)
    const [exists] = await Promise.race([
      file.exists(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('GCS timeout')), 5000)
      ),
    ]);

    if (!exists) {
      return res.status(404).json({ success: false, message: `File không tồn tại: ${gcsPath}` });
    }

    // Set headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', mimeType === MIME_TYPES.ts
      ? 'public, max-age=31536000'  // .ts segment cache lâu
      : 'public, max-age=5'         // .m3u8 playlist cache ngắn
    );
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream file về client
    const readStream = file.createReadStream();

    readStream.on('error', (err) => {
      console.error('[streamFromGCS] ReadStream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Lỗi đọc file từ GCS' });
      }
    });

    readStream.pipe(res);
  } catch (err) {
    console.error('[streamFromGCS]', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Lỗi GCS: ' + err.message });
    }
  }
}

/**
 * GET /stream/:videoId/master.m3u8
 */
async function getMasterPlaylist(req, res) {
  const { videoId } = req.params;
  const gcsPath = `${HLS_PREFIX}/${videoId}/master.m3u8`;
  console.log(`[stream] master.m3u8 → ${gcsPath}`);
  await streamFromGCS(req, res, gcsPath, MIME_TYPES.m3u8);
}

/**
 * GET /stream/:videoId/:quality/playlist.m3u8
 * Ví dụ: /stream/video001/720p/playlist.m3u8
 */
async function getQualityPlaylist(req, res) {
  const { videoId, quality } = req.params;
  const gcsPath = `${HLS_PREFIX}/${videoId}/${quality}/playlist.m3u8`;
  console.log(`[stream] ${quality}/playlist.m3u8 → ${gcsPath}`);
  await streamFromGCS(req, res, gcsPath, MIME_TYPES.m3u8);
}

/**
 * GET /stream/:videoId/:quality/:segment
 * Ví dụ: /stream/video001/720p/seg000.ts
 */
async function getSegment(req, res) {
  const { videoId, quality, segment } = req.params;

  // Validate tên segment để tránh path traversal
  if (!/^[\w\-]+\.ts$/.test(segment)) {
    return res.status(400).json({ success: false, message: 'Tên segment không hợp lệ' });
  }

  const gcsPath = `${HLS_PREFIX}/${videoId}/${quality}/${segment}`;
  console.log(`[stream] segment → ${gcsPath}`);
  await streamFromGCS(req, res, gcsPath, MIME_TYPES.ts);
}

module.exports = { getMasterPlaylist, getQualityPlaylist, getSegment };
