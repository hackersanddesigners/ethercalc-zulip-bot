
let ETHERCALC_URL

export default {


  // set ethercalc server URL

  init( url ) {
    ETHERCALC_URL = url
  },


  // convert a sheet name to a markdown url

  to_url( sheet ) {
    return `[${ sheet }](${ ETHERCALC_URL }/${ sheet } )`
  },


  // parse a command from a message content string

  parse_command ( str ) {
    const
      args    = str.replace( /\n/g, " " ).split(' ').filter( a => a ),
      command = args.shift().slice( 1 )
    return { command, args }
  },


  // regex hell

  is_valid_sheet ( sheet ) {
    // if ( /^[a-z0-9]+(?:-[a-z0-9]+)*$/g.test( sheet ) ) {
    // return ( /\W|_|:|-|%/g.test( sheet ) )
    return ( /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/g.test( sheet ) )
  },


  // JS wait milliseconds function

  wait( ms ) {
    return new Promise( resolve => {
      setTimeout( resolve, ms )
    })
  }

}
