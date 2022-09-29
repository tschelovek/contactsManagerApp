export const API_HOST = 'http://localhost:3000';
export const API_PATH = '/api/clients';
export const CONTACTS_MAX = 10;

  /* Массив с полями для шапки таблицы */
export const currentColumns = [
    {name: 'ID', filtered: true, filterId: ''},
    {name: 'Фамилия Имя Отчество', filtered: true},
    {name: 'Дата и время создания', filtered: true},
    {name: 'Последние изменения', filtered: true},
    {name: 'Контакты', filtered: false},
    {name: 'Действия', filtered: false},
];
/* Массив с типами контактных данных */
export const contactsOptions = [
    'Телефон',
    'Email',
    'VK',
    'Facebook',
    'Другое'
];
/* Объект с путями к иконкам */
export const iconsPathObj = {
    others: './css/icons/person.svg',
    'Email': './css/icons/mail.svg',
    'Facebook': './css/icons/fb.svg',
    'VK': './css/icons/vk.svg',
    'Телефон': './css/icons/phone.svg',
}

export const testUsers = [
    {
        id: '1234567890',
        createdAt: '2020-05-03T13:00:29.554Z',
        updatedAt: '2021-05-03T13:07:29.554Z',
        name: 'Василий',
        surname: 'Букин',
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
        lastName: 'Львовна',
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

