var http = require('http');
var https = require('https');
const fs = require('fs')


http.createServer(onRequest).listen(3000);

function onRequest(client_req, client_res) {
    const localPath=`.${client_req.url}`.split('?')[0];
    

    if (fs.existsSync(localPath)) {

        console.log('serve: ' + client_req.url + `(${localPath})`);

        const contentTypes={
            'html': 'text/html',
            'js': 'application/javascript',
            'css': 'text/css',
            'json': 'application/json',
            'svg': 'image/svg+xml',
        }

        let contentType='text/plain';
        const ext=localPath.split('.')[2];

        if (ext && contentTypes[ext]) {
            contentType=contentTypes[ext];
        }

        const body=fs.readFileSync(localPath)
        client_res.setHeader('Content-Type', contentType);
        client_res.writeHead(200);
        client_res.end(body);

    } else {
        console.log('serve: ' + client_req.url + `(remote)`);
        const options = {
            hostname: process.argv[2],
            path: client_req.url,
            port: 443,
            method: client_req.method,
            headers: client_req.headers
          };
        
          options.headers.host=options.hostname;
        
          var proxy = https.request(options, function (res) {
            client_res.writeHead(res.statusCode, res.headers)
            res.pipe(client_res, {
              end: true
            });
          });
        
          client_req.pipe(proxy, {
            end: true
        });
    }
}