export default {
    coverWechatCss(callback, type = 'pc') {
        const content = '.impowerBox .qrcode {width: 120px;}.impowerBox .title {display: none;}.impowerBox .info {width: 210px;}.status_icon {display: none}.impowerBox .status {text-align: center;}.impowerBox .js_wx_default_tip p:nth-child(2){ display:none}';
        const bsContent = '.impowerBox .qrcode {width: 176px;}.impowerBox .title {display: none;}.impowerBox .info {width: 200px;}.status_icon {display: none}.impowerBox .status {text-align: center;font-size: 28px; color: white}.impowerBox .status p {text-align: center;font-size: 28px; color: white}.impowerBox .info {width: 400px}';
        const blob = new Blob([type === 'pc' ? content : bsContent], {
            type: 'text/css;charset=utf-8',
        });
        const reader = new FileReader();

        reader.readAsDataURL(blob);
        // eslint-disable-next-line func-names
        reader.onload = function () {
            callback(this.result);
        };
    },
};
