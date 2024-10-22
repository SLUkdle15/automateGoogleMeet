// Import axios (if you're in a Node.js environment)
import axios from 'axios';

const options = {
    method: 'POST',
    url: 'http://chat-api-dev.campdi.vn/api/meeting/summary',
    data: {
        "eventId": "test",
        "summary": "noi dung test"
    }
};

try {
    const {data} = await axios.request(options);
    console.log(data);
} catch (error) {
    console.error(error);
}