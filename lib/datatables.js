class UniqueError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UniqueError';
    }
}

function DataTable(config, data) {
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
    const ids = [];

    // Drawing table heading & ordering IDs
    config.columns.forEach(function ({title, value}) {
        const th = document.createElement('th');

        th.innerHTML = title;
        if (ids.includes(value)) throw new UniqueError(`Column IDs must be unique: "${value}" already exists.`);
        ids.push(value);

        th.classList.add(dom.cl.cell, dom.cl.hcell);

        dom.el.th_row.append(th);
    });

    // Drawing table body
    data.forEach(function (row) {
        const tr = document.createElement('tr');

        ids.forEach(function (id) {
            const td = document.createElement('td');
            td.innerHTML = row[id] || '';

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
}
