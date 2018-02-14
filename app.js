global.app_port = 3344
// viz "makroer" for vizkommandoer
global.app_root = __dirname.replace(/\\\\/g, '/').replace(/\\/g, '/')
// selve serverprogrammet
fs = require("fs")
app = require('express.io')()
app.http().io()

const videolist = [
  {url:'',poster:''},
  {url:'cris_og_faren.m4v', content_type:'video/mp4', poster:'cris_og_faren.png'},
  {url:'Katten_henter_en_nerf-sett54ganger.mp4', content_type:'video/mp4', poster:'Katten_henter_en_nerf-sett54ganger.png'},
  {url:'Balloons 3D Live Wallpaper-kqvdE_yZ84I.mp4', content_type:'video/mp4', poster:'proxy.png'},
  {url:'xek2004.mp4', content_type:'video/mp4', poster:'ek204.png'},

  '',

]

const ThumbnailGenerator = require('video-thumbnail-generator').default;


let generateThumbs = (strVidPath) => {
  const tg = new ThumbnailGenerator({
    sourcePath: strVidPath,
    thumbnailPath: 'thumbs/',
    tmpDir: 'thumbs/' //only required if you can't write to /tmp/ and you need to generate gifs
  });

  tg.generate()
    .then(console.log);
}

  // [ 'test-thumbnail-320x240-0001.png',
  //  'test-thumbnail-320x240-0009.png',
  //  'test-thumbnail-320x240-0010.png' ]
//
// tg.generateOneByPercent(90)
//   .then(console.log);
//   // 'test-thumbnail-320x240-0001.png'
//
// tg.generateCb((err, result) => {
//   console.log(result);
//   // [ 'test-thumbnail-320x240-0001.png',
//   //  'test-thumbnail-320x240-0010.png' ]
// });
//
// tg.generateOneByPercentCb(90, (err, result) => {
//   console.log(result);
//   // 'test-thumbnail-320x240-0001.png'
// });
//
// tg.generateGif()
//   .then(console.log())
//   // '/full/path/to/video-1493133602092.gif'
//
// tg.generateGifCb((err, result) => {
//   console.log(result);
//   // '/full/path/to/video-1493133602092.gif'
// })


app.get('/round_thumb', function(req, res) {
  let id = req.query.vid ? req.query.vid : 1
  const rounds = ['round_thumbs_sample_f.png','round_thumbs_sample_c.png','round_thumbs_sample_u.png','round_thumbs_sample_a.png']
  rand = Math.random();
  rand *= rounds.length;
  rand = Math.floor(rand);
  res.sendfile(app_root + `/thumbs/${rounds[rand]}`)
})


app.get('/poster', function(req, res) {
  let id = req.query.vid ? req.query.vid : 1
  res.sendfile(app_root + `/thumbs/${videolist[parseInt(id)].poster}`)
})
app.get('/watch', function(req, res) {
  let id = req.query.vid ? req.query.vid : 1
  // let content_type = req.query.id ? req.query.id : 1
  const path = app_root + `/streaming_server_files/${videolist[parseInt(id)].url}`
  // generateThumbs(path)
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': `${videolist[parseInt(id)].content_type}`,
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})


const sio = app.listen(app_port, () => {
  console.log(`streamingserver started port:${app_port}`);
});
sio.on('error', (err) => {
  console.log(err)
})
sio.on('close', (err) => {
  console.log(err)
})
