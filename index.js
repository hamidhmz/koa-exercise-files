const Koa = require('koa');
const _ = require('koa-route');
const helmet = require("koa-helmet");
const app = new Koa();
const PORT = 3000;

app.env = 'production';
// app.keys = ''
app.proxy = true;
// app.maxIpsCount = 1;
app.use(helmet());

app.on('error', (err, ctx) => {
    console.log('server error', err, ctx)
});

const db = {
    tobi: { name: 'tobi', species: 'ferret' },
    loki: { name: 'loki', species: 'ferret' },
    jane: { name: 'jane', species: 'ferret' }
};

const pets = {
    list: (ctx) => {
        const names = Object.keys(db);
        ctx.body = 'pets: ' + names.join(', ');
    },

    show: (ctx, name) => {
        const pet = db[name];
        if (!pet) return ctx.throw('cannot find that pet', 404);
        ctx.body = pet.name + ' is a ' + pet.species;
    }
};

app.use(_.get('/pets', pets.list));
app.use(_.get('/pets/:name', pets.show));

// logger

app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// response

app.use(async ctx => {
    console.log(ctx.request.query); // is the Context
    // ctx.throw(400, 'name required', { user: 'user' });
    console.log(ctx.request); // is a Koa Request
    console.log(ctx.response); // is a Koa Response
    ctx.body = 'Hello world';
    // With Content-Type: text/html; charset=utf-8
    console.log('ctx.is', ctx.is('html')); // => 'html'
    ctx.is('text/html'); // => 'text/html'
    ctx.is('text/*', 'text/html'); // => 'text/html'

    // When Content-Type is application/json
    ctx.is('json', 'urlencoded'); // => 'json'
    ctx.is('application/json'); // => 'application/json'
    ctx.is('html', 'application/*'); // => 'application/json'

    console.log('ctx.is', ctx.is('html')); // => false
    switch (ctx.accepts('json', 'html', 'text')) {
        case 'json': console.log('json'); break;
        case 'html': console.log('html'); break;
        case 'text': console.log('text'); break;
        default: ctx.throw(406, 'json, html, or text only');
    }
});

app.listen(PORT, () => { console.log(`listen to port: ${PORT} `); });