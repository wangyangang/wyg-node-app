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

const peopleSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const People = mongoose.model('People', peopleSchema)

if (process.argv.length === 3) {
  People.find({}).then(res => {
    console.log('phonebook:');
    
    res.forEach(el => {
      console.log(`${el.name} ${el.number}`);
    })
    mongoose.connection.close()
  })
} else {
  const people = new People({
    name: process.argv[3],
    number: process.argv[4],
  })
  people.save().then(res => {
    mongoose.connection.close()
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`);
  })
}