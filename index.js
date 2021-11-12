const connectToMongo = require('./db');
const express = require('express')
const cors = require('cors');

connectToMongo();

const app = express();
const port = 5000;
app.use(cors());

app.use(express.json()) //to use json in req and res
//Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/', require('./routes/home'))

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})