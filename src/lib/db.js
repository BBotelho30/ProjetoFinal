// @ts-nocheck
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'GestaoReservas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function query(sql, params = []) {
    try {
        // O erro no 'execute' deve desaparecer com o @ts-nocheck no topo
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (err) {
        console.error(' Erro na Base de Dados:', err.message);
        throw err;
    }
}