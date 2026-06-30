const fs = require('fs');

async function testFlow() {
  const axios = require('axios');
  console.log("\n── STEP 2: Đăng nhập lấy token ───────────────────");
  const loginRes = await axios.post('http://localhost:3000/auth/login', { email: 'lead@vod.com', password: 'Password123' });
  const loginData = loginRes.data;
  console.log("Login Response:", loginData);
  const token = loginData.accessToken;
  
  if (!token) {
    console.error("Lỗi: Không lấy được token");
    return;
  }
  console.log("\n🔑 Token lấy thành công");

  console.log("\n── STEP 3: Upload video test ─────────────────────");
  fs.writeFileSync('test.mp4', 'day la file text mo phong video');
  
  const FormData = require('form-data');
  const formData = new FormData();
  formData.append('video', fs.createReadStream('test.mp4'), 'test.mp4');
  
  try {
    const uploadRes = await axios.post('http://localhost:3000/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    
    const uploadData = uploadRes.data;
    console.log("Upload Response:", uploadData);
    
    const videoId = uploadData.data?.videoId || uploadData.videoId || uploadData.video?.id;
    if (!videoId) {
      console.log("Chưa lấy được videoId");
      return;
    }
    
    console.log("\n── STEP 4: Lấy danh sách video ───────────────────");
    const listRes = await axios.get('http://localhost:3000/videos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Videos List:", listRes.data);
  } catch (err) {
    console.error("Upload/List Error:", err.response ? err.response.data : err.message);
  }
}

testFlow().catch(console.error);
