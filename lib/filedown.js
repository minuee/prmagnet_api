
const S3_BUCKET_NAME = "fpr-prod-file";

async function sendImageDownload(req, dirname, filename) {

    const full_path = `public/${dirname}/${filename}`;
    console.log(req.s3);
    const url = await req.s3.getSignedUrl({
        key: full_path,
        bucket: S3_BUCKET_NAME,
        expires: 60,
    });

    return url;
}

module.exports = { sendImageDownload };

/*
{"success":false,"data2":{"s3":{"config":{"credentials":{"expired":false,"expireTime":null,"refreshCallbacks":[],"accessKeyId":"ASIAUZDSPFPYRYAREMPJ","sessionToken":"IQoJb3JpZ2luX2VjEAQaDmFwLW5vcnRoZWFzdC0yIkgwRgIhAKjYrjddpfYZX/6g2cBQvroGY3FE+AWeDtvBljAIwGblAiEAzOZX/TO7ZjCgTZ97iLdmS07GIKECo+DwIqACeUusPzYqpAIInf//////////ARABGgwzMjg4MDUwNjc3NjEiDMHsq8P5EAB66iKozir4AQ/PZH1BhpzPtNwrDvM+IO+Faw+OGGC/DakcsLechpjojoc0lFXbHa21u9xaSm4zBIpADGulUGrx3vFgqxISiHX5o8zrwUcW55UwDUTHNQRuu0QNml+cSaQniEHb9NPJ4WAEDV1eSdtAsDTSqJ1z84QqDYBqsmPNb0u/Z0kCWrP6qUabsyUyTf2zz1IWL2CooKksOVGEjGKg0UG644RIVZmeF9pjY5XlajXMr9nBX62JrErcewrthQRSNnPP4PsdmY/7IYWui9MnNKdK0GvpJyXT2vD43nzC1LxQ/IoLgR7oUliKe0DARBOPwS/h6ifzbjIcm8mZVkbeMIO/6IsGOpkBR1yxLb4MnhqWqLIRoMUEA67sIX48m3GJiCHHJFfyV9gwjtnWZQHdWaXcyUNd6spy91c6QhhTlkcJmcitVOa/bbr9Cyg0Rjeei2YIYJY67fAR/7of6q+wTeEvKqHWwM9jM+PXltDDGVsx9LHSeOx7FFtCOzTeT0fIygOhl+RdPOq+gLS7BIG4NubDHWitfgsljM11kaUB2yqH","envPrefix":"AWS"},"credentialProvider":{"providers":[null,null,null,null,null,null,null],"resolveCallbacks":[]},"region":"ap-northeast-2","logger":null,"apiVersions":{},"apiVersion":null,"endpoint":"s3.ap-northeast-2.amazonaws.com","httpOptions":{"timeout":120000},"maxRedirects":10,"paramValidation":true,"sslEnabled":true,"s3ForcePathStyle":false,"s3BucketEndpoint":false,"s3DisableBodySigning":true,"s3UsEast1RegionalEndpoint":"legacy","computeChecksums":true,"convertResponseTypes":true,"correctClockSkew":false,"customUserAgent":null,"dynamoDbCrc32":true,"systemClockOffset":0,"signatureVersion":"v4","signatureCache":true,"retryDelayOptions":{},"useAccelerateEndpoint":false,"clientSideMonitoring":false,"endpointCacheSize":1000,"hostPrefixEnabled":true,"stsRegionalEndpoints":"legacy"},"isGlobalEndpoint":false,"endpoint":{"protocol":"https:","host":"s3.ap-northeast-2.amazonaws.com","port":443,"hostname":"s3.ap-northeast-2.amazonaws.com","pathname":"/","path":"/","href":"https://s3.ap-northeast-2.amazonaws.com/"},"_events":{"apiCallAttempt":[null],"apiCall":[null]},"_clientId":2}},"error":"TypeError: req.s3.getObject is not a function"}
*/