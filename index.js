import dotenv from "dotenv"
import Bot    from './bot/index.js'


// configure enviornment

dotenv.config()

const {
  ZULIP_RC,
  COMMAND_STREAM,
  COMMAND_TOPIC,
  ETHERCALC_URL,
} = process.env


// Initialize bot

const init = async () => {
  const bot = await new Bot({
    ZULIP_RC,
    COMMAND_STREAM,
    COMMAND_TOPIC,
    ETHERCALC_URL,
  })


  // 'bot' is available here to with commands and actions

}

init()
