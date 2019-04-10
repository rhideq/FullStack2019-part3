const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://fullstack:${password}@phonebook-uglyt.mongodb.net/phone-book?retryWrites=true`;

mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name: name,
  number: number
});

if (process.argv.length == 3) {
    console.log("puhelinluettelo:");
    Person
    .find({})
    .then(result=> {
      result.forEach(person => {
          console.log(person)
      })
      mongoose.connection.close()
    })
    
  }

if (process.argv.length == 5) {
    person.save().then(response => {
        console.log(`lisätään ${name} numero ${number} luetteloon`);
        mongoose.connection.close();
      });
}


