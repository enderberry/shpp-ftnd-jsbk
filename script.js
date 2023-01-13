const arrayToObjectSameValue = (arr, val) => arr.reduce((res, curr) => ({...res, [curr]: val}), {});
const config1 = {
    parent: '#users-table',
    _dom: {
        cl: {
            button: 'table__button',
            dangerButton: 'table__button--danger'
        },
    },
    columns: [
        {title: 'Имя', value: 'name'},
        {title: 'Фамилия', value: 'surname'},
        {title: 'Фото', value: 'avatar'},
        {title: 'Дата рождения', value: 'birthday'},
        {
            get title() {
                const {state, _dom: {cl: clsnames}} = config1;
                const place = document.createElement('span');
                const btn = document.createElement('button');

                btn.classList.add(clsnames.button);

                btn.onclick = function () {
                    function setPrepend(val, dnf) {
                        state.prepend = val;
                        state.rerender(dnf);
                    }
                    const fields = {
                        name: document.createElement('input'),
                        surname: document.createElement('input'),
                        avatar: document.createElement('input'),
                        birthday: document.createElement('input')
                    };
                    const btnCol = document.createDocumentFragment();
                    const addBtn = document.createElement('button');
                    const cnlBtn = document.createElement('button');
                    btnCol.append(addBtn);
                    btnCol.append(cnlBtn);

                    addBtn.innerHTML = 'OK';
                    cnlBtn.innerHTML = 'Cancel';
                    addBtn.classList.add(clsnames.button);
                    cnlBtn.classList.add(clsnames.button);

                    fields.birthday.type = 'date';

                    setPrepend([{
                        ...fields,
                        actions: btnCol
                    }], true);
                    addBtn.onclick = function () {
                        if (Object.entries(fields).some(([,e]) => e.value === '')) return alert('Please fill all fields');

                        fetch(config1.apiUrl, {
                            method: 'POST',
                            body: JSON.stringify(Object.fromEntries(Object.entries(fields).map(([k,v]) => [k, v.value])))
                        }).then(() => setPrepend([]));

                        this.setAttribute('disabled', true);
                    }
                    cnlBtn.onclick = () => setPrepend([], true);
                }
                btn.innerHTML = 'Add';

                place.append('Actions', btn);

                return place;
            },
            value: 'actions'
        }
    ],
    apiUrl: 'https://mock-api.shpp.me/vlpnk/users',
    state: {},
    apiParser(raw) {
        return Object.entries(raw.data).map(([i,v]) => ({id: +i, ...v}));
    },
    colParser({row, col, val}) {
        const {_dom: {cl: clsnames}} = config1;
        switch (col) {
            case 'avatar':
                if (typeof val !== 'string') return val;
                const img = document.createElement('img');
                img.src = val;
                return img;
            case 'birthday':
                if (typeof val !== 'string') return val;
                return Intl.DateTimeFormat('en-US', arrayToObjectSameValue(['year', 'month', 'day'], 'numeric'))
                    .format(new Date(val));
            case 'actions':
                if (typeof val !== 'undefined') return val;
                const delBtn = document.createElement('button');
                delBtn.classList.add(clsnames.button, clsnames.dangerButton);
                delBtn.innerHTML = 'Delete';
                delBtn.onclick = function () {
                    fetch(`${config1.apiUrl}/${row.id}`, {
                        method: 'DELETE'
                    }).then(() => config1.state.rerender());
                    delBtn.setAttribute('disabled', true);
                }
                return delBtn;
            default:
                return val;
        }
    }
};

window.onload = function () {
    DataTable(config1).then(({mainHook}) => mainHook(function (table) {
        document.getElementById('users-table-search').oninput = function (event) {
            searchInTable(table, event.target.value);
        };
    }));
}
