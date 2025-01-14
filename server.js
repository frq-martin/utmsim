console.log('UTM Drone Sim Server running');

const express = require('express');
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const app = express();

app.use(express.static('public'));
app.use(express.json({limit: '50mb'}));

const alerts = [];
const OPs = [];

app.listen(8080, () => {
    console.log('listening on 8080');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/simulate', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(req.body),
        redirect: 'follow'
    };

    fetch("https://telemetry-endpoint.utm-labs-frequentis.com/pose", requestOptions)
        .then(response => response.text())
      //  .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});

app.post('/alerts', (req, res) => {

    alerts.push(req.body);

    if (alerts.length > 100) {
        alerts.shift();
    }

    res.status(201).json({
        result: "27"
    });
});


app.post('/OPs', (req, res) => {

    OPs.push(req.body);

    if (OPs.length > 100) {
        OPs.shift();
    }

    res.status(201).json({
        result: "27"
    });
});


app.post('/ackAlert', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];

    ack = new Object();
    ack.status = "ACKNOWLEDGED";

    alerts.forEach(function (alert) {
        alert.operation_plans.forEach(function (op) {

            if (op === req.body.opID) {
                ack.message_id = alert.message_id;
            }
        });
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(ack),
        redirect: 'follow'
    };

    fetch("https://alerting-endpoint.utm-labs-frequentis.com/processAck", requestOptions)
        .then(response => response.text())
        // .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});

app.post('/declareEndOfFlight', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];

    ack = new Object();
    ack.operationPlanId = req.body['operationPlanId'];

    let thisop = OPs.find(thisop => thisop.operationPlanId === ack.operationPlanId);
    
    ack.operationPlanVersion = thisop.version;

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(ack),
        redirect: 'follow'
    };

    fetch("https://operation-service.utm-labs-frequentis.com/api/declareEndOfFlight", requestOptions)
        .then(response => response.text())
         .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});



app.post('/flightplan', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(req.body),
        redirect: 'follow'
    };

    fetch("https://operation-service.utm-labs-frequentis.com//api/authorizeOperationPlan", requestOptions)
        .then(response => response.text())
       .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});

app.post('/takeoff', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(req.body),
        redirect: 'follow'
    };

    fetch("https://operation-service.utm-labs-frequentis.com/api/activateOperationPlan", requestOptions)
        .then(response => response.text())
       .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});

app.post('/computeVolumeFromTrajectory', async (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(req.body),
        redirect: 'follow'
    };

    const result = await fetch("https://operation-service.utm-labs-frequentis.com/api/computeVolumeFromTrajectoryAndMinimumSeparation", requestOptions)
        .then(response => response.text())
        .then(result => {
            res.status(201).json(result);
            console.log(result)
        })
        .catch(error => console.log('error', error));
});

app.post('/authutm', (req, res) => {
    authUTM(req, res);
});

function authUTM(req, res) {
    client = req.body.client;
    secret = req.body.secret;

    fetch('https://keycloak-airlabs.utm-labs-frequentis.com/auth/realms/swim/protocol/openid-connect/token', {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + client + '&client_secret=' + secret,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (resp) {
        return resp.json();
    }).then(function (data) {
        //console.log('token', data);
        res.status(201).json(data);
    }).catch(function (err) {
        // Log any errors
        console.log('something went wrong', err);
        res.status(400).json(err);
    });
}