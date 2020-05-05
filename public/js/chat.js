const socket = io()

//Elements
const $messageform = document.querySelector('#message-form')
const $messageforminput=$messageform.querySelector('input')
const $messageformbutton=$messageform.querySelector('button')
const $location = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix: true })

const autoscroll = () =>{
    //New message element
    const $newMessage=$messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    const newMessageHeight= $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


}

socket.on('message',(msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate,{
        username:msg.username,
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmessage',(message)=>{
    console.log(message)

    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()    
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    
    document.querySelector('#sidebar').innerHTML=html
})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageformbutton.setAttribute('disabled','disabled')
    
    const message=e.target.elements.message.value
    socket.emit('SendMessage',message,(error) =>{

        $messageforminput.value=''
        $messageforminput.focus()

        if(error){
            return console.log(error);
            
        }
        console.log('Messsage delivered')
        $messageformbutton.removeAttribute('disabled')
    })
})

$location.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $location.setAttribute('disabled','disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('SendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            console.log('Location shared');
            $location.removeAttribute('disabled')
        })
    })
})

console.log('My user name is ',username);

socket.emit('join',{ username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})