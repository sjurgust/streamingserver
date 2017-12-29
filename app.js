global.app_port = 3344
// viz "makroer" for vizkommandoer
// selve serverprogrammet
fs = require("fs")
app = require('express.io')()
app.http().io()

const videolist = [
  '','_LOTTO_GFXBG_FULLSKJERM_gull_short.mov_.mp4','_LOTTO_GFXBG_FULLSKJERM_short.mov_.mp4'
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





app.get('/watch', function(req, res) {
  let vid = req.query.vid ? req.query.vid : 1
  const path = `video/${videolist[parseInt(vid)]}`
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
      'Content-Type': 'video/mp4',
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
