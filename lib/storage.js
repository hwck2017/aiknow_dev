function storeToLS(k, v) {
    window.localStorage.setItem(k, JSON.stringify(v));
}

function getFromLS(k) {
    return JSON.parse(window.localStorage.getItem(k));
}

function storeToSS(k, v) {
    window.sessionStorage.setItem(k, v);
}

function getFromSS(k) {
    return window.sessionStorage.getItem(k);
}

export {
    storeToLS,
    getFromLS,
    storeToSS,
    getFromSS
}