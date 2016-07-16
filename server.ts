import express = require('express');
import bodyParser = require('body-parser');
import deed = require('deed');

const port = process.env.PORT || 5000;
let app = express();

const facebookPath = '/facebook';
const facebookVerifyToken = process.env['FACEBOOK_VERIFY_TOKEN'];
const facebookSecret = process.env['FACEBOOK_APP_SECRET'];

app.get(facebookPath, (req, res) => {
    if (req.query['hub.verify_token'] === facebookVerifyToken) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

const verifyAndParseBody: express.RequestHandler = (req, res, next) => {
    /*
     * Both deed and bodyParser.json() consume the request body.
     * Because the body is given in node's stream which cannot be read twice,
     * app.use()-ing one after another won't work.
     */

    let verify = new Promise<boolean>((f, r) => {
        deed(facebookSecret, req, (err: Error) => {
            if (!err) {
                f(true);
            } else {
                console.log("deed: %s", err.message);

                f(false);
            }
        });
    });

    let parse = new Promise((f, r) => {
        bodyParser.json()(req, res, () => {
            f();
        });
    });

    verify.then((verified) => {
        if (verified) {
            parse.then(next);
        } else {
            res.sendStatus(403);
        }
    })
};

app.post(facebookPath, verifyAndParseBody, (req, res) => {
    let data = req.body;

    for (let entry of req.body.entry) {
        for (let messagingEvent of entry.messaging) {
            console.info("user id: ", messagingEvent.sender.id);
        }
    }

    res.sendStatus(200);
})

app.listen(port);
