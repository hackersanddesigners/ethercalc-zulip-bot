import utils from './utils.js'

const { to_url } = utils


// things that the bot says organized in a giant JSON

export default {

  api: {

    subscribe: {

      already: stream => (
        `Already subscribed to command stream: `
        + stream
        + `.`
        ),

      ongoing: stream => (
        `Subscribing to command stream: `
        + stream
        + `.`
      ),

    },

    event: {

      ignored: event => (
        `Event ignored: `
        + event
        + '.'
      ),

    },

    sheets: {

      invalid: sheet => (
        `Command failed: `
        + `Sheet **${ sheet }** cannot contain capital letters or special characters.`
      )

    }

  },

  bot: {

    listening: `Listening...`,

    error: error => '```\n' + error + '\n```',

    help: (
      COMMAND_STREAM,
      COMMAND_TOPIC,
      ETHERCALC_URL,
    ) => ([
      `Interact with the Ethercalc API on **\`${ ETHERCALC_URL }\`** with commands sent to the Zulip stream **\`${ COMMAND_STREAM }\`** and topic **\`${ COMMAND_TOPIC }\`**.`,
      `Send a message in the following format \`/command argument-1 argument-2 argument-3 ... \` where \`command\` is the command you want to use from the list below and \`argument-1\`, \`argument-2\` and \`argument-3\` are the different arguments for the command.`,
      `Different commands can take different arguments. Please use the command \`/help command-name\` for further instructions on how to use a command.`,
      `Available commands are:`,
    ]),

    commands: {

      default: command => (
        `Command `
        + command
        + ` does not exist.`
      ),

      help: {
        help: [
          `Get help with the bot.`,
          `Use \`/help\` for a list of all commands.`,
          `Or use \`/help command-1 command-2\` to get help with specific commands.`,
        ],
        open: command =>  `**Command \`${ command }\`** \n`
      },

      index: {
        help: [
          `Get a list of sheets on the server.`,
          `Use \`/index\` for a list of all the sheets on the server.`,
          `Or use \`/index filter-1 filter-2\` to get a list of all the sheets on the server who's names contain \`filter-1\` and \`filter-2\`.`,
        ],
        generate: ({ filters, list, length }) => (
          `**index of ${ length } sheets**\n` +
          `*( filters: ${ filters } )*\n` +
          `${ list }`
        ),
      },

      list: {
        help: [
          `Alias for the \`index\` command.`,
          `Get a list of sheets on the server.`,
          `Use \`/list\` for a list of all the sheets on the server.`,
          `Or use \`/list filter-1 filter-2 \` to get a list of all the sheets on the server who's names contain \`filter-1\` and \`filter-2\`.`,
        ],
      },

      exists: {
        help: [
          `Check if a sheet exists on the server.`,
          `Use \`/exists my-sheet-1 my-sheet-2\` to check if \`my-sheet-1\` and \`my-sheet-2\` exist.`,
          `Please provide at least one sheet to check.`,
        ],
        no_source:
          `Please provide at least one sheet to check. For example:`
          + `\n\`/exists my-sheet-1 my-sheet-2 octopus-sheet\``,
        yes: sheet => `Sheet **${ to_url( sheet ) }** exists.`,
        no: sheet => `Sheet **${ to_url( sheet ) }** does not exist.`
      },

      copy: {
        help: [
          `Copy the contents of one sheet to one or more new or existing sheets.`,
          `Use \`/copy source-sheet destination-sheet-1 destination-sheet-2\` to copy the contents of \`source-sheet\` to \`destination-sheet-1\` and \`destination-sheet-2\`.`,
          `Make sure to provide a \`source-sheet\` to copy the contents from and at least one \`destination-sheet\` to paste the contents to.`,
          `If the destination sheets exist, their contents will be overridden (so be careful!) and if they don't exist they will be created.`,
        ],
        no_source:
          `Please provide a source sheet to copy from and at least one destination sheet to paste to. For example:`
          + `\n\`/copy source-sheet destination-sheet-1 destination-sheet-2 \``,
        no_dest: sheets => (
          `Please provide at least one destination sheet to copy "${sheets[0]}" to. For example:`
          + `\n\`/copy ${sheets[0]} ${sheets[0]}-copy-1 ${sheets[0]}-copy-2 \``
        ),
        success: ({ from, to }) => (
          `Copied sheet **${ to_url(from) }** to **${ to_url(to) }**.`
        )
      },

      backup: {
        help: [
          `Backup the contents of one or more sheets.`,
          `Use \`/backup my-sheet-1 my-sheet-2 octopus-sheet\` to backup the contents of \`my-sheet-1\`, \`my-sheet-2\` and \`octopus-sheet\`.`,
          `This will create a duplicate of each of the sheets with the current timestamp appended to the end of the name and return the linked backup sheets.`,
          `Make sure to provide at least one \`source-sheet\` to backup.`,
        ],
        no_source:
          `Please provide at least one sheet to backup. For example:`
          + `\n\`/backup my-sheet-1 my-sheet-2 octopus-sheet\``
      },

      delete: {
        help: [
          `Permanently delete a sheet from the server.`,
          `Use \`/delete my-sheet-1 my-sheet-2 octopus-sheet\` to delete these sheets.`,
          `The sheet names \`my-sheet-1\`, \`my-sheet-2\` and \`octopus-sheet\` will then become available for new sheets.`,
          `Please provide at least one sheet to delete.`,
        ],
        no_source:
          `Please provide at least one sheet to delete. For example:`
          + `\n\`/delete my-sheet-1 my-sheet-2 octopus-sheet\``,
        success: sheet => `Deleted sheet **${ to_url( sheet ) }**.`,
        notfound: sheet => `Sheet **${ to_url( sheet ) }** does not exist and therefore could not be deleted.`
      },

      import_set_src: {
        help: [
          `Set the URL of the Ethercalc server to import sheets from.`,
          `Use \`/import_set_src https://ethercalc.somewhere.eu/\` to set the source Ethercalc server URL to \`https://ethercalc.somewhere.eu/\`.`,
        ],
        no_src:
        `Please provide a source URL to import from. For example:`
        + `\n\`/import_set_src https://ethercalc.somewhere.eu/\``,
        success: src => `Set import source URL to ** ${ src } **.`
      },

      import: {
        help: [
          `Import sheets from another Ethercalc server.`,
          `Use \`/import their-sheet-1 their-sheet-2 octopus-sheet\` to import the contents of \`their-sheet-1\`, \`their-sheet-2\` and \`octopus-sheet\` into this Ethercalc server.`,
          `Do not forget to first provide a source URL to import sheets from with the \`/import_set_src\` command.`,
          `Make sure you have permission (CORS) to access the API of the source server.`,
          `Please provide at least one sheet to import.`,
        ],
        no_src:
          `Please provide a source URL to import from. For example:`
          + `\n\`/import_set_src https://ethercalc.somewhere.eu/`,
        no_source:
          `Please provide at least one sheet to import. For example:`
            + `\n\`/import my-sheet-1 my-sheet-2 octopus-sheet\``,
        success: ({ sheet, domain }) => (
          `Imported sheet **${ to_url(sheet) }** from ** ${ domain }${ sheet } **.`
        )
      },

      export_set_dest: {
        help: [
          `Set the URL of the Ethercalc server to export sheets to.`,
          `Use \`/export_set_dest https://ethercalc.somewhere.eu/\` to set the destination Ethercalc server URL to \`https://ethercalc.somewhere.eu/\`.`,
        ],
        no_dest:
        `Please provide a destination URL to export to. For example:`
        + `\n\`/export_set_dest https://ethercalc.somewhere.eu/`,
        success: dest => `Set export destination URL to ** ${ dest } **.`
      },

      export: {
        help: [
          `Export sheets to another Ethercalc server.`,
          `Use \`/export my-sheet-1 my-sheet-2 octopus-sheet\` to export the contents of \`my-sheet-1\`, \`my-sheet-2\` and \`octopus-sheet\` to the destination Ethercalc server.`,
          `Do not forget to first provide a destination URL to export sheets to with the \`/export_set_src\` command.`,
          `Make sure you have permission (CORS) to access the API of the destination server.`,
          `Please provide at least one sheet to import.`,
        ],
        no_dest:
          `Please provide a destination URL to export to. For example:`
          + `\n\`/export_set_dest https://ethercalc.somewhere.eu/`,
        no_source:
          `Please provide at least one sheet to export. For example:`
            + `\n\`/export my-sheet-1 my-sheet-2 octopus-sheet\``,
        success: ({ sheet, domain }) => (
          `Exported sheet **${ to_url(sheet) }** to ** ${ domain }${ sheet } **.`
        )
      },


    },


  }

}
