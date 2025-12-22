// @ts-nocheck
import mysql from 'mysql2/promise';
import { AIVEN_PASSWORD } from '$env/static/private'; 

const pool = mysql.createPool({
    host: 'gestaoreservas-gestaoreservas.e.aivencloud.com',
    port: 27675, 
    user: 'avnadmin',
    password: AIVEN_PASSWORD, 
    database: 'GestaoReservas',
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (err) {
        console.error('Erro na Base de Dados Aiven:', err.message);
        throw err;
    }
}