















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
    prefix:      '/users/me',
    target:      config.services.video,
    protected:   true,
    rewrite:     false,
    timeout:     15000,
    description: 'Video Service — Watch Progress, Favorites',
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


  {
    prefix:      '/admin/users',
    target:      config.services.user,
    protected:   true,
    rewrite:     false,
    timeout:     15000,
    description: 'User Service — Admin User Management',
  },


  {
    prefix:      '/admin/videos',
    target:      config.services.video,
    protected:   true,
    rewrite:     false,
    timeout:     15000,
    description: 'Video Service — Admin Video Management',
  },


  {
    prefix:      '/admin/stats',
    target:      config.services.video,
    protected:   true,
    rewrite:     false,
    timeout:     15000,
    description: 'Video Service — Admin Stats',
  },
];

module.exports = ROUTES;