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

####  User Details
Get user details of logged in user's contact list.


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

#### Events subscription

Using events callback, you can subscribe to the following events.

```
$applozic.fn.applozic('subscribeToEvents', 	{
                 onConnect: function () {
                       //User subscribed successfully
                 },
                 onConnectFailed: function () {
                       //connection failed
                 },
                 onMessageDelivered: function (obj) {
                       //message delivered obj json: {'messageKey': 'delivered-message-key'}
                 },
                 onMessageRead: function (obj) {
                       //message read obj json: {'messageKey': 'read-message-key'}
                 },
                 onMessageReceived: function (obj) {
                       //message received
                 },
                 onMessageSentUpdate: function (obj) {
                       //message sent confirmation: {'messageKey': 'sent-message-key'}
                 },
                 onUserConnect: function (obj) {
                       //user from the contact list came online: {'userID': 'connected-user-Id'}
                 },
                 onUserDisconnect: function (obj) {
                       //user from the contact list went offline: {'userID': 'connected-user-Id'}
                 },
                 onUserBlocked: function (obj) {
                       //user blocks someone or gets blocked by someone: {'status': 'BLOCKED_TO or BLOCKED_BY', 'userId': userId}
                 },
                 onUserUnblocked': function (obj) {
                       //user unblocks someone or get unblocked by someone: {'status': 'BLOCKED_TO or BLOCKED_BY', 'userId': userId}
                 },
                 onUserActivated: function () {
                       //user is activated by app admin
                 },
                 onUserDeactivated: function () {
                       //user is deactivated by app admin
                 }
               });
```

