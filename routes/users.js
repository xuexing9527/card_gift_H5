var router = require('koa-router')();
var userModel = require('../db/user');
var async = require('async');
// 加密
var md5 = require('md5')
var jwt = require('jsonwebtoken');

router.prefix('/users');

router.get('/', function *(next) {
    this.body = 'this is a users response!';
});

router.get('/bar', function *(next) {
    this.body = 'this is a users/bar response!';
});

const resBody = (code, msg) => ({ code, msg });

// POST '/login' 登录页
router.post('/login', function *(next) {
    const ctx = this;
    const { card_code, card_pwd, company_code } = ctx.request.body;

    // console.log(ctx.request.body);
    // console.log(ctx.request);

    if(!card_code){
        ctx.body = resBody(1, '卡号不能为空');
        return
    }
    if(!card_pwd){
        ctx.body = resBody(1, '密码不能为空');
        return
    }
    if(!company_code){
        ctx.body = resBody(1, '企业码不能为空');
        return
    }

    yield userModel.findDataByCardCode(card_code).then((result) => {
        // console.log(result)
        // console.log(result[0])
        if (!result.length) {
            ctx.body = resBody(1, '卡号错误, 请核对卡号信息!');
            return;
        }
        if (result.length > 1) {
            ctx.body = resBody(1, '卡号存在多个!');
            return;
        }
        if (card_pwd !== result[0].card_pwd) {
            ctx.body = resBody(1, '密码错误!');
            return;
        }
        if (company_code !== result[0].company_code) {
            ctx.body = resBody(1, '企业码错误!');
            return;
        }
        // ctx.session.card_code = card_code;
        const secret = 'xx';
        const payload = { card_code };
        const token = jwt.sign(payload, secret, { expiresIn:  '30d' });
        console.log(token);
        console.log(jwt.decode(token));
        ctx.body = resBody(0, { token: token });
    })
});

router.get('/detail', function *(next) {
    const ctx = this;
    const { token } = ctx.header;
    const info = jwt.decode(token)
    if (token && info) {
        const { card_code } = info;
        yield userModel.findDataByCardCode(card_code).then((result) => {
            if (!result.length) {
                ctx.body = resBody(1, '卡号错误, 请核对卡号信息!');
                return;
            }
            if (result.length > 1) {
                ctx.body = resBody(1, '卡号存在多个!');
                return;
            }
            ctx.body = resBody(0, result[0]);
        })
    } else {
        ctx.body = resBody(10001, '登录失效，请重新登录!');
    }
});

module.exports = router;
