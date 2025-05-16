const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://wyg:${password}@cluster0.3h93rmd.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)
// 创建
// const note = new Note({
//   content: 'css is hard',
//   important: false,
// })

// note.save().then(result => {
//   console.log('note saved!', result)
//   mongoose.connection.close()
// })

// 查找
Note.find({important: true}).then(res => {
    console.log(res);
    mongoose.connection.close()
})