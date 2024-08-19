import express from 'express'
const app = express();
import logger from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config();

const port = 3000

import { Server } from 'socket.io'
import { createServer } from 'node:http'

import { getQuestion, createRoom, checkRoom, enterRoom, checkUser, updateUser } from './db.js'

const server = createServer(app)
const io = new Server(server, {
	connectionStateRecovery: {}
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

import { fileURLToPath } from 'url';
import { dirname } from 'path';

app.use(express.static('public'));


io.on('connection', (socket) => {

	console.log(`Socket ${socket.id} has connected!`)

	socket.on('disconnect', () => {
		console.log(`Socket ${socket.id} has disconnected...`)
		io.emit('client disconnect')
	})

	socket.on('question request', (hash, id) => {
		console.log(`requesting question ${id}`)
		app.get(`/question/${id}`)
		const response_promise = updateUser('reset response', hash)
		response_promise.then(io.emit('question request', id))
		
		setTimeout(() => {
			const response_promise = updateUser('cancel response', hash)
			response_promise.then(io.emit('question timeout'))
		}, 10000);

		setTimeout(() => {
			//io.emit('question timeout')
			io.emit('new question')
		}, 15000);
	})

	socket.on('room create', (arg, callback) => {
		const hash_promise = createRoom()
		hash_promise.then((hash) => {console.log('room created', hash)})
		hash_promise.then((hash) => {callback(hash)})
	})

	socket.on('refresh lobby', (hash) => {
		console.log('refresh lobby', hash);
		const response_promise = updateUser('check all scores', hash)
		response_promise.then((response) => {io.emit('update lobby', response)})
	})

})

app.use(logger('dev'))

app.get('/', (req, res) => {
	//send the file index.html to the client
	res.sendFile(process.cwd() + '/client/index.html')
})

app.get('/lobby/:hash', async (req, res) => {
	//enter a room
	const hash = req.params.hash
	const checking = await checkRoom(hash)

	if (!checking == true) {
		console.log('entering', hash)
		res.sendFile(process.cwd() + '/client/lobby.html')
	} else {
		res.send('<h1>Error: El lobby no existe</h1>')
	}
})

app.get('/enterlobby/:hash/:username', async (req, res) => {
	const hash = req.params.hash
	const username = req.params.username
	console.log('checking', hash, username)
	const check_response = await checkRoom(hash)
	const checking = await checkUser(hash, username)
	if (!check_response == true) {
		if (checking == false) {
			//The user does not exist
			const enter_response = await enterRoom(hash, username)
		}
	}
	res.json({exist: checking})
})

app.post('/answer', async (req, res) => {
	const hash = req.body.hash
	const username = req.body.username
	const answer = req.body.answer

	const player_response = await updateUser('check response', hash, username)
	console.log(player_response.response);
	//Check if correct answer
	if (player_response.response == 0) {
		if (answer == 1) {
			console.log("CORRECT!")
			updateUser('submit score', hash, username)
		} else {console.log("INCORRECT...", answer)}
		updateUser('submit response', hash, username)
	}
	res.json(player_response)
})

app.get('/lobby/my_styles.css', async (req, res) => {
	res.send(process.cwd() + '/public/my_styles.css')
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