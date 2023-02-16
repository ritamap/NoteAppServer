const connectToMongo  = require('./DataBase')
const express = require('express')
var cors = require('cors')
const app = express()

connectToMongo();


app.use(cors())
app.use(express.json())
const port = 5000


//Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/note'))


app.get('/', (req, res) => {
  res.send('Hello Tiku!')
})

app.listen(port, () => {
  console.log(`iNoteBook backend listening on port http://localhost:${port}`)
})

