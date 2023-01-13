class UniqueError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UniqueError';
    }
}

function DataTable(config, tdata = []) {
    const {apiUrl, apiParser, colParser} = config;
    const hookState = {};
    return begin();

    function begin(dnf = false) { // DNF = "Do Not Fetch"
        if (typeof apiUrl === 'string') {
            return (
                dnf
                    ? useData(config.state.cache)
                    : fetch(apiUrl)
                        .then(res => res.json())
                        .then(useData)
            );

            function useData(data) {
                config.state.cache = data;
                return renderTable((typeof apiParser === 'function' ? apiParser : o => o)(data));
            }
        }
        else return renderTable(tdata);
    }
    function renderTable(data) {
        // Initializing
        const dom = {
            el: {
                table: document.createElement('table'),
                thead: document.createElement('thead'),
                th_row: document.createElement('tr'),
                tbody: document.createElement('tbody')
            },
            cl: {
                table: 'table',
                row: 'table__row',
                cell: 'table__cell',
                hcell: 'table__cell--heading'
            }
        };
        const cols = [];
        config.state.rerender = function (dnf) {
            dom.el.table.remove();
            return begin(dnf);
        }

        // Drawing table heading & ordering columns
        config.columns.forEach(function ({title, value}) {
            const th = document.createElement('th');

            th.append(title); // Append in case if there's something other than text
            if (cols.includes(value)) throw new UniqueError(`Column names must be unique: "${value}" already exists.`);
            cols.push(value);

            th.classList.add(dom.cl.cell, dom.cl.hcell);

            dom.el.th_row.append(th);
        });

        // Drawing table body
        [...(config.state.prepend || []), ...data, ...(config.state.append || [])].forEach(function (row, rwidx) {
            const tr = document.createElement('tr');

            cols.forEach(function (col) {
                const td = document.createElement('td');
                let curr = row[col];
                if (typeof colParser === 'function') curr = colParser({
                    col, val: curr, idx: rwidx, config, row
                });

                td.append(curr !== undefined ? curr : '');

                td.classList.add(dom.cl.cell);
                tr.append(td);
            });

            tr.classList.add(dom.cl.row);
            dom.el.tbody.append(tr);
        });

        // Finishing
        dom.el.table.append(dom.el.thead);
        dom.el.table.append(dom.el.tbody);
        dom.el.thead.append(dom.el.th_row);

        dom.el.table.classList.add(dom.cl.table);
        dom.el.th_row.classList.add(dom.cl.row);

        document.querySelector(config.parent).append(dom.el.table);
        hookState.main && hookState.main(dom);
        return new Promise(rs => rs({
            table: dom.el.table,
            mainHook(callback) {
                hookState.main = dom => callback(dom.el.table);
                hookState.main(dom);
            }
        }));
    }
}
function searchInTable(table, query) {
    [...table.querySelectorAll(':scope > tbody > tr')].forEach(function (el) {
        if (!el.innerText.toLowerCase().includes(query.toLowerCase())) el.style.display = 'none';
        else el.style.display = 'revert';
    });
}
