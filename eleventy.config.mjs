import 'dotenv/config'
import * as tinaHandler from "./tina/handler"
const createApp = tinaHandler.default.default // TSX fail?
const app = createApp()

export default function (eleventyConfig) {
  eleventyConfig.setInputDirectory("content")
  eleventyConfig.addPassthroughCopy({"public": "."})
  
  eleventyConfig.setServerOptions({
    domDiff: false,
    middleware: [
      function (req, res, next) {
        app(req, res, next)
      }
    ]
  })
};

