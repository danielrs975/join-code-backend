const { docs,  addUserToDoc, removeUserOfDoc, getUser } = require('./utils/document');

module.exports = (io) => {
    io.on('connection', (socket) => {
        // console.log("A new user arrived", socket.id);
    
        socket.on('join', (options) => {
            // First we add the user to the document
            const { error, user } = addUserToDoc({socket_id: socket.id, ...options});
            if (error) {
                // console.log(error);
                return;
            }
            socket.join(user.docId);
            socket.broadcast.to(user.docId).emit('notification', `User ${user.socket_id} has joined!`);
            // console.log(doc);
            const doc = docs.find((doc) => doc._id === user.docId);
            socket.emit('change', doc);
        })
    
        // Documents events
    
        socket.on('save', (newDoc) => {
            const doc = docs.find((doc) => doc._id === newDoc._id);
            // console.log("Updating the doc", newDoc);
            doc.content = newDoc.content;
            io.to(doc._id).emit('change', doc);
        })
    
        // Cursor events
        socket.on('change-cursor', (coords) => {
            const user = getUser(socket.id);
            if (user) socket.to(user.docId).broadcast.emit('update-cursors', {user, coords});
        })
    
        socket.on('disconnect', () => {
            const user = removeUserOfDoc(socket.id);
            if (user) {
                io.to(user.docId).emit('notification', `User ${user.socket_id} has left!!`); 
                io.to(user.docId).emit('user-leave', 'User X leaved');
            }
        });
    })
}