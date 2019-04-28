'use strict';
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');


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

function publish(event_data, event_name) {
    AWS.config.update({region: process.env.REGION});
    var sns = new AWS.SNS({apiVersion: '2010-03-31'});
    const SNS_URL = process.env.SERVICE_SNS_URL;
    let params = {
        Message: JSON.stringify(event_data),
        TopicArn: SNS_URL,
        MessageAttributes: {
            event_type: {
                DataType: "String",
                StringValue: event_name
            }
        }
    };
    return sns.publish(params).promise();
}

module.exports.send = async (event, context) => {

    try {
        let params = JSON.parse(event.body);
        if (params==null){
            throw 'Envia parametros para el evento';
        }
        if (!params.hasOwnProperty('transaction_id')){
            throw 'Tienes que enviar el transaction_id';
        }
        if (!params.hasOwnProperty('name')){
            throw 'Tienes que enviar el nombre del evento';
        }
        if (params.name.trim()==''){
            throw "Tienes que enviar el nombre del evento 'name'";
        }

        if (!params.hasOwnProperty('attributes')){
            throw "Tienes que enviar los atributos del evento, id, description, ... 'attributes'";
        }
        let date = new Date();
        /*let params = {
            transaction_id: uuidv4(),
            name: 'pepe.question.create.start',
            attributes: {
                id: 'question_id',
                title: 'pregunta 1',
                author: 'jose'
            },
            meta: {
                server: 'pepe-api'
            }
        };*/
        let event_data = {
            transaction_id: params.transaction_id,
            event: params.name,
            occurred_on: date.toJSON(),
            timestamp: date.getTime(),
            attributes: params.attributes,
            meta: params.meta
        };
        let data = await publish(event_data, params.name);
        return get_response(201, true, 21, '', data);
    } catch (err) {
        console.error(err);
        return get_response(500, false, 5, err, {});
    }
};

