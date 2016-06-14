module.exports = function (socket) {
    socket.emit('send:name', {
        name: 'Bob'
    });
};
