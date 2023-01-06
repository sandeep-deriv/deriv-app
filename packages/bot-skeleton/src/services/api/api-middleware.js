class APIMiddleware {
    summary = {};
    constructor(config) {
        this.config = config;
        this.debounced_calls = {};
    }

    sendIsCalled({ response_promise, args: [request, options = {}] }) {
        const promise = promiseRejectToResolve(response_promise);
        const { req_id, subscribe, ...req } = request;

        this.summary[req_id] = {
            ...req,
            start: performance.now(),
        };
        response_promise.then(r => {
            const end = performance.now();
            this.summary[r.req_id] = {
                ...this.summary[r.req_id],
                elspsed: end - this.summary[r.req_id].start,
            };
            delete this.summary[r.req_id].start;
            // eslint-disable-next-line no-console
            console.log(this.summary);
        });
        const key = requestToKey(request);

        if (options.callback) {
            promise.then(options.callback);
        }

        this.debounced_calls[key] = promise;

        promise.then(() => {
            delete this.debounced_calls[key];
        });

        return promise;
    }
}

// Delegate error handling to the callback
function promiseRejectToResolve(promise) {
    return new Promise(r => {
        promise.then(r, r);
    });
}

function requestToKey(request) {
    const request_copy = { ...request };

    delete request_copy.passthrough;
    delete request_copy.req_id;
    delete request_copy.subscribe;

    return JSON.stringify(request_copy);
}

export default APIMiddleware;
