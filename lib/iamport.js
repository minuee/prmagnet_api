const axios = require("axios");

// 아임포트 결제용 모듈
module.exports = {
    // 액세스 토큰 발급
    getAccessToken: async () => {
        return await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post", // POST method
            headers: { "Content-Type": "application/json" },
            data: {
                imp_key: "2292794227334735",//"3607954518520262", // REST API키 by nsn
                imp_secret: "579b997fabb241b797dca65dc7a27e200d50c92fff4806700943b9eb2a264138da2a036b3718a51e"
                    //"BhkwwiVPZ1DUz4rJX0X3eDhGHXFlVyXwQi3mAYbzZOtyTViQWfUaTbQA9wW55UCVcFhMEtmEiQccLv3H",
            },
            /* data: {
                imp_key: "2292794227334735", // REST API키 by who?
                imp_secret:
                    "579b997fabb241b797dca65dc7a27e200d50c92fff4806700943b9eb2a264138da2a036b3718a51e",
            }, */
        });
    },
    // 재결제(정기결제)
    paymentAgain: async (option) => {
        console.error("테스트, ", JSON.stringify(option), option.price);

        if (option.price !== 0) {
            return await axios({
                url: `https://api.iamport.kr/subscribe/payments/again`,
                method: "post",
                headers: { Authorization: option.access_token }, // 인증 토큰 Authorization header에 추가
                data: {
                    customer_uid: option.customer_uid,
                    merchant_uid: option.merchant_uid, // 새로 생성한 결제(재결제)용 주문 번호
                    amount: option.price,
                    name: "정기구독",
                },
            });
        } else {
            return {
                data: {
                    code: 0,
                    message: "체험판 구독",
                    response: { status: "paid" },
                },
            };
        }
    },
};
