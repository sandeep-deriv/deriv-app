export default class NetworkMonitor {
    constructor(apiInstance, parentElement) {
        this.api = apiInstance;
        this.parentElement = parentElement;
        this.addEvents();
    }

    addEvents() {
        if ('onLine' in navigator) {
            window.addEventListener('online', () => this.setStatus());
            window.addEventListener('offline', () => this.setStatus());
        } else {
            navigator.onLine = true;
            setInterval(() => this.setStatus(), 10000);
        }
        this.setStatus();
    }

    setStatus() {
        if (navigator.onLine) {
            this.parentElement.html("<span class='connecting'></span>");
            performance.mark('ping_start');
            this.api.send({ ping: '1' }).then(() => {
                performance.mark('ping_end');
                performance.measure('ping', 'ping_start', 'ping_end');
                this.parentElement.html("<span class='online'></span>");
            });
        } else {
            this.parentElement.html("<span class='offline'></span>");
        }
    }
}
