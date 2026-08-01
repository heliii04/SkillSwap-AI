const timestamp = () => new Date().toISOString();

const write = (stream, level, message) => {
    stream(`[${timestamp()}] [${level}] ${message}`);
};

const logger = {
    info: (message) => write(console.log, "INFO", message),
    warn: (message) => write(console.warn, "WARN", message),
    error: (message) => write(console.error, "ERROR", message),
};

export default logger;
