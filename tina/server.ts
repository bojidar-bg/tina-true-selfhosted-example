import 'dotenv/config'
import express from "express"
import createApp from "./handler"

const port = process.env.PORT || 8080

let app = createApp()
app.use('/', express.static('_site'))
  
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})



