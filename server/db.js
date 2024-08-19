import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
let instance = null;
dotenv.config();

const port = process.env.PORT ?? 3000

const db_connection = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT
})


export async function getQuestion(id) {
  db_connection.query("USE triviadb;")
  const [result] = await db_connection.query(`SELECT q.Question_ID, q.Category_ID, q.Question_String, q.Question_Media, a.Answer_1, a.Answer_2, a.Answer_3, a.Answer_4, a.Answer_Media
    FROM questions as q
    INNER JOIN answers as a
    ON (q.Question_ID = a.Question_ID)
    WHERE q.Question_ID = ?;`, [id]);
  return result[0];
}


function generateHash(length) {
  const characters ='0123456789';
  let result = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export async function createRoom() {
  db_connection.query("USE triviadb;")
  const hash = generateHash(5)
  const room_name = 'room_' + hash
  const [result] = await db_connection.query(`CREATE TABLE ${room_name} (token VARCHAR(30) PRIMARY KEY, username TEXT(30), score INT, response BOOLEAN);`);

  return hash;
}

export async function checkRoom(hash) {
  db_connection.query("USE triviadb;")
  const [result] = await db_connection.query(`SHOW TABLES LIKE 'room_${hash}';`)

  return !result[0]
}

export async function enterRoom(hash, username) {
  db_connection.query("USE triviadb;")
  const [result] = await db_connection.query(`INSERT INTO room_${hash} (token, username, score, response)
    VALUES ('${username}', '${username}', 0, 0);`)

  return !result[0]
}

export async function checkUser(hash, username) {
  db_connection.query("USE triviadb;")
  const [result] = await db_connection.query(`SELECT * FROM room_${hash} WHERE token='${username}';`)

  return !result[0] == false
}

export async function updateUser(action, hash, username) {
  db_connection.query("USE triviadb;")
  if (action == 'submit score') {
    const [result] = await db_connection.query(`UPDATE room_${hash} SET score=score+10 WHERE token='${username}';`) 
  } else if (action == 'check response') {
    const [result] = await db_connection.query(`SELECT response FROM room_${hash} WHERE token='${username}';`) 
    return result[0]
  } else if (action == 'submit response') {
    const [result] = await db_connection.query(`UPDATE room_${hash} SET response=1 WHERE token='${username}';`) 
  } else if (action == 'cancel response') {
    const [result] = await db_connection.query(`UPDATE room_${hash} SET response=1;`) 
  } else if (action == 'reset response') {
    const [result] = await db_connection.query(`UPDATE room_${hash} SET response=0;`) 
  } else if (action == 'check all scores') {
    const [result] = await db_connection.query(`SELECT username, score FROM room_${hash};`)
    return result
  } else if (action == 'remove') {
    const [result] = await db_connection.query(`DELETE FROM room_${hash} WHERE token='${username}';`) 
    return result[0]
  }
}
