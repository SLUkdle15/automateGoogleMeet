import db from './db.js';

export default async function() {
    const pool = db().pool;
    try {
        const rows = await pool.query("SELECT * FROM meeting_schedule WHERE STATUS = 1 AND LOCATION = 'Online';");
        return rows;
    } catch (err) {
        console.log(err);
    } finally {
		await pool.end();
	}
};