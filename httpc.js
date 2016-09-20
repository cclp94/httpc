'use strict';

const net   = require('net');
const yargs = require('yargs');

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
            url: {
                describe: 'The URL for the request',
                type: 'string'
            }
        }
    )
    // POST
    .command('post [-v] [-h] [-d] [-f] <url>', 'Get executes a HTTP GET request for the given URL',
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
            url: {
                describe: 'The URL for the request',
                type: 'string'
            }
        }
    )
    .argv;

    console.log(argv);

    var requestType = argv._[0];

    (requestType && requestType == 'get') ? getRequest(argv) : postRequest(argv);


    function getRequest(argv){
        if(isValideURL(argv.url)){
            console.log(argv.url);
        }else{
            console.log("Invalid URL : "+ argv.ur);
        }
    }

    function postRequest(argv){
        if(isValideURL(argv.url)){
            console.log(argv.url);
        }else{
            console.log("Invalid URL : "+ argv.ur);
        }
    }

    function isValideURL(url){
        return /http:\/\/\w+\.\w*/.test(url);
    }

    function getURLArguments(url){
        var args = [];
        if(/?/.test(url)){
            url.match("?+").substr(1).split("&").forEach(value => {
                var keyValue = value.split('=');
                args.push({
                    keyValue[0] : keyValue[1]
                });
            })
        }
        return args;
    }

