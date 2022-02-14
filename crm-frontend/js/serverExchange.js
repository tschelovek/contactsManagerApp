'use strict';
/**
 * Файл с функциями обмена данными с сервером
 *
 */
import {API_HOST, API_PATH} from "./data.js";

export const deleteData = async (clientId) => {
    const url = `${API_HOST}${API_PATH}/${clientId}`;
    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
    }).then(r => r.json()).catch(err => console.error(err));
}

export const getData = async ({
                                  id = '',
                                  searchRequest = '',
                              } = {}) => {
    let url = (id) ? `${API_HOST}${API_PATH}/${id}` : `${API_HOST}${API_PATH}`;
    searchRequest ? url += `/?search=${searchRequest}` : null;

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
    }).then(response => response.json()).catch(err => console.error(err));
}

export const changeData = async ({
                                     id = '',
                                     method = '',
                                     clientObject = {},
                                 } = {}) => {
    let url = (id) ? `${API_HOST}${API_PATH}/${id}` : `${API_HOST}${API_PATH}`;

    return fetch(url, {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(clientObject),
    }).then(r => r.json()).catch(err => console.error(err));
}
