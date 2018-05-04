global.app_port = 3344
// viz "makroer" for vizkommandoer
global.app_root = __dirname.replace(/\\\\/g, '/').replace(/\\/g, '/')
// selve serverprogrammet
fs = require("fs")
app = require('express.io')()
app.http().io()

const videolist = [
  {id:0, url:'grey.mp4', content_type:'video/mp4', poster:'grey.png'},//grey
  {id:1, url:'cris_og_faren.m4v', content_type:'video/mp4', poster:'cris_og_faren.png'}, //1
  {id:2, url:'Katten_henter_en_nerf-sett54ganger.mp4', content_type:'video/mp4', poster:'Katten_henter_en_nerf-sett54ganger.png'},//2
  {id:3, url:'Tjubvideo_Delia Flytter inn_med_stopp.mp4', content_type:'video/mp4', poster:'vlcsnap-2018-02-28-16h28m37s015.jpg'},//3
  {id:4, url:'grey.mp4', content_type:'video/mp4', poster:'ek204.png'},//4
  {id:5, url:'Making DIY Slim Gone Wrong-NybSLhWzqC4.mp4', content_type:'video/mp4', poster:'Thumb-Making-DIY-Slim-Gone-Wrong.jpg'},//5 Naif jr
  {id:6, url:'Giving a shoutout To-9nP_HnvDjYA.mp4', content_type:'video/mp4', poster:'Thumb-Giving-a-shoutout-To-9nP_HnvDjYA.jpg'},//6 Naif jr
  {id:7, url:'GOT A Legendary Chest OMG!!!-MEGzuz80nEg.mp4', content_type:'video/mp4', poster:'thumb-GOT-A-Legendary-Chest-OMG!!!-MEGzuz80nEg.f140.jpg'},//7 Naif jr
  {id:8, url:'Visiting sharks-z36yo4AvFhA.mp4', content_type:'video/mp4', poster:'thumb-Visiting-sharks-z36yo4AvFhA.jpg'},//8 Naif jr
  {id:9, url:'', content_type:'video/mp4', poster:''},
  {id:9, url:'', content_type:'video/mp4', poster:''},
  {id:11, url:'C005004V0143E34885.mp4', content_type:'video/mp4', poster:'C005004V0143E34885.png'},
  {id:12, url:'Tjubvideo_Brennende thuja_V2.mp4', content_type:'video/mp4', poster:'vlcsnap-2018-03-12-11h05m09s755.png'},
  {id:13, url:'Helium_FUNNY_STUFF.mov_5k.mp4', content_type:'video/mp4', poster:'Helium_FUNNY_STUFF.mov_5k.png'},
  {id:14, url:'Helium_FUNNY_STUFF.private.mp4', content_type:'video/mp4', poster:'Helium_FUNNY_STUFF.private.png'},
  {id:15, url:'C1002_DORULLMAMMA.mov_10M.mp4', content_type:'video/mp4', poster:'Helium_E_1002_12.sub.01.png'},
  {id:16, url:'Helium E_1006_18.mov_5k_trimmed.mp4', content_type:'video/mp4', poster:'Helium E_1006_18.mov_5k_trimmed.png'},
  {id:17, url:'C021002.mov_grill2000.mp4', content_type:'video/mp4', poster:'C021002.mov_grill2000.png'},
  {id:18, url:'C006006.mov_C1112_tjub.private.mp4', content_type:'video/mp4', poster:'C006006.mov_C1112_tjub.private.png'},
  {id:19, url:'C006006.mov_C1112_tjub.mp4', content_type:'video/mp4', poster:'C006006.mov_C1112_tjub.png'},
  '',]



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
