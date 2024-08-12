import express from 'express'
const app = express();
import logger from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config();


const port = process.env.PORT

import { Server } from 'socket.io'
import { createServer } from 'node:http'

import { getQuestion } from './db.js'

const server = createServer(app)
const io = new Server(server, {
	connectionStateRecovery: {}
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));


io.on('connection', (socket) => {
	console.log('a user has connected!')

	socket.on('disconnect', () => {
		console.log('a user has disconnected')
	})

	socket.on('question request', (id) => {
		console.log(`requesting question ${id}`)
		app.get(`/question/${id}`)
	})
})

app.use(logger('dev'))

app.get('/', (req, res) => {
	//send the file index.html to the client
	res.sendFile(process.cwd() + '/client/index.html')
})

app.get('/question/:id', async (req, res) => {
	//read a question
	const id = req.params.id
	const question = await getQuestion(id)
	res.json(question)
})

server.listen(port, () =>{
	console.log(`Server running on port ${port}`)
})