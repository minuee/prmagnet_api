const admin = require("firebase-admin");

const fcm_info = {
  type: "service_account",
  project_id: "prmagnet-4fcbd",
  private_key_id: "da395b63c2ae5c99a3725f524162d77ddd1db3d0",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDbxIEYifQk19lK\ncEAPhzBHFyymHElURa1k/sIhV8SEED6CKNiyNJPl+n7+qZZMUwOCusHMQsiYslnI\nMWzae5WHgoQ+HfXVmawrc/Kf+ZpPtkv/9NoWGLGe8kFnlesPtO/P742m+SUbvDIw\nUHRsfZK4BHNPbwhLpOuIyxWNPs1pZ39ZCsBncWofL8Ld6dXaqJOcHgwJ0Kls0vBn\ny7dDUqrQyms4uQRAb+cAuPpOtumzJpeQGiCGGPi2klT3Hua6ADqdWFPx8wXxDFKJ\nX4j/N5yylHKT6iBuzUAxeyOchwqDYQ7I5vHXYSdMgDNeQR16G42AZSabXwBXcu19\nVU2gXbmfAgMBAAECggEACHqZ4nj8FunPA9y11AOKvMtrmRMRTzOK/5EGq2On/NJl\nnv71cVau+BoEiU3AszwmsAYFkRxogd+rsBocEYfgGoTSFlVwlSejKWAFVd+68OVf\nJEZtnZmhTLkbBeSWV5pLAFJFPFJzeJD3vL5153Om0/uz+TYW81gvEC2JrNPl9/GI\nciQkeh33I3JVS0vGuRjZ869L9ouS9QCx+pgjR2R2VBZvPKBCSCUOcd/iAme3l+WW\nmBsDVTXOrumcO4a+cL1tSvlmPGYgsCzWg/ihmdHL6C3ZFZBSyU3NsJGEhrap0t/M\noqvsoQ6ovH2vBc9xIthkk4PnvXrFzYaFCiPYYB3pSQKBgQD+5eq7LFWe03Mnma/3\nWyXLhDDwdK0ZKHLbipSBidRS5xA7s3YLpYFO5JKfgyP/A5l1LAoOX1wgjv/Wss9+\nrMt1x2fOJbyi1o+BwNxqeurJHOa6CQP5ja3b5B4DDoBGBQ1EE686o+D3egHuug47\nzt0PdXKZZG+eIjmwo9T6BCecWQKBgQDct7XNNzdoihtmGXFMnZ+7ovZOX5N9lFgV\nvvti7YJr52wxihI7CD5D+1AhXBRPHCtu3MmcLWfb+sq4eCaBqxzFMzfUO6Wys99O\n9HAg2bYZZWi+7hQh9MFVyVF5bNln2YmNaA/yOrXrKZKd/c4LzwgUp7p8eFatJnWs\nwruNx53mtwKBgQDlSVxE0jSSkhJb5Nts3gi5cUe0hL/QiZoH8jhz7c+YY1Eu4tek\n0lPm66UY55ZRpqM7y0mgdBcjEn8AWghcIoNChwTRYxC0Sdz9Escy4S6hieXiIon4\nyYFC84grp7erRJASVMKjNRcAhjeGzsZO9l3TsgpMARSGYrMSOc0yuNoIwQKBgAgH\nZsWgTJOw8m40Xrq6wSTCONOBBox66PlhiSOAIE5sjLMAoski86Dlc3TDNLnr/Gh7\n/5l+zVhjNxyewkfVQaaqxk0iHlTx1h25JpsLUGR8G+NWJcVWcfH88MnJ+96bOzW5\no1rcZ+G2EW9N3EDxtwmJUG9WsVB7JayzKL9vk37hAoGAIkx8AUcXS9EYr9ogsSYA\nipY3Y4ku5/RqkT2dFj0kTnUJudLxOGA9NIPlpcKOaC5h2Z0FwPj1IAa03MJHuJs4\nfWLEdofS3vAPEHYuITNW+zffgabq6XbhUxDvEGL0FRfcR7nx5cGiT2kMPyTXKfS6\nOVbR2Myss0E1pembHKjrNiI=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-jzghw@prmagnet-4fcbd.iam.gserviceaccount.com",
  client_id: "101447302999365259627",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-jzghw%40prmagnet-4fcbd.iam.gserviceaccount.com",
};

admin.initializeApp({
  credential: admin.credential.cert(fcm_info),
  databaseURL: "",
});

const subscribeSubject = async () => {
  var registrationTokens = [
    "e91ee5RRnH8:APA91bGKbuOxRV9Hk1PnHaqTTCG3HVaPEjq6hbkiKaoDvWtPggqbeCoXuKy03RRl3Ga920fubYwn1OWkz5hExWcL61-mOx-aPaq_FOOi4BUC3w_M93QeXB4MaA2FzrHoIbCUEaI54opm",
    "cXK4EmZQLLw:APA91bG7SCg1VU120JMgpxCILufSs-KfFuhZ3FBqn5SEFetsy6sQcwrDi24H2WRLK4JWkeIWQx3iSb8weGfHVjtkgLU1_7n8vQwziIX1Bq10E_e5Gx5vmaORNxcSZIBBzf11E--YZ8sY",
  ];

  // Subscribe the devices corresponding to the registration tokens to the
  // topic.

  var topic = "test_ppap";
  var data = await admin
    .messaging()
    .subscribeToTopic(registrationTokens, topic);

  //console.log(data);

  return data;
};

const sendSubject = async () => {
  var topic = "test_ppap";

  // See documentation on defining a message payload.
  var message = {
    notification: {
      body: "test_ppap --ttttt",
      title: "tttt",
    },
    topic: topic,
  };

  // Send a message to devices subscribed to the provided topic.
  var data = await admin.messaging().send(message);
  //console.log(data);

  return data;
};

// 메세지 전송
const sendMessage = async (push_token, data) => {
  const message = {
    data: {},
    notification: {
      body: data.message,
      title: "PR MAGNET 알림",
    },
    token: push_token,
  };

  const send = await admin.messaging().send(message);
  //console.log(send);

  return data;
};

const firebase = async (req, res, next) => {
  req.sendMessage = sendMessage;
  //req.sendMsg = sendMsg;
  //req.sendMsgV2 = sendMsgV2;
  req.subscribeSubject = subscribeSubject;
  req.sendSubject = sendSubject;
  req.firebaseAdmin = admin;
  next();
};

module.exports = firebase;
