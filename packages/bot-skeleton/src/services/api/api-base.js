import { observer as globalObserver } from '../../utils/observer';
import { generateDerivApiInstance, getLoginId, getToken } from './appId';

class APIBase {
    api;
    token;
    account_id;
    pip_sizes = {};
    account_info = {};
    is_running = false;
    subscriptions = [];
    time_interval = null;

    init(force_update = false) {
        if (getLoginId()) {
            this.toggleRunButton(true);
            if (force_update && this.api) this.api.disconnect();
            this.api = generateDerivApiInstance();
            this.initEventListeners();
            this.authorizeAndSubscribe();
            if (this.time_interval) clearInterval(this.time_interval);
            this.time_interval = null;
            this.getTime();
        }
    }

    initEventListeners() {
        if (window) {
            window.addEventListener('online', this.reconnectIfNotConnected);
            window.addEventListener('focus', this.reconnectIfNotConnected);
        }
    }

    createNewInstance(account_id) {
        if (this.account_id !== account_id) {
            this.init(true);
        }
    }

    reconnectIfNotConnected = () => {
        // eslint-disable-next-line no-console
        console.log('connection state: ', this.api.connection.readyState);
        if (this.api.connection.readyState !== 1) {
            // eslint-disable-next-line no-console
            console.log('Info: Connection to the server was closed, trying to reconnect.');
            this.init();
        }
    };

    authorizeAndSubscribe() {
        const { token, account_id } = getToken();
        if (token) {
            this.token = token;
            this.account_id = account_id;
            this.getActiveSymbols();

            performance.mark('authorize_start');
            this.api
                .authorize(this.token)
                .then(({ authorize }) => {
                    performance.mark('authorize_end');
                    performance.measure('authorize', 'authorize_start', 'authorize_end');
                    this.subscribe();
                    this.account_info = authorize;
                })
                .catch(e => {
                    globalObserver.emit('Error', e);
                });
        }
    }

    subscribe() {
        performance.mark('balance_start');
        this.api.send({ balance: 1, subscribe: 1 }).catch(e => {
            performance.mark('balance_end');
            performance.measure('balance', 'balance_start', 'balance_end');
            globalObserver.emit('Error', e);
        });
        performance.mark('transaction_start');
        this.api.send({ transaction: 1, subscribe: 1 }).catch(e => {
            performance.mark('transaction_end');
            performance.measure('transaction', 'transaction_start', 'transaction_end');
            globalObserver.emit('Error', e);
        });
    }

    getActiveSymbols = async () => {
        performance.mark('active_symbols_start');
        const { active_symbols = [] } = await this.api.send({ active_symbols: 'brief' }).catch(e => {
            globalObserver.emit('Error', e);
        });
        performance.mark('active_symbols_end');
        performance.measure('active_symbols', 'active_symbols_start', 'active_symbols_end');
        const pip_sizes = {};
        active_symbols.forEach(({ symbol, pip }) => {
            pip_sizes[symbol] = +(+pip).toExponential().substring(3);
        });
        this.pip_sizes = pip_sizes;
        this.toggleRunButton(false);
    };

    toggleRunButton = toggle => {
        const run_button = document.querySelector('#db-animation__run-button');
        if (!run_button) return;
        run_button.disabled = toggle;
    };

    setIsRunning(toggle = false) {
        this.is_running = toggle;
    }

    pushSubscription(subscription) {
        this.subscriptions.push(subscription);
    }

    clearSubscriptions() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }

    getTime() {
        if (!this.time_interval) {
            this.time_interval = setInterval(() => {
                performance.mark('time_api_start');
                this.api.send({ time: 1 }).then(() => {
                    performance.mark('time_api_end');
                    performance.measure('time_api', 'time_api_start', 'time_api_end');
                });
            }, 30000);
        }
    }
}

export const api_base = new APIBase();
