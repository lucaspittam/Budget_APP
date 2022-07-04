let db;

//connection to IndexedDB 
const request = indexedDB.open('budget_pwa', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('offline_actions', {autoIncrement: true});
};

//if successful
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadActions();
    }
};

request.onerror = function(event) {
    //error 
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['offline_actions'], 'readwrite');
    const actionsObjectStore = transaction.objectStore('offline_actions');

    actionsObjectStore.add(record);
};

function uploadActions() {
    const transaction = db.transaction(['offline_actions'], 'readwrite');
    const actionsObjectStore = transaction.objectStore('offline_actions');
    const getAll = actionsObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['offline_actions'], 'readwrite');
                    const actionsObjectStore = transaction.objectStore('offline_actions');
                    actionsObjectStore.clear();

                    alert('All saved transactions have been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
};

window.addEventListener('online', uploadActions);