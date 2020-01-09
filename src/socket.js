const { docs,  addUserToDoc, removeUserOfDoc, getUserAndSaveCoords, getUsersOfDoc, getUser } = require('./utils/document');

module.exports = (io) => {
    io.on('connection', (socket) => {
        // console.log("A new user arrived", socket.id);
    
        socket.on('join', (options, callback) => {
            // First we add the user to the document
            const { error, user } = addUserToDoc({socket_id: socket.id, ...options});
            if (error) {
                return;
            }
            socket.join(user.docId);
            socket.to(user.docId).broadcast.emit('notification', `User ${user.socket_id} has joined!`);
            
            
            // console.log(doc);
            const doc = docs.find((doc) => doc._id === user.docId);
            socket.emit('change', doc);
            callback(socket.id);
            socket.emit('user-new-position', getUsersOfDoc(null, user.docId));
        })
    
        // Documents events
        socket.on('save', (newDoc) => {
            const doc = docs.find((doc) => doc._id === newDoc._id);
            const usersInDoc = getUsersOfDoc(null, doc._id);
            console.log(usersInDoc);
            // console.log("Updating the doc", newDoc);
            doc.content = newDoc.content;
            io.to(doc._id).emit('change', doc);
        })
        
        socket.on('update-cursor-position', ({docId, coords}) => {
            const user = getUserAndSaveCoords(socket.id, docId, coords); 
            if (user) {
                socket.to(user.docId).broadcast.emit('user-new-position', getUsersOfDoc(null, docId));
            }
        })

        socket.on('disconnect', () => {
            const user = removeUserOfDoc(socket.id);
            if (user) {
                io.to(user.docId).emit('notification', `User ${user.socket_id} has left!!`); 
                io.to(user.docId).emit('user-leave', {users: getUsersOfDoc(null, user.docId), userRemoved: user});
            }
        });
    })
}