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
