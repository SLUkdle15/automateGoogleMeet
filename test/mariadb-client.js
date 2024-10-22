import mariadb from 'mariadb';

// DB_HOST=172.28.8.11
// DB_USER=chatbotadmin
// DB_PW=yi2uih235WbSzfOp
// DB_DATABASE=changchatbot

async function asyncFunction() {
    let conn;
    try {
        // Create a new connection
        conn = await mariadb.createConnection({
            host: '172.28.8.11',
            port: '3306',
            database: 'changchatbot',
            user: 'chatbotadmin',
            password: 'yi2uih235WbSzfOp',
        });

        // Print connection thread
        console.log(`Connected! (id=${conn.threadId})`);
    } catch (err) {
        // Print error
        console.log(err);
    } finally {
        // Close connection
        if (conn) await conn.close();
    }
}

asyncFunction();