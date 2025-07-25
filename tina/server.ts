import 'dotenv/config'
import express from "express"
import createApp from "./handler"

const port = process.env.PORT || 8080

let app = createApp()
app.use('/', express.static('_site'))
app.use('/uploads', express.static('public/uploads')) // HACK
  
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})



