const URL = {
    development: {
        API: 'https://daping.wdcloud.cc',
        PASSPORT: 'https://daping.wdcloud.cc',
        // API: 'http://daping-test.xqngx.net',
        // PASSPORT: 'https://daping-test.xqngx.net',
        // API: 'http://daping.xqngx.net',
        // PASSPORT: 'https://daping.xqngx.net',
        // UPLOAD: 'http://192.168.6.141',
        // UPLOAD: 'http://zy-upload.wdcloud.cc',
    },

    production: {
        // API: "http://daping.xqngx.net",
        // PASSPORT: "https://daping.xqngx.net"

        // API: 'http://daping-test.xqngx.net',
        // PASSPORT: 'https://daping-test.xqngx.net',
        // UPLOAD: 'http://192.168.6.141',

        API: 'https://daping.wdcloud.cc',
        PASSPORT: 'https://daping.wdcloud.cc',
        UPLOAD: 'http://zy-upload.wdcloud.cc',
    },
};

export default URL[process.env.NODE_ENV];
