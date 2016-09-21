'use strict';

const net   = require('net');
const yargs = require('yargs');
const http = require('http');
const url = require('url');
const fs = require('fs');

const DEFAULT_PORT = 80;

const argv = yargs.usage('Usage: node $0 (get|post) [-v] (-h "k:v")* [-d inline-data] [-f file] URL')
    // GET
    .command('get [-v] [-h] <URL>', 'Get executes a HTTP GET request for the given URL',
        {
            v: {
                alias: 'verbose',
                type: 'boolean',
                describe: 'shows verbose mode'
            },
            h: {
                alias: 'header',
                type: 'string',
                describe: 'set headers values for request'
            },
            URL: {
                alias: 'url',
                describe: 'The URL for the request',
                type: 'string'
            }
        }
    )
    // POST
    .command('post [-v] [-h] [-d] [-f] <URL>', 'Get executes a HTTP GET request for the given URL',
        {
            v: {
                alias: 'verbose',
                type: 'boolean',
                describe: 'shows verbose mode'
            },
            h: {
                alias: 'header',
                type: 'string',
                describe: 'set headers values for request'
            },
            d: {
                alias: 'data',
                type: 'string',
                describe: 'Associates inline-data to the body HTTP POST request'
            },
            f: {
                alias: 'file',
                type: 'string',
                describe: 'Associates the content of a file to the body HTTP POST request'
            },
            URL: {
                alias: 'url',
                describe: 'The URL for the request',
                type: 'string'
            }
        }
    )
    .argv;

   sendRequest(argv);


    function sendRequest(argv){
        if(argv.URL){
            var parsedURL = url.parse(argv.URL);
            var options = {
                host: parsedURL.hostname,
                port: DEFAULT_PORT,
                path: parsedURL.path,
                method: argv._[0].toUpperCase(),
            };

            setHeaders(options, argv.h);

            var req = http.request(options, (res) => {
                if(argv.verbose){
                    console.log('\nHTTP/'+ res.httpVersion + ' ' + res.statusCode + ' ' + res.statusMessage);
                    console.log(`HEADERS: ${JSON.stringify(res.headers , null, ' ')}`);
                }
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    console.log(`BODY: ${chunk}`);
                });
            });

            req.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
            });
            if(argv._[0] === 'post'){
                var postData = getPostData(argv);
                req.write(postData);
            }

            req.end();
        }else{
            console.log("Invalid URL : "+ argv.url);
        }
    }

    function getPostData(argv){
        if(argv.d && !argv.f){
            return argv.d;
        }else if(argv.f && !argv.d){
            var fileData = fs.readFileSync(argv.f);
            return fileData.toString();
        }else{
            console.log("There is a problem with the data provided");
            process.exit();
        }
    }

    function setHeaders(options, header) {
        if(!options.headers) options.headers = {};
        if(header){
            if(typeof header == 'string'){
                var headerItems = header.split(":");
                options.headers[headerItems[0]] = headerItems[1]; 
            }else{
                argv.h.forEach(function(value) {
                    var headerItems = value.split(":");
                    options.headers[headerItems[0]] = headerItems[1]; 
                });
            }
        }
    }

