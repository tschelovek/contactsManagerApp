'use strict';

import { changeData, deleteData, getData } from "./serverExchange.js";
import { CONTACTS_MAX, contactsOptions, currentColumns, iconsPathObj } from "./data.js";

(function () {
	const app = document.querySelector('#app');
	Object.prototype.sort123 = function (param) {
		this.sort(function (a, b) {
			if (param === 'createdAt' || param === 'updatedAt') {
				let dateA = new Date(a[param]).getTime(),
					dateB = new Date(b[param]).getTime();
				return dateA - dateB
			} else {
				return a[param] - b[param]
			}
		})
	}
	Object.prototype.sort321 = function (param) {
		this.sort(function (a, b) {
			if (param === 'createdAt' || param === 'updatedAt') {
				let dateA = new Date(a[param]).getTime(),
					dateB = new Date(b[param]).getTime();
				return dateB - dateA
			} else {
				return b[param] - a[param]
			}
		})
	}

	let getDMYFromISODate = dateString => new Date(dateString).toLocaleDateString(),
		getHMFromISODate = dateString => new Date(dateString).toLocaleTimeString().slice(0, -3),
		isString = item => typeof item == 'string',
		dataStorage = {},
		modal = '';

	function createHTMLElement(obj = {}) {
		let { tag, text, classNameArr = [], attributesArr = [] } = obj;
		let element = document.createElement(tag);
		element.textContent = text ? text : '';

		classNameArr.forEach(styleClass => isString(styleClass) ? element.classList.add(styleClass) : null)
		attributesArr.forEach(attribute => isString(attribute.name)
			? element.setAttribute(attribute.name, attribute.value)
			: null);

		if (tag === 'button') {
			let attributesArrFilteredByType = attributesArr.filter(attribute => attribute.name === 'type').reverse();

			(attributesArrFilteredByType[0] !== undefined
				&& (attributesArrFilteredByType[0].value === 'submit' || 'reset' || 'menu')) ?
				element.setAttribute('type', attributesArrFilteredByType[0].value) :
				element.setAttribute('type', 'button');
		}

		return element
	}

	/* Создание вёрстки таблицы. -=START=- */
	function createHeader() {
		const appHeader = createHTMLElement({
				tag: 'header',
				classNameArr: ['header'],
			}),
			container = createHTMLElement({
				tag: 'div',
				classNameArr: ['container'],
			}),
			logoLink = createHTMLElement({
				tag: 'a',
				classNameArr: ['logo-link'],
				attributesArr: [
					{ name: 'href', value: '#' }
				],
			}),
			logoImg = createHTMLElement({
				tag: 'img',
				attributesArr: [
					{ name: 'src', value: './css/icons/logo.png' },
					{ name: 'alt', value: 'SkillBus' },
					{ name: 'title', value: 'SkillBus - учёт клиентов' },
				],
			}),
			form = createHTMLElement({
				tag: 'form',
				classNameArr: ['form-search_header'],
				attributesArr: [
					{ name: 'action', value: 'get' },
					{ name: 'id', value: 'header_search' },
				],
			}),
			labelInputSearch = createHTMLElement({
				tag: 'label',
				text: 'Поиск',
				classNameArr: ['visually-hidden'],
				attributesArr: [
					{ name: 'for', value: 'search-input' },
				],
			}),
			inputSearch = createHTMLElement({
				tag: 'input',
				attributesArr: [
					{ name: 'type', value: 'search' },
					{ name: 'placeholder', value: 'Введите запрос' },
					{ name: 'name', value: 'search-input' },
				],
			});
		let timerID = undefined;

		form.addEventListener('submit', (e) => e.preventDefault());
		inputSearch.addEventListener('input', async (e) => {
			clearTimeout(timerID);
			timerID = await setTimeout(hotSearch, 500, e.target.value)
		})

		logoLink.append(logoImg);
		form.append(labelInputSearch, inputSearch);
		container.append(logoLink, form);
		appHeader.append(container)

		return appHeader;
	}

	function createMain() {
		const appMain = createHTMLElement({ tag: 'main' }),
			addButton = createHTMLElement({
				tag: 'button',
				text: 'Добавить клиента',
				classNameArr: [
					'btn',
					'btn_create',
					'btn_transparent',
				],
			}),
			container = createHTMLElement({
				tag: 'div',
				classNameArr: ['container'],
			});

		createTable().then((r) => container.append(r, addButton))
			.then(appMain.append(container));

		addButton.addEventListener('click', () => {
			// const modal = document.querySelector('.modal'),
			const modalWindow = modal.querySelector('.modal__window'),
				modalWrapper = modal.querySelector('.modal__wrapper');

			modalWrapper.append(addFormCreate());
			modal.classList.add('active');

			setTimeout(() => {
				modal.classList.add('shadowed');
				modalWindow.classList.add('active')
			}, 100)

		});

		return appMain
	}

	async function createTable() {
		const table = createHTMLElement({ tag: 'table' }),
			caption = createHTMLElement({ tag: 'caption', text: 'Клиенты' });

		getData({ onErrorFunc: onError }).then((r) => {
			dataStorage = r;
			table.append(
				caption,
				createTableHeadRow(currentColumns),
				createTableBody(dataStorage)
			)
		})

		return table
	}

	function createTableHeadRow(currentColumnsArr) {
		const thead = createHTMLElement({ tag: 'thead' }),
			trow = createHTMLElement({ tag: 'tr' });
		let filterCounter = 1,
			filterButtonsArray = [];

		currentColumnsArr.forEach(column => {
			const tcell = createHTMLElement({
					tag: 'th',
					attributesArr: [
						{ name: 'scope', value: 'col' },
					]
				}),
				tcellContainer = createHTMLElement({
					tag: 'div',
					text: column.name,
					classNameArr: ['th__container']
				});

			if (column.filtered) {
				const btn = createHTMLElement({
						tag: 'button',
						text: column.name,
						classNameArr: ['btn_filter'],
						attributesArr: [
							{ name: 'id', value: `filter${filterCounter++}` }
						],
					}),
					svgArrow = document.querySelector('#svg_arrow').cloneNode(true);

				tcellContainer.textContent = ''
				svgArrow.removeAttribute('id');

				btn.appendChild(svgArrow);
				filterButtonsArray.push(btn);
				tcellContainer.append(btn);
			}

			tcell.append(tcellContainer)
			trow.append(tcell)
		});

		thead.append(trow);

		addTableFiltersHandler(filterButtonsArray)

		return thead
	}

	function createTableBody(clientsListObj) {
		let tbody = createHTMLElement({ tag: 'tbody', attributesArr: [{ name: 'id', value: 'tbody' }] });

		fillTable(tbody, clientsListObj)

		return tbody
	}

	function createContactItem(item) {
		const { type, value } = item,
			contactItem = createHTMLElement({ tag: 'div', classNameArr: ['contacts__item'] });

		let src = iconsPathObj[type] ? iconsPathObj[type] : iconsPathObj.others;

		const itemImg = createHTMLElement({
				tag: 'img',
				classNameArr: ['contacts__icon'],
				attributesArr: [
					{ name: 'src', value: `${src}` },
					{ name: 'alt', value: `${type} ${value}` },
					{ name: 'tabindex', value: 0 },
				]
			}),
			itemPopup = createHTMLElement({
				tag: 'div',
				text: `${type}: ${value}`,
				classNameArr: ['tooltip']
			});

		contactItem.append(itemImg, itemPopup);

		return contactItem
	}

	function createAddContactGroup(currentInfo = {}) {
		let { type, value } = currentInfo;
		const wrapper = createHTMLElement({
				tag: 'div',
				classNameArr: ['add-contact__wrapper']
			}),
			select = createHTMLElement({
				tag: 'select',
				classNameArr: ['add-contact__select']
			}),
			input = createHTMLElement({
				tag: 'input',
				classNameArr: ['add-contact__input']
			}),
			btnDeleteContact = createHTMLElement({
				tag: 'button',
				classNameArr: [
					'btn',
					'btn_delete-contact',
				]
			}),
			svgDelete = document.querySelector('#svg_delete').cloneNode(true);

		contactsOptions.forEach(function (option) {
			const optionElement = createHTMLElement({
				tag: 'option',
				text: option,
			});
			if (type === option) {
				optionElement.selected = 'true';
				input.value = value;
			}
			select.append(optionElement);
		})

		svgDelete.removeAttribute('id');
		btnDeleteContact.append(svgDelete)
		btnDeleteContact.addEventListener('click', () => wrapper.remove());

		wrapper.append(select, input, btnDeleteContact);

		return wrapper
	}

	/* -=END=-  Создание вёрстки таблицы. */

	function createModalWindow() {
		modal = createHTMLElement({
			tag: 'div',
			classNameArr: ['modal'],
			attributesArr: [
				{ id: 'modal' }
			],
		})

		// const modal = createHTMLElement({
		// 		tag: 'div',
		// 		classNameArr: ['modal'],
		// 		attributesArr: [
		// 			{ id: 'modal' }
		// 		],
		// 	}),
			const modalWindow = createHTMLElement({ tag: 'div', classNameArr: ['modal__window'] }),
			modalWrapper = createHTMLElement({ tag: 'div', classNameArr: ['modal__wrapper'] }),
			closeBtn = createHTMLElement({
				tag: 'button',
				text: 'Закрыть',
				classNameArr: ['btn', 'btn_close']
			});


		window.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				if(modal.classList.contains('active')) {
					closeModalStylish()
				}
			}
		});
		closeBtn.addEventListener('click', () => closeModalStylish());
		modalWindow.append(modalWrapper, closeBtn);
		modal.append(modalWindow);

		return modal
	}

	function closeModal(element) {
		element.closest('.modal').classList.remove('active');
		element.querySelector('.modal__wrapper').innerHTML = '';
	}

	function closeModalStylish() {
		modal.querySelector('.modal__window').classList.remove('active');
		modal.closest('.modal').classList.remove('shadowed');

		setTimeout(() => closeModal(modal), 500)
	}

	function addTableFiltersHandler(filterButtonsArr) {
		const filterByIDButton = filterButtonsArr[0],
			filterByNameButton = filterButtonsArr[1],
			filterByCreateDateButton = filterButtonsArr[2],
			filterByEditDateButton = filterButtonsArr[3];

		filterByIDButton.addEventListener('click', () => {

			filterButtonsArr.forEach(button => {
				if (button !== filterByIDButton) button.removeAttribute('data-sort')
			})

			toggleDataSortAttribute(filterByIDButton);
			filterById(filterByIDButton.getAttribute('data-sort'))
		});
		filterByNameButton.addEventListener('click', () => {

			filterButtonsArr.forEach(button => {
				if (button !== filterByNameButton) button.removeAttribute('data-sort')
			})

			toggleDataSortAttribute(filterByNameButton);
			filterByName(filterByNameButton.getAttribute('data-sort'))
		});
		filterByCreateDateButton.addEventListener('click', () => {

			filterButtonsArr.forEach(button => {
				if (button !== filterByCreateDateButton) button.removeAttribute('data-sort')
			})

			toggleDataSortAttribute(filterByCreateDateButton);
			filterByCreateDate(filterByCreateDateButton.getAttribute('data-sort'))
		});
		filterByEditDateButton.addEventListener('click', () => {

			filterButtonsArr.forEach(button => {
				if (button !== filterByEditDateButton) button.removeAttribute('data-sort')
			})

			toggleDataSortAttribute(filterByEditDateButton);

			filterByEditDate(filterByEditDateButton.getAttribute('data-sort'))
		});

	}

	function toggleDataSortAttribute(button) {
		if (!button.hasAttribute('data-sort')) {
			button.setAttribute('data-sort', 'straight')
		} else {
			button.getAttribute('data-sort') === 'straight'
				? button.setAttribute('data-sort', 'revers')
				: button.setAttribute('data-sort', 'straight')
		}
	}

	function fillTable(table, clientsListObj) {
		clientsListObj.forEach(client => {
			const trow = createHTMLElement({ tag: 'tr' });

			let { id, createdAt, updatedAt, name, surname, lastName, contacts } = client,
				idCell = createHTMLElement({
					tag: 'td',
					text: id,
					attributesArr: [
						{ scope: 'row' },
					]
				}),
				nameCell = createHTMLElement({
					tag: 'td',
					text: `${surname} ${name} ${lastName}`,
				}),
				dateCreateCell = createHTMLElement({ tag: 'td' }),
				dateEditCell = createHTMLElement({ tag: 'td' }),
				contactsCell = createHTMLElement({ tag: 'td' }),
				buttonsCell = createHTMLElement({ tag: 'td' }),
				editBtn = createHTMLElement({
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
				}),
				deleteBtn = createHTMLElement({
					tag: 'button',
					text: 'Удалить',
					classNameArr: [
						'btn',
						'btn_delete',
					],
				});

			dateCreateCell.innerHTML = `${getDMYFromISODate(createdAt)}<span>${getHMFromISODate(createdAt)}</span>`;

			updatedAt ?
				dateEditCell.innerHTML = `${getDMYFromISODate(updatedAt)}<span>${getHMFromISODate(updatedAt)}</span>`
				: null;

			contacts.forEach(contactItem => contactsCell.append(createContactItem(contactItem)))

			editBtn.addEventListener('click', async () => {
				const modalWindow = modal.querySelector('.modal__window'),
					modalWrapper = modal.querySelector('.modal__wrapper'),
					form = await addFormEdit(id, trow);

				modalWrapper.append(form);
				modal.classList.add('active')

				setTimeout(() => {
					modal.classList.add('shadowed');
					modalWindow.classList.add('active')
				}, 100)
			});
			deleteBtn.addEventListener('click', (e) => {
				deleteContact(id, e.target.closest('tr'))
			});

			buttonsCell.append(editBtn, deleteBtn);
			trow.append(idCell, nameCell, dateCreateCell, dateEditCell, contactsCell, buttonsCell);
			table.append(trow);
		});
	}

	function refillTable(clientsListObj) {
		const tableBody = document.getElementById('tbody');

		tableBody.innerHTML = '';
		fillTable(tableBody, clientsListObj)
	}

	function addFormDelete(clientId, contactTableRow) {
		const form = createHTMLElement({
				tag: 'form',
				classNameArr: ['form_delete', 'form'],
				attributesArr: [
					{
						name: 'method',
						value: 'delete',
					}
				]
			}),
			h2 = createHTMLElement({ tag: 'h2' }),
			p = createHTMLElement({
				tag: 'p',
				text: 'Вы действительно хотите удалить данного клиента?',
			}),
			exceptionWrapper = createHTMLElement({
				tag: 'div',
				classNameArr: ['exception-wrapper'],
			}),
			buttonDelete = createHTMLElement({
				tag: 'button',
				text: 'Удалить',
				classNameArr: ['btn', 'btn_big', 'btn_violet'],
				attributesArr: [
					{
						name: 'type',
						value: 'submit',
					}
				],
			}),
			buttonCancel = createHTMLElement({
				tag: 'button',
				text: 'Отмена',
				classNameArr: ['btn', 'btn_underline'],
			});

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			deleteData(clientId).then(() => alert('Успешно'))
				.then(() => {
					contactTableRow.remove();
					closeModal(form)
				})
		});
		buttonCancel.addEventListener('click', () => closeModalStylish());

		form.append(h2, p, exceptionWrapper, buttonDelete, buttonCancel);

		return form
	}

	function deleteContact(id, contactTableRow) {
		const modalWindow = modal.querySelector('.modal__window'),
			modalWrapper = modal.querySelector('.modal__wrapper');

		modalWrapper.append(addFormDelete(id, contactTableRow));
		modal.classList.add('active');

		setTimeout(() => {
			modal.classList.add('shadowed');
			modalWindow.classList.add('active')
		}, 100)
	}

	function addFormCreate(modal) {
		let { form, h2, btnCancel } = makePostClientForm();

		h2.innerText = 'Новый клиент';
		btnCancel.addEventListener('click', () => closeModalStylish())

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			saveForm(form).then(() => closeModalStylish());
		});

		return form
	}

	async function addFormEdit(clientId, contactTableRow) {
		const btnDelete = createHTMLElement({
			tag: 'button',
			text: 'Удалить клиента',
			classNameArr: ['btn', 'btn_underline'],
		});

		let {
			form,
			h2,
			formHeaderInfo,
			inputSurname,
			inputName,
			inputSecondName,
			addContactFieldset,
			btnCancel
		} = makePostClientForm();

		form.append(btnDelete)

		getData({ id: clientId })
			.then((r) => {
					let { id, name, surname, lastName, contacts } = r;

					btnCancel.remove();
					h2.innerText = 'Изменить данные';
					formHeaderInfo.innerText = `ID:${id}`;

					contacts.forEach(contact => {
						addContactFieldset.append(createAddContactGroup(contact))
					})

					btnDelete.addEventListener('click', () => {
						form.remove();
						deleteContact(id, contactTableRow)
					});
					form.addEventListener('submit', (e) => {
						e.preventDefault();
						saveForm(form, id).then(() => closeModal(form));
					})

					inputSurname.value = surname;
					inputName.value = name;
					inputSecondName.value = lastName;
				}
			)

		return form
	}

	function makePostClientForm() {
		const form = createHTMLElement({
				tag: 'form',
				classNameArr: ['form_create', 'form',],
				attributesArr: [
					{ name: 'method', value: 'create' },
				],
			}),
			formHeader = createHTMLElement({
				tag: 'div',
				classNameArr: ['form__header',],
			}),
			h2 = createHTMLElement({ tag: 'h2' }),
			formHeaderInfo = createHTMLElement({
				tag: 'span',
				classNameArr: ['form__header__info',],
			}),
			labelInputSurname = createHTMLElement({
				tag: 'label',
				text: 'Фамилия',
				classNameArr: ['visually-hidden',],
				attributesArr: [
					{ name: 'for', value: 'surname' },
				],
			}),
			inputSurname = createHTMLElement({
				tag: 'input',
				attributesArr: [
					{ name: 'type', value: 'text' },
					{ name: 'placeholder', value: 'Фамилия' },
					{ name: 'name', value: 'surname' },
					{ name: 'id', value: 'surname_input' },
				],
				classNameArr: ['form__input_name',],
			}),
			labelInputName = createHTMLElement({
				tag: 'label',
				text: 'Имя',
				classNameArr: ['visually-hidden',],
				attributesArr: [
					{ name: 'for', value: 'name' },
				],
			}),
			inputName = createHTMLElement({
				tag: 'input',
				attributesArr: [
					{ name: 'type', value: 'text' },
					{ name: 'placeholder', value: 'Имя' },
					{ name: 'name', value: 'name' },
					{ name: 'id', value: 'name_input' },
				],
				classNameArr: ['form__input_name',],
			}),
			labelInputSecondName = createHTMLElement({
				tag: 'label',
				text: 'Отчество',
				classNameArr: ['visually-hidden',],
				attributesArr: [
					{ name: 'for', value: 'last-name' },
				],
			}),
			inputSecondName = createHTMLElement({
				tag: 'input',
				attributesArr: [
					{ name: 'type', value: 'text' },
					{ name: 'placeholder', value: 'Отчество' },
					{ name: 'name', value: 'last-name' },
					{ name: 'id', value: 'last-name_input' },
				],
				classNameArr: ['form__input_name',],
			}),
			addContactFieldset = createHTMLElement({
				tag: 'fieldset',
				classNameArr: ['fieldset_add-contact']
			}),
			btnAddContact = createHTMLElement({
				tag: 'button',
				text: 'Добавить контакт',
				classNameArr: ['btn', 'btn_add-contact'],
			}),
			btnSave = createHTMLElement({
				tag: 'button',
				text: 'Сохранить',
				classNameArr: ['btn', 'btn_big', 'btn_violet'],
				attributesArr: [
					{
						name: 'type',
						value: 'submit',
					}
				],
			}),
			btnCancel = createHTMLElement({
				tag: 'button',
				text: 'Отмена',
				classNameArr: ['btn', 'btn_underline'],
			}),
			exceptionWrapper = createHTMLElement({
				tag: 'div',
				classNameArr: ['exception-wrapper'],
			});

		btnAddContact.addEventListener('click', () => {
			addContactFieldset.append(createAddContactGroup())

			let contacts = btnAddContact.closest('.fieldset_add-contact').querySelectorAll('.add-contact__wrapper');

			if (contacts.length >= CONTACTS_MAX) {
				btnAddContact.style.display = 'none'
			}
		});

		formHeader.append(h2, formHeaderInfo)
		addContactFieldset.append(btnAddContact);
		form.append(
			formHeader,
			labelInputSurname, inputSurname,
			labelInputName, inputName,
			labelInputSecondName, inputSecondName,
			addContactFieldset, exceptionWrapper,
			btnSave, btnCancel
		);

		return { form, h2, formHeaderInfo, inputSurname, inputName, inputSecondName, addContactFieldset, btnCancel }
	}

	function filterById(order) {
		if (order === 'straight') dataStorage.sort123('id');
		if (order === 'revers') dataStorage.sort321('id');

		refillTable(dataStorage)
	}

	function filterByName(order) {
		if (order === 'straight') {
			dataStorage.sort((function (a, b) {
				let surnameA = a.surname.toLowerCase(),
					surnameB = b.surname.toLowerCase();

				if (surnameA < surnameB)
					return -1
				if (surnameA > surnameB)
					return 1
				return 0
			}))
		}
		if (order === 'revers') {
			dataStorage.sort((function (a, b) {
				let surnameA = a.surname.toLowerCase(),
					surnameB = b.surname.toLowerCase();

				if (surnameA > surnameB)
					return -1
				if (surnameA < surnameB)
					return 1
				return 0
			}))
		}

		refillTable(dataStorage)
	}

	function filterByCreateDate(order) {
		if (order === 'straight') dataStorage.sort123('createdAt');
		if (order === 'revers') dataStorage.sort321('createdAt');

		refillTable(dataStorage)
	}

	function filterByEditDate(order) {
		if (order === 'straight') dataStorage.sort123('updatedAt');
		if (order === 'revers') dataStorage.sort321('updatedAt');

		refillTable(dataStorage)
	}

	async function saveForm(form, id) {
		const inputName = document.getElementById('name_input'),
			inputSurname = document.getElementById('surname_input'),
			inputLastName = document.getElementById('last-name_input');
		let contacts = form.querySelectorAll('.add-contact__wrapper'),
			newClient = { name: '', surname: '', };

		newClient.name = inputName.value.toString();
		newClient.surname = inputSurname.value.toString();
		if (inputLastName.value) newClient.lastName = inputLastName.value;

		if (contacts.length > 0) {
			newClient.contacts = [];
			contacts.forEach(function (contact) {
				const select = contact.querySelector('select'),
					input = contact.querySelector('input');

				if (input.value) {
					newClient.contacts.push({
						type: select.value,
						value: input.value,
					})
				}
			})
		}

		if (id) {
			changeData({
				id: id,
				method: 'patch',
				clientObject: newClient,
			}).then(r => console.log(r))
				.then(() => alert('Успешно'));
		} else {
			changeData({
				method: 'post',
				clientObject: newClient,
			}).then(r => console.log(r))
				.then(() => alert('Успешно'));
		}
	}

	async function hotSearch(request) {
		getData({ searchRequest: request })
			.then(r => {
				dataStorage = r;
				refillTable(r)
			})
	}

	function onError(codeNumber, message = "Oops, you have broken the internet...") {
		console.log(message)
	}

	app.append(createHeader());
	app.append(createMain());
	app.append(createModalWindow());

})();
