// @ts-nocheck
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'gestaoreservas-gestaoreservas.e.aivencloud.com',
    port: 27675, 
    user: 'avnadmin',
    password: 'AVNS_5Bk1v8PCWbMi5YEJiPs', 
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