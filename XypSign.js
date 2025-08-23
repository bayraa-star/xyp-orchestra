const fs = require('fs');
const crypto = require('crypto');

class XypSign {
    constructor(keyPath, accessToken) {
        this.keyPath = keyPath;
        this.accessToken = accessToken;
    }

    sign(){
        const pkey = fs.readFileSync(this.keyPath, 'utf8');
        const timeStamp = Math.floor(Date.now() / 1000);
        const sign = crypto.createSign('SHA256');
        sign.update(this.accessToken + '.' + timeStamp);
        const signature = sign.sign(pkey, 'base64');
        return {
            accessToken: this.accessToken,
            timeStamp: timeStamp,
            signature: signature,
        };
    }
}

module.exports = XypSign;