
const { getBucket } = require('../storage');

const HLS_PREFIX = process.env.GCS_HLS_PREFIX || 'hls-outputs';


const MIME_TYPES = {
  'm3u8': 'application/vnd.apple.mpegurl',
  'ts': 'video/mp2t',
};






async function streamFromGCS(req, res, gcsPath, mimeType) {
  const bucket = getBucket();
  const file = bucket.file(gcsPath);

  try {

    const [exists] = await Promise.race([
      file.exists(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('GCS timeout')), 5000)
      ),
    ]);

    if (!exists) {
      return res.status(404).json({ success: false, message: `File không tồn tại: ${gcsPath}` });
    }


    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', mimeType === MIME_TYPES.ts
      ? 'public, max-age=31536000'  
      : 'public, max-age=5'         
    );
    res.setHeader('Access-Control-Allow-Origin', '*');


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




async function getMasterPlaylist(req, res) {
  const { videoId } = req.params;
  const gcsPath = `${HLS_PREFIX}/${videoId}/master.m3u8`;
  console.log(`[stream] master.m3u8 → ${gcsPath}`);
  await streamFromGCS(req, res, gcsPath, MIME_TYPES.m3u8);
}





async function getQualityPlaylist(req, res) {
  const { videoId, quality } = req.params;
  const gcsPath = `${HLS_PREFIX}/${videoId}/${quality}/playlist.m3u8`;
  console.log(`[stream] ${quality}/playlist.m3u8 → ${gcsPath}`);
  await streamFromGCS(req, res, gcsPath, MIME_TYPES.m3u8);
}





async function getSegment(req, res) {
  const { videoId, quality, segment } = req.params;


  if (!/^[\w\-]+\.ts$/.test(segment)) {
    return res.status(400).json({ success: false, message: 'Tên segment không hợp lệ' });
  }

  const gcsPath = `${HLS_PREFIX}/${videoId}/${quality}/${segment}`;
  console.log(`[stream] segment → ${gcsPath}`);
  await streamFromGCS(req, res, gcsPath, MIME_TYPES.ts);
}






async function getFileFlat(req, res) {
  const { videoId, file } = req.params;


  if (!/^[\w\-]+\.(m3u8|ts)$/.test(file)) {
    return res.status(400).json({ success: false, message: 'Tên file không hợp lệ' });
  }

  const gcsPath = `${HLS_PREFIX}/${videoId}/${file}`;
  console.log(`[stream] file flat → ${gcsPath}`);

    const isTs = file.endsWith('.ts');
  const mimeType = isTs ? MIME_TYPES.ts : MIME_TYPES.m3u8;

  await streamFromGCS(req, res, gcsPath, mimeType);
}

module.exports = { getMasterPlaylist, getQualityPlaylist, getSegment, getFileFlat };
