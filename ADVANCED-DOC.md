####  Send message

Send message from logged in user to another user
 ```
 var messageJson = 
          {"to":'USER_ID',                                 // required
           "message" : 'TEXT_MESSAGE'                      // required
        }; 
$applozic.fn.applozic('sendMessage', messageJson);
 ```



Send message visible only to the receiver.
 ```
var messageJson = 
          {"to":'USER_ID',                                     // required
           "type" : 12,                                        // required
           "message" : 'TEXT_MESSAGE'                          // required
        };  
$applozic.fn.applozic('sendMessage', messageJson);
 ```

####  Get User Details


```
  $applozic.fn.applozic('getUserDetail', {callback: function getUserDetail(response) {
        if(response.status === 'success') {
           // write your logic
        }
     }
  });
```

Sample response:

```
           {'status' : 'success' ,                     // or error
            'data':  {'totalUnreadCount': 15           // total unread count for user          
                     'users':                          // Array of other users detail
                        [{"userId":"USERID_1","connected":false,"lastSeenAtTime":1453462368000,"createdAtTime":1452150981000,"unreadCount":3}, 
                        {"userId":"USERID_2","connected":false,"lastSeenAtTime":1452236884000,"createdAtTime":1452236884000,"unreadCount":1}]    
                     }
           }
```



### Light weight plugin with your own UI 

#### Add following scripts before ```</head>``` tag

```
<script type="text/javascript" src="https://www.applozic.com/resources/lib/js/mck-socket.min.js"></script>      
<script type="text/javascript" src="https://www.applozic.com/resources/sidebox/js/app/apz-client-1.0.js"></script>
```

#### Initialize Plugin

Create APPLOZIC instance by configuring your options

```

 var applozic = new APPLOZIC({'baseUrl': "https://apps.applozic.com",
                              'userId': 'PUT_USERID_HERE',                   // LoggedIn userId
                              'appId': 'PUT_APPLICATION_KEY_HERE',           // obtained from Step 1 (required)
                              'onInit': function(response) { 
                                           if (response === "success") {
                                                 // plugin loaded successfully, perform your actions if any, for example: load contacts, getting unread message count, etc
                                           } else {
                                                 // error in loading plugin (you can hide chat button or refresh page) 
                                           }
                                         }
                            });
```

#### Events subscription

Using events callback, you can subscribe to the following events.

```
applozic.events = {onConnect: function () {
                        console.log('connected successfully');
                  }, onConnectFailed: function () {
                       console.log('connection failed');
                  }, onMessageDelivered: function (obj) {
                       console.log('onMessageDelivered: ' + obj);
                  }, onMessageRead: function (obj) {
                       console.log('onMessageRead: '  + obj);
                  }, onMessageReceived: function (obj) {
                       console.log('onMessageReceived: ' + obj);
                  }, onMessageSentUpdate: function (obj) {
                       console.log('onMessageSentUpdate: ' + obj);
                  }, onUserConnect: function (obj) {
                       console.log('onUserConnect: ' + obj);
                  }, onUserDisconnect: function (obj) {
                       console.log('onUserDisconnect: ' + obj);
                  },
                };
```


Events description:

1) onConnect: Triggered when user subscribed successfully. 


2) onConnectFailed: Triggered when user failed to subscribe. 


3) onMessageDelivered: Triggered when message is delivered. 

Response contains message key. 

Response object- 

{’messageKey’: ‘delivered-message-key’}. 


4) onMessageRead: Triggered when delivered message is read on other end. 

Response contains message key. 

Response object - 

{’messageKey’: ‘delivered-message-key’}.


5) onMessageReceived: Triggered when new message received. 

Response contains message.

Response object - {’message’: message} 


6) onMessageSentUpdate: Triggered when message sent successfully to server. 

Response contains messageKey. 

Response object- {’messageKey’: ‘sent-message-key’}. 


7) onUserConnect: Triggered when some other user comes online.

Response contains user Id. 

Response object - {’userId’: ‘connected-user-Id’} 


8) onUserDisconnect: Triggered when some other user goes offline. 

Response contains user Id. 

Response object - {’userId’: ‘disconnected-user-id’, ‘lastSeenAtTime’ : ‘time in millsec’}



More details here: 
https://www.applozic.com/developers.html#applozic-web-plugin-getting-started
