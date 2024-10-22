import db from './db.js';

export default async function() {
    const pool = db().pool
    try {
        var rows = await pool.query("SELECT * FROM meeting_schedule WHERE STATUS = 1 AND LOCATION = 'Online';");
    } catch (err) {
        // Print errors
        console.log(err);
    } finally {
		await pool.end();
	}
    return rows;
}