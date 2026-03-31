// Written by Tommy Truong

export const decorateResponse = (res) => {
    res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    };
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
};

export const parseBody = async (req) => {
    const buffers = [];
    for await (const chunk of req) {
        buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    return data ? JSON.parse(data) : {};
};