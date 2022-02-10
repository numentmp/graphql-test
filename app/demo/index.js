const elSql = document.querySelector('#sql');
const elQuery = document.querySelector('#query');
const elVars = document.querySelector('#variables');
const elResponseHeader = document.querySelector('#response .panel-header');
const elResponseData = document.querySelector('#response .editor');

let endpoint = 'profile';

function toJson(data) {
    return JSON.stringify(data, null, 2);
}

function eToStr(msg, e) {
    return msg + ' exception:\n' + e;
}

function responseOk(data) {
    elResponseHeader.classList.remove("panel-red");
    elResponseHeader.classList.add("panel-green");
    elResponseData.value = data;
}

function responseError(data) {
    elResponseHeader.classList.remove("panel-green");
    elResponseHeader.classList.add("panel-red");
    elResponseData.value = data;
}

function responseReset(msg) {
    elResponseHeader.classList.remove("panel-red", "panel-green");
    elResponseData.value = msg ?? 'Нажмите кнопку Выполнить';
}

function profileReset() {
    elSql.innerHTML = '';
}

function profileFill(profile) {
    profileReset();

    if (!profile) {
        elSql.innerHTML = '<div>В ответе нет информации о выполненных sql-запросах</div>'
        return;
    }

    for (let query of profile.queries) {
        const panel = document.createElement('div');
        panel.classList.add('panel', 'profile-sql');

        let s = '';
        s += '<div class="panel-body">';
        /*s += '<div class="label">Запрос:</div>';*/
        s += '<div class="profile-sql-query"></div>';
        s += '<div class="profile-sql-params"></div>';
        s += '</div>';
        panel.innerHTML = s;

        panel.querySelector('.profile-sql-query').textContent = query.sql ?? '???';

        const args = query.args;
        let argsStr;
        if (!(args instanceof Array)) {
            argsStr = `Некорректный тип args (${typeof argsStr})`;
        } else if (args.length === 0) {
            argsStr = 'Без параметров';
        } else {
            argsStr = args.map((x) => JSON.stringify(x)).join(', ');
        }
        panel.querySelector('.profile-sql-params').textContent = argsStr;

        elSql.appendChild(panel);
    }
}

async function run() {
    const req = {
        query: elQuery.value,
    };

    const varsStr = elVars.value.trim();
    if (varsStr) {
        let vars;
        try {
            vars = JSON.parse(varsStr);
        } catch (e) {
            responseError(eToStr('Ошибка разбора переменных', e));
            return
        }
        if (typeof vars !== 'object') {
            responseError('Переменные должны быть объектом JSON');
            return
        }
        req.variables = vars;
    }

    elResponseData.value = 'Выполняется...';

    let res;
    try {
        res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        });
    } catch (e) {
        responseError(eToStr('fetch', e));
        return
    }

    let ok = true;
    let out = '';

    if (res.status !== 200) {
        out = `${res.status} ${res.statusText}\n\n`;
        ok = false;
    }

    let body;

    try {
        body = await res.text();
    } catch (e) {
        out += eToStr('res.text()', e);
        responseError(out)
        return;
    }

    let data;

    try {
        data = JSON.parse(body);
        out += toJson(data);
    } catch (e) {
        out += eToStr('JSON.parse(body)', e) + '\n\n';
        out += body;
        responseError(out)
        return;
    }

    if (!ok || data.errors) {
        responseError(out)
        return;
    }

    responseOk(out);

    profileFill(data?.extensions?.profile);
}

function querySelect(key) {
    const q = queries[key];
    if (typeof q === "object") {
        elQuery.value = q.q ?? '';
        elVars.value = q.v ?? '';
    } else {
        elQuery.value = q ?? '';
        elVars.value = '{}';
    }
}

function switchQuery(event) {
    const k = this.getAttribute("data-query") ?? '';
    querySelect(k)
    responseReset();
    profileReset();
    run();
}

function switchMutator(event) {
    const k = this.getAttribute("data-query") ?? '';
    querySelect(k)
    responseReset();
    profileReset();
}

addGlobalListener('#switch-query', 'li', 'click', switchQuery);
addGlobalListener('#switch-mutator', 'li', 'click', switchMutator);

/**
 * @this {Element}
 * @param event
 */
function switchEndpoint(event) {
    endpoint = this.getAttribute("data-endpoint") ?? '/';
    responseReset();
    profileReset();
}

addGlobalListener('#switch-endpoint', 'li', 'click', switchEndpoint);

regAutoSwitch();

document.querySelector("#run").addEventListener("click", run);

querySelect("q1")
responseReset();
profileReset();
