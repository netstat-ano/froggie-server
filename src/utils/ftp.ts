import jsftp from "jsftp";
const initFtp = () => {
    const client = new jsftp({
        host: process.env.FTP_HOST,
        port: 21,
        user: process.env.FTP_USER,
        pass: process.env.FTP_PASSWORD,
    });
    return client;
};
export default initFtp;
