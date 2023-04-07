import api    from './api/index.js'
import utils  from './utils.js'
import locale from './locale.js'
import moment from 'moment'


const {
  ethercalc,
  zulip
} = api

const {
  parse_command,
  is_valid_sheet,
  wait
} = utils


export default class Bot {

  import_src = null
  export_destination = null

  constructor({

    ZULIP_RC,
    COMMAND_STREAM,
    COMMAND_TOPIC,
    ETHERCALC_URL,

  }) {
    return ( async () => {

      this.ZULIP_RC       = ZULIP_RC
      this.COMMAND_STREAM = COMMAND_STREAM
      this.COMMAND_TOPIC  = COMMAND_TOPIC,
      this.ETHERCALC_URL  = ETHERCALC_URL

      try {

        // init utils
        utils.init( this.ETHERCALC_URL )

        // init ethercalc api
        ethercalc.init( this.ETHERCALC_URL )

        // init zulip client
        await zulip.init( this.ZULIP_RC )

        // subscribe to stream if not
        await this.join()

        // listen to zulip for commands as messages
        await this.listen()

        return this

      } catch ( error ) {
        throw error
      }

    })()
  }



  // subscribe the bot to stream 'ethercalc'

  async join () {
    try {
      const subscriptions = await zulip.get_subs()
      if ( subscriptions.includes( this.COMMAND_STREAM ) ) {
        console.info( locale.api.subscribe.already( this.COMMAND_STREAM ) )
        return
      }
      console.info( locale.api.subscribe.ongoing( this.COMMAND_STREAM ) )
      await zulip.add_sub( this.COMMAND_STREAM )
    } catch ( error ) {
      throw error
    }
  }


  // wrapper function to send message to stream/topic

  async _send ( message ) {
    try {
      await zulip.send_msg(
        this.COMMAND_STREAM,
        this.COMMAND_TOPIC,
        message
      )
    } catch ( error ) {
      throw error
    }
  }


  // intervention on JS 'throw': first send the error as a
  // message to zulip if possible

  async _throw ( error ) {
    await this._send( locale.bot.error( error ) )
    throw error
  }


  // listen for messages on stream/topic & respond with
  // rules defined in below listener function

  async listen() {
    zulip.listen( this.listener.bind( this ) )
    await this._send( locale.bot.listening ) // annoying
    console.info( locale.bot.listening )
  }


  // parse received messages, filter out non-commands, and
  // call appropriate command

  async listener ( event ) {

    const
      type    = event.type,
      message = event.message,
      subject = message?.subject,
      content = message?.content


    // filter out non-message notifications, irrelevant
    // topics, and messages that are not commands

    if (
      type !== 'message' ||
      subject !== this.COMMAND_TOPIC ||
      !content.startsWith( '/' )
    ) {
      return
    }


    // parse the content string to extract a command name
    // and it's arguments (array, always)

    const { command, args } = parse_command( content )


    // check if the command exists in our dictionary, else
    // respond that command doesn't exist

    if ( !Object.keys( this.commands ).includes( command ) ) {
      return await this._send( locale.bot.commands.default( command ) )
    }


    // run the appropriate command with it's arguments

    this.commands[command]( args )

  }



  // our command definitions; note: the command name is the
  // name of the string that should be used in the message

  commands = {


    // get general help or help for a specific command

    help : async commands => {
      if ( commands.length == 0 ) {
        await this.actions.info()
      }
      for ( const command of commands ) {
        await this.actions.help( command )
      }
    },


    // wrapper for index command

    index : async args => {
      return await this.actions.index( args )
    },


    // alias for index command

    list : async args => {
      return await this.actions.index( args )
    },


    // check if sheets exists on server

    exists: async sheets => {
      if ( sheets.length == 0 ) {
        return await this._send( locale.bot.commands.exists.no_source )
      }
      for ( const sheet of sheets ) {
        await this.actions.exists( sheet )
      }
    },


    // copy sheet: the first argument is always source and
    // the second argument is always destination

    copy : async sheets => {
      if ( sheets.length == 0 ) {
        return await this._send( locale.bot.commands.copy.no_source )
      }
      if ( sheets.length == 1 ) {
        return await this._send( locale.bot.commands.copy.no_dest( sheets ) )
      }
      const from = sheets.shift()
      if ( !is_valid_sheet( from ) ) {
        return await this._send( locale.api.sheets.invalid( from ) )
      }
      for ( const sheet of sheets ) {
        await this.actions.copy( from, sheet )
      }
    },


    // copy a sheet to the same name with the datestamp to
    // back it up

    backup : async sheets => {
      if (sheets.length == 0) {
        return await this._send( locale.bot.commands.backup.no_source )
      }
      for ( const sheet of sheets ) {
        await this.actions.backup( sheet )
      }
    },


    // delete a sheet from the server

    delete: async sheets => {
      if ( sheets.length == 0 ) {
        return await this._send( locale.bot.commands.delete.no_source )
      }
      for ( const sheet of sheets ) {
        await this.actions.delete( sheet )
      }
    },


    // for when importing sheet into the server from another
    // server: set the source server to import from

    import_set_src : async src => {
      if ( !src.length ) {
        return await this._send( locale.bot.commands.import_set_src.no_src )
      }
      this.import_src = src[ 0 ]
      return await this._send( locale.bot.commands.import_set_src.success( this.import_src ) )
    },


    // import a list of sheets from another server; makes a
    // copy of a sheet from another server.

    import : async sheets => {
      if ( !this.import_src ) {
        return await this._send( locale.bot.commands.import.no_src )
      }
      if ( sheets.length == 0 ) {
        return await this._send( locale.bot.commands.import.no_source )
      }
      for ( const sheet of sheets ) {
        await this.actions.import( sheet )
      }
    },


    // for when exporting sheets to another server; set the
    // url of the destination server to export to

    export_set_dest : async dest => {
      if ( !dest.length ) {
        return await this._send( locale.bot.commands.export_set_dest.no_dest )
      }
      this.export_destination = dest[ 0 ]
      return await this._send( locale.bot.commands.export_set_dest.success( this.export_destination ) )
    },


    // export a list of sheets to another server.

    export : async sheets => {
      if ( !this.export_destination ) {
        return await this._send( locale.bot.commands.export.no_dest )
      }
      if ( sheets.length == 0 ) {
        return await this._send( locale.bot.commands.export.no_source )
      }
      for ( const sheet of sheets ) {
        await this.actions.export( sheet )
      }
    },



  }


  actions = {



    // get info about this bot

    info : async () => {
      const intro = locale.bot
        .help(
          this.COMMAND_STREAM,
          this.COMMAND_TOPIC,
          this.ETHERCALC_URL
        )
        .join( `\n\n` )
      const command_summary = Object
        .keys( locale.bot.commands )
        .filter( command => locale.bot.commands[command].help )
        .map( command => {
          return `\`${ command }\`: ${ locale.bot.commands[command].help[0] }`
        })
        .join( `\n` )
      return await this._send( intro + `\n\n` + command_summary )
    },

    // get help for a certain command

    help : async command => {
      if ( !Object.keys( this.commands ).includes( command ) ) {
        return await this._send( locale.bot.commands.default( command ) )
      }
      try {
        return await this._send(
          locale.bot.commands.help.open( command ) +
          locale.bot.commands[command].help.join(' ')
        )
      } catch ( error ) {
        return await this._throw( error )
      }
    },


    // create an index of sheets on the server with a search
    // query as an optional argument

    index : async args => {
      try {
        const
          sheets  = await ethercalc.index( args ),
          filters = args?.join(', ') || 'none',
          length  = sheets.length,
          list    = sheets.map(s => `- ${s}`).join("\n")
          // list    = sheets.map( s => `- ${to_url( s ) }` ).join("\n")
        return await this._send( locale.bot.commands.index.generate({ filters, list, length }) )
      } catch ( error ) {
        return await this._throw( error )
      }
    },


    // check if a sheet exists on the server

    exists : async sheet => {
      if ( !is_valid_sheet( sheet ) ) {
        return await this._send( locale.api.sheets.invalid( sheet ) )
      }
      try {
        const result = await ethercalc.exists( sheet )
        if ( !result ) {
          return await this._send( locale.bot.commands.exists.no( sheet ) )
        }
        return await this._send( locale.bot.commands.exists.yes( sheet ) )
      } catch ( error ) {
        return await this._throw( error )
      }

    },


    // copy a sheet on the server to (optionally) multiple
    // different sheets

    copy : async ( from, to ) => {
      if ( !is_valid_sheet( to ) ) {
        return await this._send( locale.api.sheets.invalid( to ) )
      }
      try {
        const from_sheet = await ethercalc.get( from )
        await ethercalc.post( to, from_sheet )
        return await this._send( locale.bot.commands.copy.success({ from, to }) )
      } catch ( error ) {
        return await this._throw( error )
      }
    },


    // backup a sheet by copying it and adding a timestamp

    backup : async sheet => {
      if ( !is_valid_sheet( sheet ) ) {
        return await this._send( locale.api.sheets.invalid( sheet ) )
      }
      try {
        const
          now = moment().format('YYYY-MM-DD--HH:mm:ss'),
          to  = `${ sheet }-bak-${ now }`
        return await this.actions.copy( sheet, to )
      } catch ( error ) {
        return await this._throw( error )
      }
    },


    // delete a sheet from the server

    delete : async sheet => {
      if ( !is_valid_sheet( sheet ) ) {
        return await this._send( locale.api.sheets.invalid( sheet ) )
      }
      try {
        await wait( 1000 )
        const result = await ethercalc.delete( sheet )
        if ( !result ) {
          return await this._send( locale.bot.commands.delete.notfound( sheet ) )
        }
        return await this._send( locale.bot.commands.delete.success( sheet ) )
      } catch ( error ) {
        return await this._throw( error )
      }
    },


    // WARNING MESSY SPACE RAN OUT OF TIME

    import : async sheet => {
      await wait( 1000 )
      const domain = this.import_src
      try  {
        const result = await ethercalc.ext_exists( domain, sheet )
        if ( !result ) {
          return await this._send( locale.bot.commands.exists.no( sheet ) )
        }
        await this._send( `Found sheet ${ sheet } at domain ${ domain }.` )
        const data = await ethercalc.ext_get( domain, sheet )
        await this._send( `Got sheet ${ sheet } data.` )
        await ethercalc.post( sheet, data )
        return await this._send( locale.bot.commands.import.success({ sheet, domain }) )
      } catch ( error ) {
        return await this._throw( error )
      }
    },

    export : async sheet => {
      await wait( 1000 )
      // if ( !is_valid_sheet( sheet ) ) {
      //   return await this._send( locale.api.sheets.invalid( sheet ) )
      // }
      const domain = this.export_destination
      try {
        const result = await ethercalc.exists( sheet )
        if ( !result ) {
          return await this._send( locale.bot.commands.exists.no( sheet ) )
        }
        const data = await ethercalc.get( sheet )
        await ethercalc.ext_post( domain, sheet, data )
        return await this._send( locale.bot.commands.export.success({ sheet, domain }) )
      } catch ( error ) {
        return await this._throw( error )
      }

    }

  }


}
