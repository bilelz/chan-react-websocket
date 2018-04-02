const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

const users = []

const broadcast = (data, ws) => {
    console.log("broadcast")
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== ws) {
        console.log("WebSocket.OPEN")
      client.send(JSON.stringify(data))
    }
  })
}

console.log('Server init');

wss.on('connection', (ws) => {
    console.log("connection")
  let index
  ws.on('message', (message) => {
    console.log("message",message)
    const data = JSON.parse(message)
    switch (data.type) {
      case 'ADD_USER': {
        index = users.length
        users.push({ name: data.name, id: index + 1 })
        ws.send(JSON.stringify({
          type: 'USERS_LIST',
          users
        }))
        broadcast({
          type: 'USERS_LIST',
          users
        }, ws)
        break
      }
      case 'ADD_MESSAGE':{
      
            ws.send(JSON.stringify({
                type: 'ADD_MESSAGE',
                message: data.message,
                author: data.author
            }))
            broadcast({
            type: 'ADD_MESSAGE',
            message: data.message,
            author: data.author
            }, ws)
            break
        }
      default:
        break
    }
  })

  ws.on('close', () => {
      console.log("close")
    users.splice(index, 1)
    broadcast({
      type: 'USERS_LIST',
      users
    }, ws)
  })
})