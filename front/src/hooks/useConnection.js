const useConnection = () => { 
    const ip = "http://192.168.0.175"
    const port = 4000
    const url = ip + ":" + port
    return { url }
};

export { useConnection };