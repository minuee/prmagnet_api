const URL = `https://directsend.co.kr/index.php/api_v2/sms_change_word`;
const axios = require("axios");

async function send(phone, text) {
  const obj = {
    title: "title",
    message: null,
    sender: "0312021623",
    username: "Prmagnet",
    receiver: [{ name: "unknown", mobile: null }],
    key: "HxWxMoztFnK1VQ9",
  };

  obj.receiver[0].mobile = phone.replace("-", "");
  obj.message = text;

  ////console.log(JSON.stringify(obj));

  try {
    const res = await axios({
      url: URL,
      method: "post",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
        charset: "utf-8",
      },
      data: obj,
    });
    //console.log("문자인증 결과");
    //console.log(res.data);
    return res;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = send;
