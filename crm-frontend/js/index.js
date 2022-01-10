'use strict';

import {changeData, deleteData, getData} from "./serverExchange.js";
import {contactsOptions, currentColumns} from "./data.js";

(function () {
    const app = document.querySelector('#app');

    let getDMYFromISODate = (dateString) => {
        return new Date(dateString).toLocaleDateString()
    };
    let getHMFromISODate = (dateString) => {
        return new Date(dateString).toLocaleTimeString().slice(0, -3)
    };
    let isString = (item) => {
        return typeof item == 'string';
    }
    let closeModal = () => {
        document.querySelector('.modal.active').classList.remove('active')
    }

    function createHTMLElement(obj = {}) {
        let {tag, text, classNameArr = [], attributesArr = []} = obj;
        let element = document.createElement(tag);
        if (text) element.textContent = text;

        classNameArr.forEach(styleClass => {
            if (isString(styleClass)) element.classList.add(styleClass)
        });
        attributesArr.forEach(attribute => {
            let {name, value} = attribute;
            if (isString(name)) element.setAttribute(name, value);
        });

        if (tag === 'button') {
            let attributesArrFilteredByType = attributesArr.filter(attribute => attribute.name === 'type').reverse();

            (attributesArrFilteredByType[0] !== undefined
                && (attributesArrFilteredByType[0].value === 'submit' || 'reset' || 'menu')) ?
                element.setAttribute('type', attributesArrFilteredByType[0].value) :
                element.setAttribute('type', 'button');
        }

        return element
    }

    /** Создание вёрстки таблицы. -=START=- **/
    function createHeader() {
        const appHeader = createHTMLElement({
            tag: 'header',
            classNameArr: ['header'],
        });
        const container = createHTMLElement({
            tag: 'div',
            classNameArr: ['container'],
        });
        const logoLink = createHTMLElement({
            tag: 'a',
            classNameArr: ['logo-link'],
            attributesArr: [
                {name: 'href', value: '#'}
            ],
        });
        const logoImg = createHTMLElement({
            tag: 'img',
            attributesArr: [
                {name: 'src', value: './css/icons/logo.png'},
                {name: 'alt', value: 'SkillBus'},
                {name: 'title', value: 'SkillBus - учёт клиентов'},
            ],
        });
        const form = createHTMLElement({
            tag: 'form',
            classNameArr: ['form-search_header'],
            attributesArr: [
                {name: 'action', value: 'get'},
                {name: 'id', value: 'header_search'},
            ],
        });
        const labelInputSearch = createHTMLElement({
            tag: 'label',
            text: 'Поиск',
            classNameArr: ['visually-hidden'],
            attributesArr: [
                {name: 'for', value: 'search-input'},
            ],
        });
        const inputSearch = createHTMLElement({
            tag: 'input',
            attributesArr: [
                {name: 'type', value: 'text'},
                {name: 'placeholder', value: 'Введите запрос'},
                {name: 'name', value: 'search-input'},
            ],
        });

        logoLink.append(logoImg);
        form.append(labelInputSearch, inputSearch);
        container.append(logoLink, form);
        appHeader.append(container)

        return appHeader;
    }

    function createMain() {
        const appMain = createHTMLElement({tag: 'main'});
        const addButton = createHTMLElement({
            tag: 'button',
            text: 'Добавить клиента',
            classNameArr: [
                'btn',
                'btn_create',
                'btn_transparent',
            ],
        });
        const container = createHTMLElement({
            tag: 'div',
            classNameArr: ['container'],
        });

        createTable()
            .then((r) => container.append(r, addButton))
            .then(appMain.append(container))

        addButton.addEventListener('click', () => {
            const modal = document.querySelector('.modal');
            const modalWrapper = modal.querySelector('.modal__wrapper');

            modalWrapper.append(addFormCreate());
            modal.classList.add('active')
        });

        return appMain
    }

    async function createTable() {
        const table = createHTMLElement({tag: 'table'});
        const caption = createHTMLElement({tag: 'caption', text: 'Клиенты'});

        getData().then((r) => {
            table.append(
                caption,
                createTableHeadRow(currentColumns),
                createTableBody(r)
            );
            //todo разобраться почему return table работает только после getData

            // return table
        })
        // .then(() => { return table })

        return table
    }

    function createTableHeadRow(currentColumnsArr) {
        const thead = createHTMLElement({tag: 'thead'});
        const trow = createHTMLElement({tag: 'tr'});

        currentColumnsArr
            .forEach(column => {
                const tcell = createHTMLElement({
                    tag: 'th',
                    text: column,
                    attributesArr: [
                        {name: 'scope', value: 'col'},
                    ]
                });

                trow.append(tcell)
            });
        thead.append(trow);

        return thead
    }

    function createTableBody(clientsList) {
        let tbody = createHTMLElement({tag: 'tbody'});

        clientsList.forEach(client => {
            const trow = createHTMLElement({tag: 'tr'});

            let {id, createdAt, updatedAt, name, surname, lastName, contacts} = client;
            let idCell = createHTMLElement({
                tag: 'td',
                text: id,
                attributesArr: [
                    {scope: 'row'},
                ]
            });
            let nameCell = createHTMLElement({
                tag: 'td',
                text: `${surname} ${name} ${lastName}`,
            });
            let dateCreateCell = createHTMLElement({tag: 'td'});
            let dateEditCell = createHTMLElement({tag: 'td'});
            let contactsCell = createHTMLElement({tag: 'td'});
            let buttonsCell = createHTMLElement({tag: 'td'});
            let editBtn = createHTMLElement({
                tag: 'button',
                text: 'Изменить',
                classNameArr: [
                    'btn',
                    'btn_edit'
                ],
                attributesArr: [
                    {
                        name: 'type',
                        value: 'button'
                    },
                ]
            });
            let deleteBtn = createHTMLElement({
                tag: 'button',
                text: 'Удалить',
                classNameArr: [
                    'btn',
                    'btn_delete',
                ],
            });

            dateCreateCell.innerHTML = `${getDMYFromISODate(createdAt)}<span>${getHMFromISODate(createdAt)}</span>`;

            if (updatedAt) {
                dateEditCell.innerHTML = `${getDMYFromISODate(updatedAt)}<span>${getHMFromISODate(updatedAt)}</span>`
            }
            if (contacts) {
                contacts.forEach(contactItem => contactsCell.append(createContactItem(contactItem)))
            }

            editBtn.addEventListener('click', () => {
                const modal = document.querySelector('.modal');
                const modalWrapper = modal.querySelector('.modal__wrapper');

                modalWrapper.append(addFormEdit(client));
                modal.classList.add('active')
            })
            deleteBtn.addEventListener('click', () => {
                const modal = document.querySelector('.modal');
                const modalWrapper = modal.querySelector('.modal__wrapper');

                modalWrapper.append(addFormDelete(id));
                modal.classList.add('active');
            })

            buttonsCell.append(editBtn, deleteBtn);
            trow.append(idCell, nameCell, dateCreateCell, dateEditCell, contactsCell, buttonsCell);
            tbody.append(trow);
        });

        return tbody
    }

    function createContactItem(item) {
        const {type, value} = item;
        const contactItem = createHTMLElement({tag: 'div', classNameArr: ['contacts__item']});

        let src = './css/icons/person.svg';
        switch (type) {
            case 'Телефон':
                src = './css/icons/phone.svg';
                break
            case 'Email':
                src = './css/icons/mail.svg';
                break
            case 'Facebook':
                src = './css/icons/fb.svg';
                break
            case 'VK':
                src = './css/icons/vk.svg';
                break
        }

        const itemImg = createHTMLElement({
            tag: 'img',
            classNameArr: ['contacts__icon'],
            attributesArr: [
                {name: 'src', value: `${src}`},
                {name: 'alt', value: `${type} ${value}`},
                {name: 'tabindex', value: 0},
            ]
        });
        const itemPopup = createHTMLElement({
            tag: 'div',
            text: `${type}: ${value}`,
            classNameArr: ['tooltip']
        })

        contactItem.append(itemImg, itemPopup)

        return contactItem
    }

    function createAddContactGroup(currentInfo = {}) {
        let {currentType, currentValue} = currentInfo;
        const wrapper = createHTMLElement({
            tag: 'div',
            classNameArr: ['add-contact__wrapper']
        });
        const select = createHTMLElement({
            tag: 'select',
            classNameArr: ['add-contact__select']
        });
        const input = createHTMLElement({
            tag: 'input',
            classNameArr: ['add-contact__input']
        });
        const btnDeleteContact = createHTMLElement({
            tag: 'button',
            classNameArr: [
                'btn',
                'btn_delete-contact',
            ]
        });

        contactsOptions.forEach(function (option) {
            const optionElement = createHTMLElement({
                tag: 'option',
                text: option,
            });
            if (currentType === option) {
                optionElement.setAttribute('selected');
                input.setAttribute('value', currentValue);
            }
            select.append(optionElement);
        })

        btnDeleteContact.addEventListener('click', () => wrapper.remove());

        wrapper.append(select, input, btnDeleteContact);

        return wrapper
    }

    /** -=END=-  Создание вёрстки таблицы. **/

    function createModalWindow() {
        const modal = createHTMLElement({tag: 'div', classNameArr: ['modal']});
        const modalWindow = createHTMLElement({tag: 'div', classNameArr: ['modal__window']});
        const modalWrapper = createHTMLElement({tag: 'div', classNameArr: ['modal__wrapper']});
        const closeBtn = createHTMLElement({
            tag: 'button',
            text: 'Закрыть',
            classNameArr: ['btn', 'btn_close']
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            modalWrapper.innerHTML = '';
        });
        modalWindow.append(modalWrapper, closeBtn);
        modal.append(modalWindow);

        return modal
    }

    function addFormDelete(clientId) {
        const form = createHTMLElement({
            tag: 'form',
            classNameArr: ['form_delete', 'form'],
            attributesArr: [
                {
                    name: 'method',
                    value: 'delete',
                }
            ]
        });
        const h2 = createHTMLElement({tag: 'h2'});
        const p = createHTMLElement({
            tag: 'p',
            text: 'Вы действительно хотите удалить данного клиента?',
        });
        const exceptionWrapper = createHTMLElement({
            tag: 'div',
            classNameArr: ['exception-wrapper'],
        });
        const buttonDelete = createHTMLElement({
            tag: 'button',
            text: 'Удалить',
            classNameArr: ['btn', 'btn_big', 'btn_violet'],
            attributesArr: [
                {
                    name: 'type',
                    value: 'submit',
                }
            ],
        });
        const buttonCancel = createHTMLElement({
            tag: 'button',
            text: 'Отмена',
            classNameArr: ['btn', 'btn_underline'],
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            deleteData(clientId)
                .then(() => alert('Успешно'))
                .then(closeModal)
        });
        buttonCancel.addEventListener('click', closeModal);

        form.append(h2, p, exceptionWrapper, buttonDelete, buttonCancel);

        return form
    }

    function addFormCreate() {
        const form = createHTMLElement({
            tag: 'form',
            classNameArr: ['form_create', 'form',],
            attributesArr: [
                {name: 'method', value: 'create'},
            ],
        });
        const h2 = createHTMLElement({tag: 'h2', text: 'Новый клиент'});
        const labelInputSurname = createHTMLElement({
            tag: 'label',
            text: 'Фамилия',
            classNameArr: ['visually-hidden',],
            attributesArr: [
                {name: 'for', value: 'surname'},
            ],
        });
        const inputSurname = createHTMLElement({
            tag: 'input',
            attributesArr: [
                {name: 'type', value: 'text'},
                {name: 'placeholder', value: 'Фамилия'},
                {name: 'name', value: 'surname'},
                {name: 'id', value: 'surname_input'},
            ],
        });
        const labelInputName = createHTMLElement({
            tag: 'label',
            text: 'Имя',
            classNameArr: ['visually-hidden',],
            attributesArr: [
                {name: 'for', value: 'name'},
            ],
        });
        const inputName = createHTMLElement({
            tag: 'input',
            attributesArr: [
                {name: 'type', value: 'text'},
                {name: 'placeholder', value: 'Имя'},
                {name: 'name', value: 'name'},
                {name: 'id', value: 'name_input'},
            ],
        });
        const labelInputSecondName = createHTMLElement({
            tag: 'label',
            text: 'Отчество',
            classNameArr: ['visually-hidden',],
            attributesArr: [
                {name: 'for', value: 'last-name'},
            ],
        });
        const inputSecondName = createHTMLElement({
            tag: 'input',
            attributesArr: [
                {name: 'type', value: 'text'},
                {name: 'placeholder', value: 'Отчество'},
                {name: 'name', value: 'last-name'},
                {name: 'id', value: 'last-name_input'},
            ],
        });
        const addContactFieldset = createHTMLElement({
            tag: 'fieldset',
            classNameArr: ['fieldset_add-contact']
        })
        const btnAddContact = createHTMLElement({
            tag: 'button',
            text: 'Добавить контакт',
            classNameArr: ['btn', 'btn_add-contact'],
        });
        const btnSave = createHTMLElement({
            tag: 'button',
            text: 'Сохранить',
            classNameArr: ['btn', 'btn_big', 'btn_violet'],
            attributesArr: [
                {
                    name: 'type',
                    value: 'submit',
                }
            ],
        });
        const btnCancel = createHTMLElement({
            tag: 'button',
            text: 'Отмена',
            classNameArr: ['btn', 'btn_underline'],
        });
        const exceptionWrapper = createHTMLElement({
            tag: 'div',
            classNameArr: ['exception-wrapper'],
        });

        btnAddContact.addEventListener('click', () => {
            addContactFieldset.append(createAddContactGroup())
        });
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveFormCreate(form)
                .then(closeModal);
        });

        addContactFieldset.append(btnAddContact);
        form.append(
            h2,
            labelInputSurname, inputSurname,
            labelInputName, inputName,
            labelInputSecondName, inputSecondName,
            addContactFieldset, exceptionWrapper,
            btnSave, btnCancel
        );

        return form
    }

    function addFormEdit(clientObj = {}) {

    }

    async function saveFormCreate(form) {
        const inputName = document.getElementById('name_input');
        const inputSurname = document.getElementById('surname_input');
        const inputLastName = document.getElementById('last-name_input');
        let contacts = form.querySelectorAll('.add-contact__wrapper');
        let newClient = {name: '', surname: '',};

        newClient.name = inputName.value.toString();
        newClient.surname = inputSurname.value.toString();
        if (inputLastName.value) newClient.lastName = inputLastName.value;

        if (contacts.length > 0) {
            newClient.contacts = [];
            contacts.forEach(function (contact) {
                const select = contact.querySelector('select');
                const input = contact.querySelector('input');

                if (input.value) {
                    newClient.contacts.push({
                        type: select.value,
                        value: input.value,
                    })
                }
            })
        }

        changeData({
            method: 'post',
            clientObject: newClient,
        })
            .then(r => console.log(r))
            .then(() => alert('Успешно'));
    }

    app.append(createHeader());
    app.append(createMain());
    app.append(createModalWindow());

})();
