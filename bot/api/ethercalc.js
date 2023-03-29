import axios from 'axios'


// we need to initiate a second axios :D

const second_axios = axios.create()

export default {


  // this one has the ethercalc URL

  init( url ) {
    axios.defaults.baseURL = url
  },


  // list sheets on server with filters passed as an option

  index : filters => new Promise( ( resolve, reject ) => {
    axios
    .get( `_rooms` )
    .then( result => {
      let index = result.data
      if ( filters ) {
        index = index.filter( s => (
          filters.every( q => s.includes( q ) )
        ) )
      }
      resolve( index )
    })
    .catch( error => reject( error ) )
  }),


  // check if sheet exists

  exists : sheet => new Promise( ( resolve, reject ) => {
    axios
    .get( `_exists/${ sheet }`)
    .then( result => resolve( result.data ) )
    .catch( error => reject( error ) )
  }),


  // get sheet data

  get : sheet => new Promise( ( resolve, reject ) => {
    axios
    .get( `_/${ sheet }`)
    .then( result => resolve( result.data ) )
    .catch( error => reject( error ) )
  }),


  // get sheet data as JSON

  get_JSON : sheet => new Promise( ( resolve, reject ) => {
    axios
    .get( `${ sheet }.csv.json` )
    .then( result => resolve( result.data ) )
    .catch( error => reject( error) )
  }),


  // create / update sheet with new data

  post : ( sheet, data ) => new Promise( ( resolve, reject ) => {
    axios
    .post( `_/`, {
      room     : sheet,
      snapshot : data
    })
    .then( result => resolve( result ) )
    .catch( error => reject( error ) )
  }),


  // delete sheet

  delete( sheet ) {
    return new Promise( ( resolve, reject ) => {
      this
      .exists( sheet )
      .then( exists =>  {
        if ( exists ) {
          axios
          .delete( `_/${ sheet }` )
          .then( result => resolve( result ) )
          .catch( error => reject( error ) )
        } else {
          resolve( exists )
        }
      })
      .catch( error => reject( error ) )

    })
  },


  // get sheet from another server

  ext_get : ( domain, sheet ) => new Promise( ( resolve, reject ) => {
    second_axios
    .get( `${ domain }_/${ sheet }`)
    .then( result => resolve( result.data ) )
    .catch( error => reject( error ) )
  }),


  // post sheet to another server

  ext_post : ( domain, sheet, data ) => new Promise( ( resolve, reject ) => {
    second_axios
    .post( `${ domain }_/`, {
      room     : sheet,
      snapshot : data
    })
    .then( result => resolve( result ) )
    .catch( error => reject( error ) )
  }),


}
