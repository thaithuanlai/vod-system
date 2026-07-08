















const config = require('./index');

const ROUTES = [

  {
    prefix:      '/auth',
    target:      config.services.user,
    protected:   false,      
    rewrite:     false,      
    timeout:     15000,      
    description: 'User Service — Register, Login, Profile',
  },


  {
    prefix:      '/upload',
    target:      config.services.upload,
    protected:   true,       
    rewrite:     false,
    timeout:     120000,     
    description: 'Upload Service — Video Upload to GCS',
  },


  {
    prefix:      '/videos',
    target:      config.services.video,
    protected:   true,
    rewrite:     false,
    timeout:     30000,
    description: 'Video Service — Metadata CRUD',
  },


  {
    prefix:      '/stream',
    target:      config.services.streaming,
    protected:   false,
    rewrite:     false,
    timeout:     30000,
    description: 'Streaming Service — HLS Playlist & Segments',
  },


  {
    prefix:      '/notify',
    target:      config.services.notification,
    protected:   true,
    rewrite:     false,
    timeout:     10000,
    description: 'Notification Service — Events & Logs',
  },
];

module.exports = ROUTES;