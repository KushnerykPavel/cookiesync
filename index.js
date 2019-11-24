const redis = require("redis");
const SimpleSync = require('./sync');
const http = require('http');
const config = require('./config')
const url = require('url');

const client = redis.createClient({host: "redis"});
const sync = new SimpleSync(client, config.limitRate);
/*
POST data:
set_ttls
'{"3":1,"12":50}'
save_sync
'{"uid":"365402ea-1942-4dc5-a70b-c40467b49e39","partner_id":12,"partner_uid":"4b6b3c9e-82f4-48a7-a87e-8f9e856fe303"}'

GET data:
get_uid:
?partner_id=12&partner_uid=365402ea-1942-4dc5-a70b-c40467b49e39

})
}, 1000)
*/
const storeTtls = (res, body) => {
    let objBody = JSON.parse(body);
    sync.set_ttls(objBody)
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end()
}

const saveSync = (res, body) => {
    let objBody = JSON.parse(body);

    sync.save_sync(  objBody.uid, objBody.partner_id, objBody.partner_uid);
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end()
}

const getUid = (res, body) => {
    sync.get_uid(body.partner_id, body.partner_uid, (err, rez) => {
        res.writeHead(200, {'Content-Type': 'text/plain'})
        res.write(JSON.stringify(rez))
        res.end()
    })
}
const getPartnerUid = (res, body) => {
    sync.get_partner_uid(body.uid, body.partner_id, (err, rez) => {
        res.writeHead(200, {'Content-Type': 'text/plain'})
        res.write(JSON.stringify(rez))
        res.end()
    })
}

const router =  (req, res) => {
    let method = req.method;
    let urlObj = url.parse(req.url);
    switch (method) {
        case 'POST':
            handlePostData(req, res, body => {
            switch (urlObj.pathname) {
                case "/ttls":
                    storeTtls(res, body);
                    break;
                case "/store-sync":
                    saveSync(res, body);
                    break;
            }
            });
            break;
        case 'GET':
            handleGetData(urlObj.query, body => {
            switch (urlObj.pathname) {
                case "/uid":
                    getUid(res, body);
                    break;
                case "/partner-uid":
                    getPartnerUid(res, body);
                    break;
            }
            })
            break;
        default:
            res.writeHead(204, {'Content-Type': 'text/plain'});
            res.end()
    }
};

const handleGetData = (query, cb) => {
    let getObj = {}
    let params = query.split('&')
    for (let pair of params) {
        let [k, v] = pair.split('=')
        getObj[k] = v
    }
    cb(getObj)
}

const handlePostData = (req, res, cb) => {
    let body = '';
    req.on('data', function (data) {
        body += data;

        if (body.length > 1e6)
            req.connection.destroy();
    });

    req.on('end', function () {
        cb(body)
    });
}

const server = http.createServer(router);
server.listen(parseInt(config.port), () => console.log(`Server run in ${config.port}`));