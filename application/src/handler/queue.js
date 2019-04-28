'use strict';
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');
const axios = require('axios');

function get_response(statusCode, success, code, message, data) {
    return {
        statusCode,
        body: JSON.stringify({
            success,
            code,
            message,
            data
        }),
    }
}

function persist_info(event_data) {
    const dynamo = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: process.env.EVENT_STORAGE_DB,
        Item: event_data
    };
    return dynamo.put(params).promise();
}

async function process_url(url, params) {
    try {
        let rpta = await axios.post(url, params);
        console.log(rpta.data);
        console.log(JSON.stringify(rpta.data));
        console.log(typeof rpta.data);
        return rpta.data;
    } catch (error) {
        console.error(error);
        throw `Error en procesar la API de eventos`;
    }
}

/*
{
    "transaction_id": "04b1aeec-8855-4f43-bb8c-7eef8ef15f8d",
    "event": "pepe.question.create.start",
    "occurred_on": "2019-04-25T02:02:37.109Z",
    "timestamp": 1556157757109,
    "attributes": {
        "id": "question_id",
        "title": "pregunta 1",
        "author": "jose"
    },
    "meta": {
        "server": "pepe-api"
    }
}
* */
module.exports.event_storage = async (event, context) => {

    try {
        let event_data = JSON.parse(event.Records[0].body);
        event_data['eventId'] = uuidv4();
        event_data['atributonuevo2'] = uuidv4();
        await persist_info(event_data);
    } catch (err) {
        return get_response(500, false, 5, err, {});
    }
};

module.exports.first_app = async (event, context) => {

    let event_data = JSON.parse(event.Records[0].body);
    let url = 'https://api-qa.lacafetalab.pe/v1/pepe/events';
    let data = await process_url(url, event_data);
    if (data.data != 'ok') {
        throw `no se pudo procesar el evento`;
    }

};

module.exports.demo_event = async (event, context) => {
    let url = 'https://api-qa.lacafetalab.pe/v1/pepe/events';
    let event_data = {
        demo: 'demo',
        params: 'params'
    };
    let data = await process_url(url, event_data);
    if (data.data != 'ok') {
        throw `no se pudo procesar el evento`;
    }
    return get_response(201, true, 21, '', data);
};




