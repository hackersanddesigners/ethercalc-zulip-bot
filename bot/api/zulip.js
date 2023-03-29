import zulip from 'zulip-js'

let client

const


  // intitialize zulip client from zuliprc file

  init = zuliprc => new Promise( ( resolve, reject ) => {
    zulip( { zuliprc } )
    .then( result => {
      client = result
      resolve( client )
    })
    .catch( error => reject( error ) )
  }),


  // get subscribed streams of bot

  get_subs = () => new Promise( ( resolve, reject ) => {
    client
    .streams
    .subscriptions
    .retrieve()
    .then( result => resolve(
      result
      .subscriptions
      .map( s => s.name )
    ) )
    .catch( error => reject( error ) )
  }),


  // subscribe bot to stream

  add_sub = name => new Promise( ( resolve, reject ) => {
    client
    .users
    .me
    .subscriptions
    .add(
      {
        subscriptions: JSON.stringify(
          [
            { name }
          ]
        ),
      }
    )
    .then( result => resolve( result ) )
    .catch( error => reject( error ) )
  }),


  // listen for notifications (messages) from zulip

  listen = cb => {
    client
    .callOnEachEvent(
      event => cb( event ),
      [ 'message' ],
    )
  },


  // get streams from zulip as bot

  get_streams = () => ( new
    Promise((resolve, reject) => {
     client
     .streams
     .retrieve()
      .then(result => resolve(result))
      .catch(error => reject(error))
    })
  ),


  // get messages from  a stream and topic

  get_msgs = ( stream, topic ) => ( new
    Promise( (resolve, reject ) => {
     client
     .messages
     .retrieve({
        anchor: "newest",
        num_before: 100,
        num_after: 0,
        apply_markdown: false,
        narrow: [
          { operator: "stream", operand: stream },
          { operator: "topic",  operand: topic },
        ],
      })
      .then(result => resolve(result))
      .catch(error => reject(error))
    })
  ),


  // get all messages in a stream

  get_all_msgs = stream => ( new
    Promise((resolve, reject) => {
     client
     .messages
     .retrieve({
        anchor: "newest",
        num_before: 100,
        num_after: 0,
        // apply_markdown: false,
        narrow: [{ operator: "stream", operand: stream }],
      })
      .then(result => resolve(result))
      .catch(error => reject(error))
    })
  ),


  // send a message to a stream/topic

  send_msg = ( to, topic, content ) => ( new
    Promise((resolve, reject) => {
      client
      .messages
      .send({
        type : "stream",
        to,
        topic,
        content,
      })
      .then(result => resolve(result))
      .catch(error => reject(error))
    })
  )

export default {
  init,
  get_subs,
  add_sub,
  listen,
  get_streams,
  get_msgs,
  get_all_msgs,
  send_msg,
}
