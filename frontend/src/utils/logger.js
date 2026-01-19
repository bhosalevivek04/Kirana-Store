const isProduction = import.meta.env.PROD;

const logger = {
    info: (...args) => {
        if (!isProduction) {
            console.log(...args);
        }
    },
    warn: (...args) => {
        if (!isProduction) {
            console.warn(...args);
        }
    },
    error: (...args) => {
        // We might want to see errors even in production, or logging to a service (e.g. Sentry)
        console.error(...args);
    },
};

export default logger;
