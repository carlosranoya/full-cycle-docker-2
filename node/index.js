var config = require('./config');
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var database = require('./database')


async function intitializeServer() {

    try {
        await database.init()
    }
    catch (e) {
        console.log("Connection to DB failed. Trying again is 3 seconds");
        setTimeout(intitializeServer, 3000);
        return;
    }

    var server = http.createServer(function(req, res){

        var parsedUrl = url.parse(req.url, true);
        var path = parsedUrl.pathname;

        // "limpar" o path
        var trimmedPath = path.replace(/^\/+|\/+$/g, '');

        var queryStringObject = parsedUrl.query;
        var method = req.method.toLowerCase();
        var headers = req.headers;

        var decoder = new StringDecoder('utf-8');
        var buffer = '';
        req.on('data', function(data) {
            buffer += decoder.write(data);
        });
        req.on('end', function() {
            
            var router = routers[method];
            buffer += decoder.end();
            var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
            var data = {
                'trimmedPath' : trimmedPath,
                'queryStringObject' : queryStringObject,
                'method' : method,
                'headers' : headers,
                'payload' : buffer
            };

            chosenHandler(data, function(statusCode, payload, contentType){

                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
                var payloadString = typeof(payload) == 'object'? JSON.stringify(payload) : payload;
                if (contentType)
                    res.setHeader('Content-Type', contentType);
                res.writeHead(statusCode);
                res.end(payloadString);
                console.log("Returning this response: ", statusCode, payloadString);

            });

        });
    });

    //////// Start the server
    server.listen(config.port, function(){
    console.log(`The server is up and running at port ${config.port}`);
    });

}

//////// route handlers

var handlers = {};

handlers.sample = function(data, callback){
    callback(406, { name: 'sample handler' });
};

handlers.getPeople = function(data, callback){
    database.getPeople(function (err, result, fields) {
        if (err) {
            callback(400, { msg: "Error connecting to database. "}, 'application/json');
            return;
        }
        callback(200, result, 'application/json');
    })

};

handlers.deletePerson = function(data, callback){
    
    if (!data.payload) {
        callback(400, { msg: "Invalid payload." }, 'application/json');
        return;
    }

    try {
        var payload = JSON.parse(data.payload)
    }
    catch (error) {
        callback(400, { msg: "Invalid payload." });
        return;
    }
    console.log("delete payload: ", payload);

    if (!payload.id) {
        callback(400, { msg: "Invalid payload. 'id' field absent." });
        return;
    }

    database.deletePerson(payload.id, function (err, result, fields) {
        if (err) {
            callback(400, { msg: "Error connecting to database. "}, 'application/json');
            return;
        }
        callback(204, result, 'application/json');
    })
};

handlers.index = function(data, callback){
    
    database.getPeople(function (err, result, fields) {
        if (err) {
            callback(400, { msg: "Error connecting to database. "}, 'application/json');
            return;
        }
        let html = `
        <html>
        <style>
            table, th, td {
                border:1px solid black;
            }
        </style>
        <body>

            <h2>Full Cycle !!!</h2>
            </br>
            <table style="width:60%">
                <tr> 
                    <th>id</th>
                    <th>name</th>
                </tr>
        `;
        for (var i=0; i < result.length; i++) {
            html += `
                <tr>
                    <td align="center">${result[i].id}</td>
                    <td align="center">${result[i].name}</td>
                </tr>
            `;
        }
        html += `
            </table>
        </body>
        </html>
        `
        callback(200, html, 'text/html')
    })

};

handlers.postPerson = function(data, callback){
    
    if (!data.payload) {
        callback(400, { msg: "Invalid payload." }, 'application/json');
        return;
    }

    try {
        var payload = JSON.parse(data.payload)
    }
    catch (error) {
        callback(400, { msg: "Invalid payload." });
        return;
    }
    console.log("post payload: ", payload);

    if (!payload.name) {
        callback(400, { msg: "Invalid payload. 'name' field absent." });
        return;
    }

    database.postPerson(payload.name, function (err, result, fields) {
        if (err) {
            callback(400, { msg: "Error connecting to database. "});
            return;
        }
        callback(200, result[0], 'application/json');
    })

};

handlers.notFound = function(data, callback){
    callback(404, { msg: "Resource not found." }, 'application/json');
};

var routers = {
    'get' : {
        'sample' : handlers.sample,
        'people' : handlers.getPeople,
        ''  : handlers.index,
        'index'  : handlers.index,
        'index.js'  : handlers.index,
        'index.html'  : handlers.index,
        'index.php'  : handlers.index
    },
    'post' : {
        'person' : handlers.postPerson
    },
    'delete' : {
        'person' : handlers.deletePerson
    }
}


intitializeServer();