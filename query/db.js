import mariadb from 'mariadb';

export default function() {
    return  Object.freeze({
        pool: mariadb.createPool({
            host: '172.28.8.11',
            port: '3306',
            database: 'changchatbot',
            user: 'chatbotadmin',
            password: 'yi2uih235WbSzfOp'
        })
    });
} 
