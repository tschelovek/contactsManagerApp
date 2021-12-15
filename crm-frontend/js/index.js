'use strict';

(function () {
    const app = document.querySelector('#app');
    /* Массив с полями для шапки таблицы */
    const currentColumns = [
        'ID',
        'Фамилия Имя Отчество',
        'Дата и время создания',
        'Последние изменения',
        'Контакты',
        'Действия'
    ];

    let testUsers = [
        {
            id: '1234567890',
            createdAt: '2020-05-03T13:00:29.554Z',
            updatedAt: '2021-05-03T13:07:29.554Z',
            name: 'Василий',
            surname: 'Пупкин',
            lastName: 'Васильевич',
            contacts: [
                {
                    type: 'Телефон',
                    value: '+71234567890'
                },
                {
                    type: 'Email',
                    value: 'abc@xyz.com'
                },
                {
                    type: 'Facebook',
                    value: 'https://facebook.com/vasiliy-pupkin-the-best'
                }
            ]
        },
        {
            id: '12345345890',
            createdAt: '2021-04-03T11:15:29.554Z',
            updatedAt: '2021-11-03T17:35:29.554Z',
            name: 'Ирина',
            surname: 'Макарова',
            lastName: 'Лювовна',
            contacts: [
                {
                    type: 'Телефон',
                    value: '+71234567890'
                },
                {
                    type: 'Email',
                    value: 'abc@xyz.com'
                },
                {
                    type: 'Facebook',
                    value: 'https://facebook.com/vasiliy-pupkin-the-best'
                }
            ]
        },
        {
            id: '1234235320',
            createdAt: '2021-05-25T13:05:29.554Z',
            name: 'Сергей',
            surname: 'Светлов',
            lastName: 'Петрович',
            contacts: [
                {
                    type: 'Телефон',
                    value: '+71234567890'
                },
                {
                    type: 'Email',
                    value: 'abc@xyz.com'
                },
                {
                    type: 'Facebook',
                    value: 'https://facebook.com/vasiliy-pupkin-the-best'
                }
            ]
        },
    ]

    let getDMYFromISODate = (dateString) => {
        return new Date(dateString).toLocaleDateString()
    };
    let getHMFromISODate = (dateString) => {
        return new Date(dateString).toLocaleTimeString().slice(0, -3)
    };
    let isString = (item) => {
        return typeof item === 'string';
    }

    function HTMLElement(tag = '', classNameArr = []) {
        let element = document.createElement(tag);
        classNameArr.forEach(styleClass => {
                if (isString(styleClass)) element.classList.add(`${styleClass}`)
            }
        )
        return element
    }

    function createHeader() {
        const appHeader = new HTMLElement('header', ['header']);
        appHeader.innerHTML = `
            <div class="container">
                <a href="#" class="logo-link">
                    <img src="./css/icons/logo.png" alt="SkillBus" title="SkillBus - учёт клиентов">
                </a>
                <form action="" class="header__search">
                    <input type="text">
                </form>
            </div>
        `;

        return appHeader
    }

    function createMain() {
        const appMain = new HTMLElement('main');
        const container = new HTMLElement('div', ['container'])

        // container.classList.add('container');
        container.append(createTable(), createAddBtn());
        appMain.append(container);

        return appMain
    }

    /** Создание вёрстки таблицы. -=START=- **/
    function createTable() {
        const table = new HTMLElement('table');
        const caption = new HTMLElement('caption');

        caption.textContent = 'Клиенты';
        table.append(caption,
            createTHeadRow(currentColumns),
            createTBody(testUsers));

        return table
    }

    function createTHeadRow(currentColumnsArr) {
        const thead = new HTMLElement('thead');
        const trow = new HTMLElement('tr');

        currentColumnsArr
            .forEach(column => {
                const tcell = new HTMLElement('th');
                tcell.setAttribute('scope', 'col');
                tcell.textContent = column;

                trow.append(tcell)
            });
        thead.append(trow);

        return thead
    }

    function createTBody(clientsList) {
        let tbody = new HTMLElement('tbody');

        clientsList.forEach(client => {
            const trow = new HTMLElement('tr');

            let {id, createdAt, updatedAt, name, surname, lastName, contacts} = client;
            let idCell = new HTMLElement('td');
            let nameCell = new HTMLElement('td');
            let dateCreateCell = new HTMLElement('td');
            let dateEditCell = new HTMLElement('td');
            let contactsCell = new HTMLElement('td');
            let btnsCell = new HTMLElement('td');
            let editBtn = createAnyBtn(['btn', 'btn_edit']);
            let deleteBtn = createAnyBtn(['btn', 'btn_delete']);

            idCell.setAttribute('scope', 'row');
            idCell.textContent = id;
            nameCell.textContent = `${surname} ${name} ${lastName}`;
            dateCreateCell.innerHTML = `${getDMYFromISODate(createdAt)}<span>${getHMFromISODate(createdAt)}</span>`;

            if (updatedAt) {
                dateEditCell.innerHTML = `${getDMYFromISODate(updatedAt)}<span>${getHMFromISODate(updatedAt)}</span>`
            }
            if (contacts) {
                contacts.forEach(contactItem => {
                    let {type, value} = contactItem;

                    contactsCell.append(createContactItem(value, type))
                })
            }

            editBtn.textContent = 'Изменить';
            editBtn.addEventListener('click', () => {
                const modal = document.querySelector('.modal');

                createModalForm('edit', id);
                modal.classList.add('active')
            })
            deleteBtn.textContent = 'Удалить';
            deleteBtn.addEventListener('click', () => {
                const modal = document.querySelector('.modal');

                createModalForm('delete', id);
                modal.classList.add('active')
            })
            btnsCell.append(editBtn, deleteBtn);

            trow.append(idCell, nameCell, dateCreateCell, dateEditCell, contactsCell, btnsCell);
            tbody.append(trow)
        });

        return tbody
    }

    function createContactItem(value, type) {
        const contactItem = new HTMLElement('div');

        let src = (type) => {
            if (type === 'Телефон') {
                return './css/icons/phone.svg'
            }
            if (type === 'Email') {
                return './css/icons/mail.svg'
            }
            if (type === 'Facebook') {
                return './css/icons/fb.svg'
            }
            if (type === 'VK') {
                return './css/icons/vk.svg'
            }
            return './css/icons/person.svg'
        }

        contactItem.classList.add('contacts__item');
        contactItem.innerHTML = `
            <img src="${src(type)}" alt="${type} ${value}" tabindex="0" class="contacts__icon"/>
            <div class="tooltip">${type}: ${value}</div>
            `;

        return contactItem
    }

    /** -=END=-  Создание вёрстки таблицы. **/

    /**
     * Создание модального окна
     * @returns {HTMLDivElement}
     */
    function createModalWindow() {
        const modal = new HTMLElement('div', ['modal']);
        const modalWindow = new HTMLElement('div', ['modal__window']);
        const modalWrapper = new HTMLElement('div', ['modal__wrapper']);
        const closeBtn = createAnyBtn(['btn', 'btn_close'], 'button');

        closeBtn.textContent = 'Закрыть';
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            modalWrapper.innerHTML = '';
        });
        // modal.classList.add('modal');
        // modalWrapper.classList.add('modal__wrapper');
        // modalWindow.classList.add('modal__window');
        modalWindow.append(modalWrapper);
        modalWindow.append(closeBtn);
        modal.append(modalWindow);

        return modal
    }

    /**
     * Создание кнопки
     * @param styleClassesArr - массив с классами стилей, которые необходимо назначить кнопке;
     * @param type - тип кнопки (по умолчанию 'button');
     * @returns {HTMLButtonElement} - элемент <button>;
     */
    function createAnyBtn(styleClassesArr = [], type = '') {
        let btn = new HTMLElement('button', styleClassesArr);
        (type === 'submit' || 'reset' || 'menu') ?
            btn.setAttribute('type', type) :
            btn.setAttribute('type', 'button');

        return btn
    }

    function createAddBtn() {
        let btn = createAnyBtn(['btn', 'btn_create', 'btn_transparent']);
        btn.textContent = 'Добавить клиента';
        btn.addEventListener('click', () => {
            const modal = document.querySelector('.modal');
            createModalForm('create');
            modal.classList.add('active')
        });

        return btn
    }

    /**
     *
     * @param formType - тип формы:
     *      'delete' - удаление, 'edit' - редактирование, 'create' - создание записи
     *
     * @param clientId - id клиента
     * @returns {HTMLFormElement}
     */
    function createModalForm(formType, clientId) {
        const modalWrapper = document.querySelector('.modal__wrapper');

        if (formType === 'delete') {
            modalWrapper.append(addFormDelete())
        }
        if (formType === 'create') {
            modalWrapper.append(addFormCreate())
        }
        if (formType === 'edit') {
            modalWrapper.append(addFormEdit(clientId))
        }
    }

    function addFormDelete() {
        const form = new HTMLElement('form', ['form_delete', 'form']);
        let id = document.querySelector('td[scope=row]').textContent;

        console.log(id)

        form.innerHTML = `
            <h2>Удалить клиента</h2>
            <p>Вы действительно хотите удалить данного клиента?</p>
            <div class="exception-wrapper"></div>
            <button type="button" class="btn btn_big btn_violet">Удалить</button>
            <button type="button" class="btn btn_underline">Отмена</button>
        `;
        form.setAttribute('method', 'delete');

        return form
    }

    function addFormCreate() {
        const form = new HTMLElement('form', ['form_create', 'form']);
        let btnSave = createAnyBtn(['btn', 'btn_big', 'btn_violet'], 'button');
        let btnCancel = createAnyBtn(['btn', 'btn_underline'], 'button');

        form.innerHTML = `
            <h2>Новый клиент</h2>
            <input type="text" placeholder="Фамилия">
            <input type="text" placeholder="Имя">
            <input type="text" placeholder="Отчество">
            <button class="btn btn_add-contact" type="button">Добавить контакт</button>
            <div class="exception-wrapper"></div>
        `;
        form.setAttribute('method', 'delete');
        btnSave.textContent = 'Сохранить';
        btnSave.addEventListener('click', saveForm)
        btnCancel.textContent = 'Отменить';

        form.append(btnSave, btnCancel)

        return form
    }

    function addFormEdit(id) {

    }

    function saveForm() {
        console.log('good!')
    }

    // function getPosts({page = 1, filters = {}} = {}) {
    //     const url = new URL('https://test.ru');
    //     Object.entries({
    //         page,
    //         per_page: 10,
    //         ...filters
    //     }).forEach(([key, value]) => {
    //         if (value !== null) {
    //             url.searchParams.append(key, value);
    //         }
    //     });
    //     return fetch(url).then((r) => r.json());
    // }
    //
    // function getCategories({page = 1, filters = {}} = {}) {
    //     const url = new URL('https://test.ru');
    //     return fetch(url).then((r) => r.json());
    // }

    app.append(createHeader());
    app.append(createMain());
    app.append(createModalWindow());

})();
