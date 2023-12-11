setInterval(function() {
    document.getElementById('chat-box').append("<%- include('chat-box') %>");
}, 500);