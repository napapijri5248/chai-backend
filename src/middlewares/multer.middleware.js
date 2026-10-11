import multer from 'multer'
// import crypto from 'crypto'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname)
    // crypto.randomBytes(16, function (err, raw) {
    //   if (err) return cb(err)
    // })
  }
})

export const upload = multer({ storage })
