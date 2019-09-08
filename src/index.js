const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
var bodyParser=require("body-parser")
const Filter = require('bad-words')
const user=require('./models/users.js')
const sendmail=require('./utils/accounte.js')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

var app=express() 
//const dirPath=path.join(__dirname,'../public')
app.use(bodyParser.json()); 
 
app.use(bodyParser.urlencoded({ 
	extended: true
})); 



const server = http.createServer(app)
const io = socketio(server)

const port = 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // socket.on('sign_up',(frm,callback)=>{
    //     const uss=new user({
    //         uname: frm.name,
    //             uteam: 0,
    //             uemail: frm.email,
    //             umob:frm.phone,
    //             upasswd: frm.password,
    //              uorg: '#',
    //              taskcom: 0,
    //              tasktodo: '.',
    //              utype:frm.utype
    //     })
          
    //      uss.save().then(()=>{
    //         sendmail.sendmail(uss.uemail,uss.uname)
    //         var destination = '/index.html';
    //         socket.emit('redirect', destination);
    //     }).catch((error)=>{
    //           return res.send('invalid user detail or internet connection is not there')
    //     })
    // })

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
    
})
// app.get('/',function(req,res){ 
//     res.set({ 
//         'Access-control-Allow-Origin': '*'
//         }); 
//     return res.redirect('index.html'); 
//     }).listen(3000) 

//console.log("server listening at port 3000"); 