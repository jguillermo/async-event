'use strict';
const fs = require('fs');


module.exports.document = async (event, context) => {
    let html = await fs.readFileSync("./doc/api.html");
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: html.toString(),
    };
};
