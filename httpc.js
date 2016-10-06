'use strict';

const net   = require('net');
const yargs = require('yargs');
const url = require('url');
const fs = require('fs');

const DEFAULT_PORT = 80;

const argv = yargs.usage('Usage: node $0 (get|post) [-v] (-h "k:v")* [-d inline-data] [-f file] URL [-o save reply to file]')
    // GET
    .command('get [-v] [-h] <URL> [-o]', 'Get executes a HTTP GET request for the given URL',
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
            },
            o: {
                describe: 'Save Reply message to File',
                type: 'string'
            }
        }
    )
    // POST
    .command('post [-v] [-h] [-d] [-f] <URL> [-o]', 'Get executes a HTTP GET request for the given URL',
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
            },
            o: {
                describe: 'Save Reply message to File',
                type: 'string'
            }
        }
    )
    .argv;

    var parsedURL = url.parse(argv.URL);

    const client = net.createConnection({host: parsedURL.host, port: DEFAULT_PORT});

    client.on('connect', () => {
         if(argv.URL){

            var options = {
                host: parsedURL.hostname,
                port: DEFAULT_PORT,
                path: parsedURL.path,
                method: argv._[0].toUpperCase(),
                headers: argv.h
            };

            setHeaders(options, argv.h);
            if(argv._[0] === 'post'){
                var postData = getPostData(argv);
                options.body = postData;
            }

             client.write(options.method + ' ' + options.path + ' ' + 'HTTP/1.1\r\n'+
            'Host: '+ options.host+'\r\n'+
            'Port: '+options.port+'\r\n'+
            ((options.headers) ? options.headers +'\r\n': '' )+
            ((options.body && !options.headers.includes('Content-Length') )? 'Content-Length: ' + options.body.length +'\r\n': '')+ 
            '\r\n'+
            (options.body ? options.body +'\r\n\r\n': '\r\n') );
         }
    });


    client.on('data', res => {
        var ParsedResponse = res.toString().split('\r\n\r\n');
        if(argv.o){
            fs.writeFileSync(argv.o, ParsedResponse[1]);
        }else{
            if(argv.verbose){
                console.log(ParsedResponse[0]);
            }
            console.log('\n'+ParsedResponse[1]);
        }
        client.end();
    });

    client.on('error', err => {
    console.log('socket error %j', err);
    process.exit(-1);
    });

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
         if(!options.headers) options.headers = '';
         if(header){
             if(typeof header == 'string'){
                 options.headers = header;
             }else{
                 options.headers = header.join('\r\n');
             }
         }
     }

