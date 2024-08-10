import express from 'express'
import logger from 'morgan'

const port = process.env.PORT ?? 3000

import { Server } from 'socket.io'
import { createServer } from 'node:http'

const app = express()
const server = createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
	console.log('a user has connected!')

	socket.on('disconnect', () => {
		console.log('a user has disconnected')
	})

	socket.on('chat message', (msg) => {
		// broadcat the chat message to all users
		io.emit('chat message', msg)
	})
})

app.use(logger('dev'))

app.get('/', (req, res) => {
	//send the file index.html to the client
	res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () =>{
	console.log(`Server running on port ${port}`)
})