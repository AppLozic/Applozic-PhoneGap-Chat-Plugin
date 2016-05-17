var $applozic = jQuery.noConflict(true);
if (typeof $applozic.fn.mckModal === 'function') {
    var $appModal = $applozic.fn.mckModal.noConflict();
}
$applozic.fn.mckModal = $appModal;
(function ($applozic, w, d) {
    "use strict";
    if (typeof String.prototype.startsWith !== 'function') {
        String.prototype.startsWith = function (str) {
            if (str === null)
                return false;
            var i = str.length;
            if (this.length < i)
                return false;
            for (--i; (i >= 0) && (this[i] === str[i]); --i)
                continue;
            return i < 0;
        };
    }
    var default_options = {
        baseUrl: "https://apps.applozic.com",
        fileBaseUrl: "https://applozic.appspot.com",
        notificationIconLink: "",
        launcher: "applozic-launcher",
        userId: null,
        appId: null,
        userName: null,
        contactNumber: "",
        supportId: null,
        mode: "standard",
        visitor: false,
        olStatus: false,
        desktopNotification: false,
        locShare: false,
        maxAttachmentSize: 25, //default size is 25MB
        notification: true,
        launchOnUnreadMessage: false
    };
    var message_default_options = {
        "messageType": 5,
        "type": 0
    };
    $applozic.fn.applozic = function (appOptions, params) {
        var $mck_sidebox = $applozic('#mck-sidebox');
        if (typeof appOptions.ojq !== 'undefined') {
            $ = appOptions.ojq;
            jQuery = appOptions.ojq;
        } else {
            $ = $applozic;
            jQuery = $applozic;
        }
        if (typeof appOptions.obsm !== 'undefined') {
            $.fn.modal = appOptions.obsm;
            jQuery.fn.modal = appOptions.obsm;
        }
        if ($applozic.type(appOptions) === "object") {
            appOptions = $applozic.extend(true, {}, default_options, appOptions);
        }
        var oInstance = undefined;
        if (typeof ($mck_sidebox.data("applozic_instance")) !== "undefined") {
            oInstance = $mck_sidebox.data("applozic_instance");
            if ($applozic.type(appOptions) === "string") {
                switch (appOptions) {
                    case "reInitialize" :
                        return oInstance.reInit(params);
                        break;
                    case "loadConvTab" :
                        oInstance.loadConvTab(params);
                        break;
                    case "loadTab" :
                        oInstance.loadTab(params);
                        break;
                    case "addMessageToInbox" :
                        oInstance.addMessageToInbox(params);
                        break;
                    case "loadContacts" :
                        oInstance.loadContacts(params);
                        break;
                    case "sendMessage" :
                        return oInstance.sendMessage(params);
                        break;
                    case "loadBroadcastTab" :
                        params.groupName = (params.groupName) ? params.groupName : 'Broadcast';
                        params.type = 5;
                        return oInstance.initGroupTab(params);
                        break;
                    case "initGroupTab" :
                        return oInstance.initGroupTab(params);
                        break;
                    case "loadGroupTab" :
                        return oInstance.loadGroupTab(params);
                        break;
                    case "setOffline" :
                        oInstance.setOffline();
                        return "success";
                        break;
                    case "setOnline" :
                        oInstance.setOffline();
                        return "success";
                        break;
                    case "getUserDetail" :
                        oInstance.getUserStatus(params);
                        return "success";
                    case "getMessages" :
                        oInstance.getMessages(params);
                        break;
                    case "messageList" :
                        return oInstance.getMessageList(params);
                        break;
                }
            } else if ($applozic.type(appOptions) === "object") {
                oInstance.reInit(appOptions);
            }
        } else if ($applozic.type(appOptions) === "object") {
            if (appOptions.userId && appOptions.appId && $applozic.trim(appOptions.userId) !== "" && $applozic.trim(appOptions.appId) !== "") {
                if (typeof ($mck_sidebox.data("applozic_instance")) !== "undefined") {
                    oInstance = $mck_sidebox.data("applozic_instance");
                    oInstance.reInit(appOptions);
                } else {
                    var applozic = new Applozic(appOptions);
                    applozic.init();
                    $mck_sidebox.data("applozic_instance", applozic);
                }
            } else {
                alert("Oops! looks like incorrect application id or user Id.");
            }
        }
    };
    $applozic.fn.applozic.defaults = default_options;
    function Applozic(appOptions) {
        var _this = this;
        var MCK_TOKEN;
        var AUTH_CODE;
        var TEXT_NODE = 3;
        var FILE_META = [];
        var USER_DEVICE_KEY;
        var ELEMENT_NODE = 1;
        var USER_COUNTRY_CODE;
        var MCK_WEBSOCKET_URL;
        var MCK_GROUP_MAP = [];
        var MCK_CONTACT_MAP = [];
        var MCK_TYPING_STATUS = 0;
        var CONTACT_SYNCING = false;
        var MCK_USER_TIMEZONEOFFSET;
        var MCK_BLOCKED_TO_MAP = [];
        var MCK_BLOCKED_BY_MAP = [];
        var MCK_IDLE_TIME_LIMIT = 90;
        var MCK_USER_DETAIL_MAP = [];
        var mckUtils = new MckUtils();
        var MCK_TOPIC_DETAIL_MAP = [];
        var MCK_LAST_SEEN_AT_MAP = [];
        var MCK_CONVERSATION_MAP = [];
        var IS_MCK_TAB_FOCUSED = true;
        var MCK_MODE = appOptions.mode;
        var MCK_APP_ID = appOptions.appId;
        var MCK_TOPIC_CONVERSATION_MAP = [];
        var IS_MCK_USER_DEACTIVATED = false;
        var MCK_BASE_URL = appOptions.baseUrl;
        var MCK_LAUNCHER = appOptions.launcher;
        var IS_MCK_VISITOR = appOptions.visitor;
        var MCK_USER_NAME = appOptions.userName;
        var MCK_CONTACT_NUMBER = appOptions.contactNumber;
        var MCK_FILE_URL = appOptions.fileBaseUrl;
        var MCK_ON_PLUGIN_INIT = appOptions.onInit;
        var MCK_ON_PLUGIN_CLOSE = appOptions.onClose;
        var MCK_DISPLAY_TEXT = appOptions.displayText;
        var MCK_ACCESS_TOKEN = appOptions.accessToken;
        var MCK_CALLBACK = appOptions.readConversation;
        var IS_MCK_LOCSHARE = appOptions.locShare;
        var MCK_FILEMAXSIZE = appOptions.maxAttachmentSize;
        var MCK_APP_MODULE_NAME = appOptions.appModuleName;
        var MCK_GETTOPICDETAIL = appOptions.getTopicDetail;
        var MCK_GETUSERNAME = appOptions.contactDisplayName;
        var MCK_MSG_VALIDATION = appOptions.validateMessage;
        var MCK_PRICE_DETAIL = appOptions.finalPriceResponse;
        var MCK_GETUSERIMAGE = appOptions.contactDisplayImage;
        var MCK_PRICE_WIDGET_ENABLED = appOptions.priceWidget;
        var MCK_USER_ID = (IS_MCK_VISITOR) ? "guest" : appOptions.userId;
        var MCK_NOTIFICATION_ICON_LINK = appOptions.notificationIconLink;
        var MCK_GOOGLE_API_KEY = (IS_MCK_LOCSHARE) ? appOptions.googleApiKey : "NO_ACCESS";
        var IS_MCK_TOPIC_BOX = (typeof appOptions.topicBox === "boolean") ? (appOptions.topicBox) : false;
        var IS_MCK_OL_STATUS = (typeof appOptions.olStatus === "boolean") ? (appOptions.olStatus) : false;
        var IS_MCK_TOPIC_HEADER = (typeof appOptions.topicHeader === "boolean") ? (appOptions.topicHeader) : false;
        var MCK_SUPPORT_ID_DATA_ATTR = (appOptions.supportId) ? ('data-mck-id="' + appOptions.supportId + '"') : '';
        var IS_MCK_NOTIFICATION = (typeof appOptions.desktopNotification === "boolean") ? appOptions.desktopNotification : false;
        var IS_NOTIFICATION_ENABLED = (typeof appOptions.notification === "boolean") ? appOptions.notification : true;
        var IS_LAUNCH_ON_UNREAD_MESSAGE_ENABLED = (typeof appOptions.launchOnUnreadMessage === "boolean") ? appOptions.launchOnUnreadMessage : false;
        var CONVERSATION_STATUS_MAP = ["DEFAULT", "NEW", "OPEN"];
        var GROUP_TYPE_MAP = [1, 2, 5];
        var BLOCK_STATUS_MAP = ["BLOCKED_TO", "BLOCKED_BY", "UNBLOCKED_TO", "UNBLOCKED_BY"];
        var mckStorage = new MckStorage();
        var TAB_FILE_DRAFT = new Object();
        var MCK_CONTACT_ARRAY = new Array();
        var TAB_MESSAGE_DRAFT = new Object();
        var MCK_CONTACT_NAME_MAP = new Array();
        var MCK_UNREAD_COUNT_MAP = new Array();
        var MCK_TAB_CONVERSATION_MAP = new Array();
        var TAGS_BLOCK = ['p', 'div', 'pre', 'form'];
        var mckUtils = new MckUtils();
        var mckMapLayout = new MckMapLayout();
        var mckDateUtils = new MckDateUtils();
        var mckUserUtils = new MckUserUtils();
        var mckMapService = new MckMapService();
        var mckGroupLayout = new MckGroupLayout();
        var mckFileService = new MckFileService();
        var mckContactUtils = new MckContactUtils();
        var mckGroupService = new MckGroupService();
        var mckMessageLayout = new MckMessageLayout();
        var mckMessageService = new MckMessageService();
        var mckContactService = new MckContactService();
        var mckInitializeChannel = new MckInitializeChannel();
        var mckNotificationService = new MckNotificationService();
        w.MCK_OL_MAP = new Array();
        _this.getOptions = function () {
            return appOptions;
        };
        _this.init = function () {
            mckMessageService.init();
            mckFileService.init();
            mckUtils.initializeApp(appOptions, false);
            mckNotificationService.init();
            mckMapLayout.init();
            mckMessageLayout.initEmojis();
        };
        _this.reInit = function (optns) {
            if ($applozic.type(optns) === "object") {
                optns = $applozic.extend(true, {}, default_options, optns);
            } else {
                return;
            }
            w.sessionStorage.clear();
            MCK_TOKEN = "";
            AUTH_CODE = "";
            FILE_META = [];
            MCK_GROUP_MAP = [];
            MCK_CONTACT_MAP = [];
            USER_DEVICE_KEY = "";
            MCK_MODE = optns.mode;
            USER_COUNTRY_CODE = "";
            MCK_BLOCKED_TO_MAP = [];
            MCK_BLOCKED_BY_MAP = [];
            CONTACT_SYNCING = false;
            MCK_IDLE_TIME_LIMIT = 90;
            MCK_APP_ID = optns.appId;
            MCK_LAST_SEEN_AT_MAP = [];
            MCK_CONVERSATION_MAP = [];
            MCK_TOPIC_DETAIL_MAP = [];
            IS_MCK_TAB_FOCUSED = true;
            MCK_BASE_URL = optns.baseUrl;
            TAB_FILE_DRAFT = new Object();
            MCK_LAUNCHER = optns.launcher;
            MCK_USER_NAME = optns.userName;
            MCK_CONTACT_NUMBER = optns.contactNumber;
            IS_MCK_VISITOR = optns.visitor;
            MCK_TOPIC_CONVERSATION_MAP = [];
            MCK_CONTACT_ARRAY = new Array();
            TAB_MESSAGE_DRAFT = new Object();
            MCK_FILE_URL = optns.fileBaseUrl;
            MCK_ON_PLUGIN_INIT = optns.onInit;
            IS_MCK_LOCSHARE = optns.locShare;
            MCK_CONTACT_NAME_MAP = new Array();
            MCK_UNREAD_COUNT_MAP = new Array();
            MCK_ON_PLUGIN_CLOSE = optns.onClose;
            MCK_DISPLAY_TEXT = optns.displayText;
            MCK_CALLBACK = optns.readConversation;
            MCK_TAB_CONVERSATION_MAP = new Array();
            MCK_APP_MODULE_NAME = optns.appModuleName;
            MCK_GETTOPICDETAIL = optns.getTopicDetail;
            MCK_FILEMAXSIZE = optns.maxAttachmentSize;
            MCK_MSG_VALIDATION = optns.validateMessage;
            MCK_GETUSERNAME = optns.contactDisplayName;
            MCK_PRICE_DETAIL = optns.finalPriceResponse;
            MCK_GETUSERIMAGE = optns.contactDisplayImage;
            MCK_PRICE_WIDGET_ENABLED = optns.priceWidget;
            MCK_USER_ID = (IS_MCK_VISITOR) ? "guest" : optns.userId;
            IS_MCK_OL_STATUS = (typeof optns.olStatus === "boolean") ? (optns.olStatus) : false;
            IS_MCK_TOPIC_BOX = (typeof optns.topicBox === "boolean") ? (optns.topicBox) : false;
            MCK_GOOGLE_API_KEY = (IS_MCK_LOCSHARE) ? optns.googleApiKey : "NO_ACCESS";
            IS_MCK_TOPIC_HEADER = (typeof optns.topicHeader === "boolean") ? (optns.topicHeader) : false;
            MCK_SUPPORT_ID_DATA_ATTR = (optns.supportId) ? ('data-mck-id="' + optns.supportId + '"') : '';
            IS_MCK_NOTIFICATION = (typeof optns.desktopNotification === "boolean") ? optns.desktopNotification : false;
            IS_NOTIFICATION_ENABLED = (typeof optns.notification === "boolean") ? optns.notification : true;
            IS_LAUNCH_ON_UNREAD_MESSAGE_ENABLED = (typeof appOptions.launchOnUnreadMessage === "boolean") ? appOptions.launchOnUnreadMessage : false;

            if (optns.userId && optns.appId && $applozic.trim(optns.userId) !== "" && $applozic.trim(optns.appId) !== "") {
                mckUtils.initializeApp(optns, true);
                appOptions = optns;
            } else {
                w.console("Oops! looks like incorrect application id or user Id.");
                return;
            }
        };
        _this.loadTab = function (tabId) {
            mckMessageLayout.loadTab({tabId: tabId, 'isGroup': false});
            $applozic("#mck-search").val("");
        };
        _this.loadGroupTab = function (tabId) {
            if (typeof tabId === 'undefined' || tabId === "") {
                return "Group Id Required";
            }
            mckMessageLayout.loadTab({tabId: tabId, 'isGroup': true});
            $applozic("#mck-search").val("");
        };
        _this.loadConvTab = function (optns) {
            if (typeof optns === 'object' && optns.userId && optns.convId) {
                mckMessageLayout.loadTab({tabId: optns.userId, conversationId: optns.convId, 'isGroup': false});
            }
        };
        _this.loadContacts = function (contacts) {
            mckMessageLayout.loadContacts(contacts);
        };
        _this.setOffline = function () {
            if (typeof mckInitializeChannel !== 'undefined') {
                mckInitializeChannel.sendStatus(0);
            }
        };
        _this.setOnline = function () {
            if (typeof mckInitializeChannel !== 'undefined') {
                mckInitializeChannel.sendStatus(1);
            }
        };
        _this.getUserStatus = function (params) {
            if (typeof params.callback === 'function') {
                mckContactService.getUserStatus(params);
            }
        };
        _this.getMessages = function (params) {
            if (typeof params.callback === 'function') {
                mckMessageService.getMessages(params);
            }
        };
        _this.getMessageList = function (params) {
            if (typeof params !== 'undefined' && typeof params.callback === 'function') {
                mckMessageService.getMessageList(params);
                return "success";
            } else {
                return "Callback function required.";
            }
        };
        _this.sendMessage = function (params) {
            if (typeof params === "object") {
                params = $applozic.extend(true, {}, message_default_options, params);
                var to = params.to;
                var message = params.message;
                if (typeof to === 'undefined' || to === "") {
                    return "To Field Required";
                }
                if (typeof message === 'undefined' || message === "") {
                    return "Message Field Required";
                }
                if (params.type > 12) {
                    return "Incorrect Message Type";
                }
                message = $applozic.trim(message);
                var messagePxy = {
                    "to": to,
                    "type": params.messageType,
                    "contentType": params.type,
                    "message": message
                };
                mckMessageService.sendMessage(messagePxy);
                return "success";
            } else {
                return "Unsupported Format. Please check format";
            }
        };
        _this.addMessageToInbox = function (params) {
            if (typeof params === "object") {
                mckMessageService.sendInboxMessage(params);
            }
        };
        _this.initGroupTab = function (params) {
            if (typeof params === "object") {
                var users = params.users;
                if (typeof users === 'undefined' || users.length < 1) {
                    return "Users List Required";
                }
                if (users.length > 100) {
                    return "Users limit exceeds 100. Max number of users allowed is 100.";
                }
                if (!params.groupName) {
                    return "Group Name Required";
                }
                if (!params.type) {
                    return "Group Type Required";
                }
                if (GROUP_TYPE_MAP.indexOf(params.type) === -1) {
                    return "Invalid Group Type";
                }
                mckMessageService.getGroup(params);
                return "success";
            } else {
                return "Unsupported Format. Please check format";
            }
        };
        function MckUtils() {
            var _this = this;
            var refreshIntervalId;
            var $mck_file_menu = $applozic("#mck-file-menu");
            var MCK_IDLE_TIME_COUNTER = MCK_IDLE_TIME_LIMIT;
            var INITIALIZE_APP_URL = "/v2/tab/initialize.page";
            _this.getLauncherHtml = function () {
                return '<div id="mck-sidebox-launcher" class="mck-sidebox-launcher">' +
                        '<a href="#" class="applozic-launcher mck-button-launcher" ' + (MCK_MODE === 'support' ? MCK_SUPPORT_ID_DATA_ATTR : '') + '><span class="mck-icon-chat"></span></a></div>' +
                        '<div id="mck-msg-preview" class="mck-msg-preview applozic-launcher">' +
                        '<div class="mck-row">' +
                        '<div class="blk-lg-3 mck-preview-icon"></div>' +
                        '<div class="blk-lg-9">' +
                        '<div class="mck-row mck-truncate mck-preview-content">' +
                        '<strong class="mck-preview-cont-name"></strong></div>' +
                        '<div class="mck-row mck-preview-content">' +
                        '<div class="mck-preview-msg-content"></div>' +
                        '<div class="mck-preview-file-content mck-msg-text notranslate blk-lg-12 mck-attachment n-vis"></div>' +
                        '</div></div></div></div>';
            };
            _this.initializeApp = function (optns, isReInit) {
                var userPxy = {
                    'applicationId': optns.appId,
                    'userId': MCK_USER_ID
                };
                if (MCK_USER_NAME !== null) {
                    userPxy.displayName = optns.userName;
                }
                if (MCK_CONTACT_NUMBER !== null) {
                    userPxy.contactNumber = optns.contactNumber;
                }
                if (optns.imageLink) {
                    userPxy.imageLink = optns.imageLink;
                }
                if (optns.appModuleName) {
                    userPxy.appModuleName = optns.appModuleName;
                }
                $applozic.ajax({
                    url: MCK_BASE_URL + INITIALIZE_APP_URL,
                    type: 'post',
                    data: w.JSON.stringify(userPxy),
                    contentType: 'application/json',
                    headers: {'Application-Key': MCK_APP_ID},
                    success: function (result) {
                        if (result === "INVALID_APPID" || result === "error" || result === 'USER_NOT_FOUND') {
                            alert("Oops! looks like incorrect application id or user id.");
                            if (typeof MCK_ON_PLUGIN_INIT === "function") {
                                MCK_ON_PLUGIN_INIT("error");
                            }
                            return;
                        } else if (result === "APPMODULE_NOT_FOUND") {
                            alert("Oops! looks like incorrect app module name.");
                            if (typeof MCK_ON_PLUGIN_INIT === "function") {
                                MCK_ON_PLUGIN_INIT("error");
                            }
                            return;
                        }
                        if (typeof result === 'object' && result.token) {
                            _this.appendLauncher();
                            $applozic(".applozic-launcher").each(function () {
                                if (!$applozic(this).hasClass("mck-msg-preview")) {
                                    $applozic(this).show();
                                }
                            });
                            MCK_TOKEN = result.token;
                            MCK_USER_ID = result.userId;
                            USER_COUNTRY_CODE = result.countryCode;
                            USER_DEVICE_KEY = result.deviceKey;
                            MCK_WEBSOCKET_URL = result.websocketUrl;
                            MCK_IDLE_TIME_LIMIT = result.websocketIdleTimeLimit;
                            MCK_USER_TIMEZONEOFFSET = result.timeZoneOffset;
                            MCK_FILE_URL = result.fileBaseUrl;
                            IS_MCK_USER_DEACTIVATED = result.deactivated;
                            AUTH_CODE = btoa(result.userId + ":" + result.deviceKey);
                            $applozic.ajaxPrefilter(function (options) {
                                if (!options.beforeSend && (options.url.indexOf(MCK_BASE_URL) !== -1)) {
                                    // _this.manageIdleTime();
                                    options.beforeSend = function (jqXHR) {
                                        jqXHR.setRequestHeader("UserId-Enabled", true);
                                        jqXHR.setRequestHeader("Authorization", "Basic " + AUTH_CODE);
                                        jqXHR.setRequestHeader("Application-Key", MCK_APP_ID);
                                        if (MCK_ACCESS_TOKEN) {
                                            jqXHR.setRequestHeader("Access-Token", MCK_ACCESS_TOKEN);
                                        }
                                        if (MCK_APP_MODULE_NAME) {
                                            jqXHR.setRequestHeader("App-Module-Name", MCK_APP_MODULE_NAME);
                                        }
                                    };
                                }
                            });
                            //$applozic("." + MCK_LAUNCHER).removeClass("hide");
                            if (result.betaPackage) {
                                var poweredByUrl = "https://www.applozic.com/?utm_source=" + w.location.href + "&utm_medium=webplugin&utm_campaign=poweredby";
                                $applozic(".mck-running-on a").attr('href', poweredByUrl);
                                $applozic(".mck-running-on").removeClass("n-vis").addClass('vis');
                            }
                            if (!IS_MCK_VISITOR && MCK_USER_ID !== "guest" && MCK_USER_ID !== "0") {
                                if (isReInit) {
                                    mckInitializeChannel.reconnect();
                                } else {
                                    mckInitializeChannel.init();
                                }
                                mckStorage.clearMckMessageArray();
                                var mckContactNameArray = mckStorage.getMckContactNameArray();
                                if (mckContactNameArray !== null && mckContactNameArray.length > 0) {
                                    for (var i = 0; i < mckContactNameArray.length; i++) {
                                        var nameMap = mckContactNameArray[i];
                                        if (nameMap !== null) {
                                            MCK_CONTACT_NAME_MAP[nameMap[0]] = nameMap[1];
                                        }
                                    }
                                }
                                //mckGroupService.loadGroups();
                            }
                            mckUserUtils.checkUserConnectedStatus();
                            if (typeof MCK_ON_PLUGIN_INIT === "function") {
                                MCK_ON_PLUGIN_INIT("success");
                            }
                            _this.tabFocused();

                            if (IS_LAUNCH_ON_UNREAD_MESSAGE_ENABLED) {
                                mckContactService.getUserStatus({
                                    callback: function (response) {
                                        var data = response.data;
                                        var totalUnreadMessageCount = data.totalUnreadCount;
                                        var contactIdWithUnreadMessage = null;
                                        var unreadCountForUser = 0;
                                        if (data.users.length > 0) {
                                            $applozic.each(data.users, function (i, userDetail) {
                                                if (userDetail.unreadCount > 0 && contactIdWithUnreadMessage !== null) {
                                                    return;
                                                }
                                                if (userDetail.unreadCount > 0) {
                                                    contactIdWithUnreadMessage = userDetail.userId;
                                                    unreadCountForUser = userDetail.unreadCount;
                                                }
                                            });

                                            if (totalUnreadMessageCount > 0) {
                                                if (contactIdWithUnreadMessage !== null && unreadCountForUser === totalUnreadMessageCount) {
                                                    mckMessageLayout.loadTab({tabId: contactIdWithUnreadMessage, 'isGroup': false});
                                                } else {
                                                    mckMessageLayout.loadTab({tabId: '', 'isGroup': false});
                                                }
                                            }
                                        }
                                    }
                                }
                                );
                            }

                            //  mckUtils.manageIdleTime();
                        } else {
                            w.console.log("Unable to initiate app. Please reload page.");
                            if (typeof MCK_ON_PLUGIN_INIT === "function") {
                                MCK_ON_PLUGIN_INIT("error");
                            }
                        }
                    },
                    error: function () {
                        w.console.log('Unable to initialize app. Please reload page.');
                        if (typeof MCK_ON_PLUGIN_INIT === "function") {
                            MCK_ON_PLUGIN_INIT("error");
                        }
                    }
                });
                $applozic(d).on("click", ".fancybox", function (e) {
                    var $this = $applozic(this);
                    var contentType = $this.data('type');
                    if (contentType.indexOf("video") !== -1) {
                        var videoTag = $this.find('.mck-video-box').html(), video;
                        $this.fancybox({
                            content: videoTag,
                            title: $this.data('name'),
                            padding: 0,
                            'openEffect': 'none',
                            'closeEffect': 'none',
                            helpers: {
                                overlay: {
                                    locked: false,
                                    css: {
                                        'background': 'rgba(0, 0, 0, 0.8)'
                                    }
                                }
                            },
                            beforeShow: function () {
                                video = $applozic('.fancybox-inner').find('video').get(0);
                                video.load();
                                video.play();
                            }
                        });
                    } else {
                        var href = $this.data('url');
                        $applozic(this).fancybox({
                            'openEffect': 'none',
                            'closeEffect': 'none',
                            'padding': 0,
                            'href': href,
                            'type': 'image'
                        });
                    }
                });
                $applozic(w).on('resize', function () {
                    if ($mck_file_menu.css('display') === 'block')
                        mckMapLayout.fileMenuReposition();
                });
            };
            _this.appendLauncher = function () {
                $applozic("#mck-sidebox-launcher").remove();
                $applozic("body").append(_this.getLauncherHtml());
                mckNotificationService.init();
            };
            _this.randomId = function () {
                return w.Math.random().toString(36).substring(7);
            };
            _this.textVal = function ($element) {
                var lines = [];
                var line = [];
                var flush = function () {
                    lines.push(line.join(''));
                    line = [];
                };
                var sanitizeNode = function (node) {
                    if (node.nodeType === TEXT_NODE) {
                        line.push(node.nodeValue);
                    } else if (node.nodeType === ELEMENT_NODE) {
                        var tagName = node.tagName.toLowerCase();
                        var isBlock = TAGS_BLOCK.indexOf(tagName) !== -1;
                        if (isBlock && line.length) {
                            flush();
                        }
                        if (tagName === 'img') {
                            var alt = node.getAttribute('alt') || '';
                            if (alt) {
                                line.push(alt);
                            }
                            return;
                        } else if (tagName === 'br') {
                            flush();
                        }
                        var children = node.childNodes;
                        for (var i = 0; i < children.length; i++) {
                            sanitizeNode(children[i]);
                        }
                        if (isBlock && line.length) {
                            flush();
                        }
                    }
                };
                var children = $element.childNodes;
                for (var i = 0; i < children.length; i++) {
                    sanitizeNode(children[i]);
                }
                if (line.length) {
                    flush();
                }
                return lines.join('\n');
            };
            _this.mouseX = function (evt) {
                if (evt.pageX) {
                    return evt.pageX;
                } else if (evt.clientX) {
                    return evt.clientX + (d.documentElement.scrollLeft ? d.documentElement.scrollLeft : d.body.scrollLeft);
                } else {
                    return null;
                }
            };
            _this.mouseY = function (evt) {
                if (evt.pageY) {
                    return evt.pageY;
                } else if (evt.clientY) {
                    return evt.clientY + (d.documentElement.scrollTop ? d.documentElement.scrollTop : d.body.scrollTop);
                } else {
                    return null;
                }
            };
            _this.tabFocused = function () {
                var hidden = "hidden";
                // Standards:
                if (hidden in d)
                    d.addEventListener("visibilitychange", onchange);
                else if ((hidden === "mozHidden") in d)
                    d.addEventListener("mozvisibilitychange", onchange);
                else if ((hidden === "webkitHidden") in d)
                    d.addEventListener("webkitvisibilitychange", onchange);
                else if ((hidden === "msHidden") in d)
                    d.addEventListener("msvisibilitychange", onchange);
                // IE 9 and lower:
                else if ("onfocusin" in d)
                    d.onfocusin = d.onfocusout = onchange;
                // All others:
                else
                    w.onpageshow = w.onpagehide
                            = w.onfocus = w.onblur = onchange;
                function onchange(evt) {
                    var v = true, h = false,
                            evtMap = {
                                focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
                            };
                    evt = evt || w.event;
                    if (evt.type in evtMap) {
                        IS_MCK_TAB_FOCUSED = evtMap[evt.type];
                    } else {
                        IS_MCK_TAB_FOCUSED = this[hidden] ? false : true;
                    }
                    if (IS_MCK_TAB_FOCUSED) {
                        if (MCK_IDLE_TIME_COUNTER < 1) {
                            mckInitializeChannel.checkConnected();
                        }
                        _this.stopIdleTimeCounter();
                    } else {
                        if (MCK_TYPING_STATUS === 1) {
                            mckInitializeChannel.sendTypingStatus(0);
                        }
                        _this.manageIdleTime();
                    }
                }
                // set the initial state (but only if browser supports the Page Visibility API)
                if (d[hidden] !== undefined)
                    onchange({type: d[hidden] ? "blur" : "focus"});
            };
            _this.manageIdleTime = function () {
                MCK_IDLE_TIME_COUNTER = MCK_IDLE_TIME_LIMIT;
                if (refreshIntervalId) {
                    clearInterval(refreshIntervalId);
                }
                refreshIntervalId = setInterval(function () {
                    if (--MCK_IDLE_TIME_COUNTER < 0) {
                        MCK_IDLE_TIME_COUNTER = 0;
                        mckInitializeChannel.stopConnectedCheck();
                        clearInterval(refreshIntervalId);
                        refreshIntervalId = "";
                    }
                }, 60000);
            };
            _this.stopIdleTimeCounter = function () {
                MCK_IDLE_TIME_COUNTER = MCK_IDLE_TIME_LIMIT;
                if (refreshIntervalId) {
                    clearInterval(refreshIntervalId);
                }
                refreshIntervalId = "";
            };
        }

        function MckMessageService() {
            var _this = this;
            var $mck_search = $applozic("#mck-search");
            var $mck_msg_to = $applozic("#mck-msg-to");
            var $mck_msg_new = $applozic("#mck-msg-new");
            var $mck_sidebox = $applozic("#mck-sidebox");
            var $mck_file_box = $applozic("#mck-file-box");
            var $mck_text_box = $applozic("#mck-text-box");
            var $mck_msg_form = $applozic("#mck-msg-form");
            var $mck_msg_sbmt = $applozic("#mck-msg-sbmt");
            var $mck_tab_title = $applozic("#mck-tab-title");
            var $mck_msg_error = $applozic("#mck-msg-error");
            var $mck_show_more = $applozic("#mck-show-more");
            var $mck_btn_attach = $applozic("#mck-btn-attach");
            var $mck_tab_status = $applozic("#mck-tab-status");
            var $mck_msg_cell = $applozic("#mck-message-cell");
            var $mck_typing_box = $applozic(".mck-typing-box");
            var $mck_loading = $applozic("#mck-contact-loading");
            var $mck_contact_list = $applozic("#mck-contact-list");
            var $mck_msg_response = $applozic("#mck-msg-response");
            var $mck_form_field = $applozic("#mck-msg-form input");
            var $mck_block_button = $applozic("#mck-block-button");
            var $li_mck_block_user = $applozic("#li-mck-block-user");
            var $mck_response_text = $applozic("#mck_response_text");
            var $mck_price_text_box = $applozic("#mck-price-text-box");
            var $mck_sidebox_search = $applozic("#mck-sidebox-search");
            var $mck_show_more_icon = $applozic("#mck-show-more-icon");
            var $mck_sidebox_content = $applozic(".mck-sidebox-content");
            var $mck_contacts_content = $applozic("#mck-contacts-content");
            var $mck_tab_message_option = $applozic(".mck-tab-message-option");
            var $mck_msg_inner = $applozic("#mck-message-cell .mck-message-inner");
            var $mck_search_inner = $applozic("#mck-search-cell .mck-message-inner");
            var MESSAGE_SEND_URL = "/rest/ws/message/send";
            var MESSAGE_ADD_INBOX_URL = "/rest/ws/message/add/inbox";
            var MESSAGE_LIST_URL = "/rest/ws/message/list";
            var TOPIC_ID_URL = "/rest/ws/conversation/topicId";
            var MESSAGE_DELETE_URL = "/rest/ws/message/delete";
            var CONVERSATION_ID_URL = "/rest/ws/conversation/id";
            var GROUP_CREATE_URL = "/rest/ws/group/create";
            var MESSAGE_READ_UPDATE_URL = "/rest/ws/message/read";
            var GROUP_MESSAGE_LIST_URL = "/rest/ws/message/group/list";
            var MESSAGE_DELIVERY_UPDATE_URL = "/rest/ws/message/delivered";
            var CONVERSATION_CLOSE_UPDATE_URL = "/rest/ws/conversation/close";
            var CONVERSATION_DELETE_URL = "/rest/ws/message/delete/conversation";
            var CONVERSATION_READ_UPDATE_URL = "/rest/ws/message/read/conversation";
            var offlineblk = '<div id="mck-ofl-blk" class="mck-m-b"><div class="mck-clear"><div class="blk-lg-12 mck-text-light mck-text-muted mck-test-center">${userIdExpr} is offline now</div></div></div>';
            $applozic.template("oflTemplate", offlineblk);
            $applozic(d).on("click", ".mck-message-delete", function () {
                _this.deleteMessage($applozic(this).parents('.mck-m-b').data("msgkey"));
            });
            $applozic(".mck-minimize-icon").click(function () {
                $applozic(".mck-box-md,.mck-box-ft").animate({
                    height: "toggle"
                });
                if ($mck_sidebox_content.hasClass("minimized")) {
                    $mck_sidebox_content.css('height', '100%');
                    $mck_sidebox_content.removeClass("minimized");
                } else {
                    $mck_sidebox_content.css('height', '0%');
                    $mck_sidebox_content.addClass("minimized");
                }
            });
            _this.init = function () {
                mckStorage.clearMckMessageArray();
                $applozic(d).on("click", "." + MCK_LAUNCHER, function () {
                    if ($applozic(this).hasClass('mck-msg-preview')) {
                        $applozic(this).hide();
                    }
                });
                $mck_msg_new.click(function () {
                    $mck_contacts_content.removeClass('vis').addClass('n-vis');
                    $mck_sidebox_content.removeClass('vis').addClass('n-vis');
                    $mck_sidebox_search.removeClass('n-vis').addClass('vis');
                    $mck_search_inner.html('<ul id="mck-search-list" class="mck-search-list mck-contact-list mck-nav mck-nav-tabs mck-nav-stacked"></ul>');
                    if (MCK_CONTACT_ARRAY.length !== 0) {
                        mckMessageLayout.addContactsToSearchList([], true);
                    } else if (IS_MCK_OL_STATUS) {
                        mckContactService.loadContacts();
                    } else {
                        $mck_search_inner.html('<div class="mck-no-data-text mck-text-muted">No contacts yet!</div>');
                        mckMessageLayout.initSearchAutoType();
                    }
                    $mck_search.focus();
                });
                $mck_text_box.keydown(function (e) {
                    if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey)) {
                        e.preventDefault();
                        if (w.getSelection) {
                            var selection = w.getSelection(),
                                    range = selection.getRangeAt(0),
                                    br = d.createElement("br"),
                                    textNode = d.createTextNode("\u00a0"); //Passing " " directly will not end up being shown correctly
                            range.deleteContents(); //required or not?
                            range.insertNode(br);
                            range.collapse(false);
                            range.insertNode(textNode);
                            range.selectNodeContents(textNode);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            return false;
                        }
                    } else if (e.keyCode === 13) {
                        e.preventDefault();
                        if (MCK_TYPING_STATUS === 1) {
                            mckInitializeChannel.sendTypingStatus(0, $mck_msg_inner.data('mck-id'));
                        }
                        ($mck_msg_sbmt.is(':disabled') && $mck_file_box.hasClass('vis')) ? alert('Please wait file is uploading.') : $mck_msg_form.submit();
                    } else if (MCK_TYPING_STATUS === 0) {
                        mckInitializeChannel.sendTypingStatus(1, $mck_msg_inner.data('mck-id'));
                    }
                });
                $applozic(d).on("click", ".mck-delete-button", function () {
                    if (confirm("Are you sure want to delete all the conversation!")) {
                        mckMessageService.deleteConversation();
                    }
                });
                $applozic(d).on("click", ".applozic-tm-launcher", function (e) {
                    e.preventDefault();
                    var tabId = $applozic(this).data("mck-id");
                    tabId = (typeof tabId !== "undefined" && tabId !== "") ? tabId.toString() : "";
                    var userName = $applozic(this).data("mck-name");
                    userName = (typeof userName !== "undefined" && userName !== "") ? userName.toString() : "";
                    var supportId = $applozic(this).data("mck-supportid");
                    supportId = (typeof supportId !== "undefined" && supportId !== "") ? supportId.toString() : "";
                    var topicId = $applozic(this).data("mck-topicid");
                    topicId = (typeof topicId !== "undefined" && topicId !== "") ? topicId.toString() : "";
                    var msgText = $applozic(this).data("mck-msg");
                    msgText = (typeof msgText !== "undefined" && msgText !== "") ? msgText.toString() : "";
                    if (typeof (MCK_GETTOPICDETAIL) === "function" && topicId) {
                        var topicDetail = MCK_GETTOPICDETAIL(topicId);
                        if (typeof topicDetail === 'object' && topicDetail.title !== 'undefined') {
                            MCK_TOPIC_DETAIL_MAP[topicId] = topicDetail;
                        }
                    }
                    var params = {
                        'topicId': topicId,
                        'tabId': tabId,
                        'userName': userName,
                        'isMessage': true
                    };
                    var messagePxy = {
                        "type": 5,
                        "contentType": 0,
                        "message": msgText
                    };
                    params.messagePxy = messagePxy;
                    if (supportId) {
                        params.isGroup = true;
                        params.supportId = supportId;
                        mckMessageService.getConversationId(params);
                    } else {
                        params.isGroup = false;
                        mckMessageLayout.loadTab(params, mckMessageService.dispatchMessage);
                    }
                });
                $applozic(d).on("click", ".applozic-wt-launcher", function (e) {
                    e.preventDefault();
                    var tabId = $applozic(this).data("mck-id");
                    tabId = (typeof tabId !== "undefined" && tabId !== "") ? tabId.toString() : "";
                    var userName = $applozic(this).data("mck-name");
                    userName = (typeof userName !== "undefined" && userName !== "") ? userName.toString() : "";
                    var topicId = $applozic(this).data("mck-topicid");
                    topicId = (typeof topicId !== "undefined" && topicId !== "") ? topicId.toString() : "";
                    var topicStatus = $applozic(this).data("mck-topic-status");
                    if (topicStatus) {
                        topicStatus = (CONVERSATION_STATUS_MAP.indexOf(topicStatus) === -1) ? CONVERSATION_STATUS_MAP[0] : topicStatus.toString();
                    } else {
                        topicStatus = CONVERSATION_STATUS_MAP[0];
                    }
                    if (typeof (MCK_GETTOPICDETAIL) === "function") {
                        var topicDetail = MCK_GETTOPICDETAIL(topicId);
                        if (typeof topicDetail === 'object' && topicDetail.title !== 'undefined') {
                            MCK_TOPIC_DETAIL_MAP[topicId] = topicDetail;
                        }
                    }
                    mckMessageService.getConversationId({'tabId': tabId, 'isGroup': false, 'userName': userName, 'topicId': topicId, 'topicStatus': topicStatus, 'isMessage': false});
                });
                $applozic(d).on("click", "." + MCK_LAUNCHER + ",.mck-conversation-tab-link, .mck-contact-list ." + MCK_LAUNCHER, function (e) {
                    e.preventDefault();
                    var $this = $applozic(this);
                    var tabId = $this.data("mck-id");
                    tabId = (typeof tabId !== "undefined" && tabId !== "") ? tabId.toString() : "";
                    var userName = $this.data("mck-name");
                    userName = (typeof userName !== "undefined" && userName !== "") ? userName.toString() : "";
                    var topicId = $this.data("mck-topicid");
                    topicId = (typeof topicId !== "undefined" && topicId !== "") ? topicId.toString() : "";
                    var isGroup = ($this.data("isgroup") === true);
                    var conversationId = $this.data("mck-conversationid");
                    conversationId = (typeof conversationId !== "undefined" && conversationId !== "") ? conversationId.toString() : "";
                    if (topicId && !conversationId) {
                        var topicStatus = $applozic(this).data("mck-topic-status");
                        if (topicStatus) {
                            topicStatus = (CONVERSATION_STATUS_MAP.indexOf(topicStatus) === -1) ? CONVERSATION_STATUS_MAP[0] : topicStatus.toString();
                        } else {
                            topicStatus = CONVERSATION_STATUS_MAP[0];
                        }
                        mckMessageService.getConversationId({'tabId': tabId, 'isGroup': isGroup, 'userName': userName, 'topicId': topicId, 'topicStatus': topicStatus, 'isMessage': false});
                    } else {
                        mckMessageLayout.loadTab({'tabId': tabId, 'isGroup': isGroup, 'userName': userName, 'conversationId': conversationId, 'topicId': topicId});
                    }
                    $mck_search.val("");
                });
                $applozic(d).on("click", ".mck-close-sidebox", function (e) {
                    e.preventDefault();
                    $mck_sidebox.mckModal('hide');
                    var conversationId = $mck_msg_inner.data('mck-conversationid');
                    $mck_msg_inner.data("mck-id", "");
                    $mck_msg_inner.data("mck-topicid", "");
                    $mck_msg_inner.data("mck-name", "");
                    $mck_msg_inner.data('mck-conversationid', "");
                    if (conversationId) {
                        var conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                        if (typeof conversationPxy === 'object') {
                            var topicId = conversationPxy.topicId;
                            if (typeof MCK_ON_PLUGIN_CLOSE === "function") {
                                MCK_ON_PLUGIN_CLOSE(MCK_USER_ID, topicId);
                            }
                        }
                    }
                    mckInitializeChannel.unsubscibeToTypingChannel();
                });
                $applozic(d).on("click", ".mck-price-submit", function (e) {
                    e.preventDefault();
                    _this.sendPriceMessage();
                });
                $mck_price_text_box.keydown(function (event) {
                    if (event.keyCode === 13) {
                        _this.sendPriceMessage();
                    }
                });
                $mck_msg_inner.bind('scroll', function () {
                    if ($mck_msg_inner.find('.mck-contact-list').length > 0) {
                        if ($mck_msg_inner.scrollTop() + $mck_msg_inner.innerHeight() >= $mck_msg_inner[0].scrollHeight) {
                            var startTime = $mck_msg_inner.data('datetime');
                            if (startTime > 0 && !CONTACT_SYNCING) {
                                mckMessageService.loadMessageList({'tabId': "", 'isGroup': false, 'startTime': startTime});
                            }
                        }
                    }
                });
                $mck_price_text_box.on('click', function (e) {
                    e.preventDefault();
                    $mck_price_text_box.removeClass('mck-text-req');
                });
                $mck_block_button.on('click', function (e) {
                    e.preventDefault();
                    var tabId = $mck_msg_inner.data('mck-id');
                    var isGroup = $mck_msg_inner.data('isgroup');
                    var isBlock = !$mck_msg_inner.data('blocked');
                    if (isGroup) {
                        $li_mck_block_user.removeClass('vis').addClass('n-vis');
                        return;
                    }
                    var blockText = (isBlock) ? 'Are you sure want to block this user!' : 'Are you sure want to unblock this user!';
                    if (confirm(blockText)) {
                        mckContactService.blockUser(tabId, isBlock);
                    }
                });
                $applozic(d).on("click", ".mck-show-more", function (e) {
                    var $this = $applozic(this);
                    e.preventDefault();
                    var tabId = $this.data("tabId");
                    var isGroup = $mck_msg_inner.data('isgroup');
                    var conversationId = $mck_msg_inner.data('mck-conversationid');
                    conversationId = (conversationId) ? conversationId.toString() : "";
                    var startTime = $this.data('datetime');
                    mckMessageService.loadMessageList({'tabId': tabId, 'isGroup': isGroup, 'conversationId': conversationId, 'startTime': startTime});
                });
                $applozic(d).on("click", ".mck-accept", function (e) {
                    var conversationId = $applozic(this).data('mck-conversationid');
                    var priceText = $applozic(this).data('mck-topic-price');
                    if (typeof (MCK_PRICE_DETAIL) === 'function' && priceText && conversationId) {
                        var conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                        var groupId = $mck_msg_to.val();
                        var supplierId = mckGroupLayout.getGroupDisplayName(groupId);
                        if (typeof conversationPxy === 'object') {
                            MCK_PRICE_DETAIL({custId: MCK_USER_ID, suppId: supplierId, productId: conversationPxy.topicId, price: priceText});
                            mckMessageService.sendConversationCloseUpdate(conversationId);
                        } else {
                            mckMessageService.getTopicId({'conversationId': conversationId, 'suppId': supplierId, 'priceText': priceText});
                        }
                    }
                });
                $mck_msg_form.submit(function () {
                    if (MCK_TYPING_STATUS === 1) {
                        mckInitializeChannel.sendTypingStatus(0, $mck_msg_inner.data('mck-id'));
                    }
                    var message = $applozic.trim(mckUtils.textVal($mck_text_box[0]));
                    if ($mck_file_box.hasClass('n-vis') && FILE_META.length > 0) {
                        FILE_META = [];
                    }
                    if (message.length === 0 && !FILE_META.length === 0) {
                        $mck_text_box.addClass("mck-text-req");
                        return false;
                    }
                    if (typeof (MCK_MSG_VALIDATION) === 'function' && !MCK_MSG_VALIDATION(message)) {
                        return false;
                    }
                    var messagePxy = {
                        "type": 5,
                        "contentType": 0,
                        "message": message
                    };
                    var conversationId = $mck_msg_inner.data('mck-conversationid');
                    var topicId = $mck_msg_inner.data('mck-topicid');
                    if (conversationId) {
                        messagePxy.conversationId = conversationId;
                    } else if (topicId) {
                        var conversationPxy = {
                            'topicId': topicId
                        };
                        var topicDetail = MCK_TOPIC_DETAIL_MAP[topicId];
                        if (typeof topicDetail === "object") {
                            conversationPxy.topicDetail = w.JSON.stringify(topicDetail);
                        }
                        messagePxy.conversationPxy = conversationPxy;
                    }
                    if ($mck_msg_inner.data("isgroup") === true) {
                        messagePxy.groupId = $mck_msg_to.val();
                    } else {
                        messagePxy.to = $mck_msg_to.val();
                    }
                    $mck_msg_sbmt.attr('disabled', true);
                    $mck_msg_error.removeClass('vis').addClass('n-vis');
                    $mck_msg_error.html("");
                    $mck_response_text.html("");
                    $mck_msg_response.removeClass('vis').addClass('n-vis');
                    _this.sendMessage(messagePxy);
                    return false;
                });
                $mck_form_field.on('click', function () {
                    $applozic(this).val("");
                    $mck_msg_error.removeClass('vis').addClass('n-vis');
                    $mck_msg_response.removeClass('vis').addClass('n-vis');
                });
                $applozic(d).bind("click", function (e) {
                    $applozic(".mck-context-menu").removeClass("vis").addClass("n-vis");
                    if ($mck_btn_attach.hasClass('on') && !$applozic(e.target).hasClass('mck-icon-upload') && !$applozic(e.target).hasClass('mck-btn-attach')) {
                        mckMapLayout.fileMenuToggle();
                    }
                    $mck_text_box.removeClass('mck-text-req');
                    if (d.activeElement !== $mck_text_box) {
                        if (MCK_TYPING_STATUS === 1) {
                            mckInitializeChannel.sendTypingStatus(0, $mck_msg_inner.data('mck-id'));
                        }
                    }
                });
            };
            _this.sendMessage = function (messagePxy) {
                if (typeof messagePxy !== 'object') {
                    return;
                }
                if (messagePxy.message.length === 0 && FILE_META.length === 0) {
                    $mck_text_box.addClass("mck-text-req");
                    return;
                }
                if (messagePxy.conversationId) {
                    var conversationPxy = MCK_CONVERSATION_MAP[messagePxy.conversationId];
                    if (conversationPxy !== 'undefined' && conversationPxy.closed) {
                        mckMessageLayout.closeConversation();
                        $mck_msg_sbmt.attr('disabled', false);
                        return;
                    }
                }
                var isBlocked = $mck_msg_inner.data('blocked');
                if (isBlocked) {
                    mckUserUtils.toggleBlockUser(tabId, true);
                    $mck_msg_sbmt.attr('disabled', false);
                    return;
                }
                var contact = "";
                if (messagePxy.groupId) {
                    contact = mckGroupLayout.getGroup(messagePxy.groupId);
                    if (typeof contact === "undefined") {
                        contact = mckGroupLayout.createGroup(messagePxy.groupId);
                    }
                } else {
                    contact = mckMessageLayout.fetchContact(messagePxy.to);
                }
                if ($applozic("#mck-message-cell .mck-no-data-text").length > 0) {
                    $applozic(".mck-no-data-text").remove();
                }
                if (messagePxy.message) {
                    var isTopPanelAdded = ($mck_tab_message_option.hasClass('n-vis'));
                    var tabId = $mck_msg_inner.data('mck-id');
                    var randomId = mckUtils.randomId();
                    messagePxy.key = randomId;
                    if (messagePxy.contentType !== 12 && tabId && tabId.toString() === contact.contactId) {
                        _this.addMessageToTab(messagePxy);
                    }
                    var optns = {
                        tabId: contact.contactId,
                        isTopPanelAdded: isTopPanelAdded
                    };
                    _this.submitMessage(messagePxy, optns);
                }
                if (FILE_META.length > 0) {
                    $applozic.each(FILE_META, function (i, fileMeta) {
                        var isTopPanelAdded = ($mck_tab_message_option.hasClass('n-vis'));
                        var tabId = $mck_msg_inner.data('mck-id');
                        var randomId = mckUtils.randomId();
                        delete messagePxy.message;
                        messagePxy.key = randomId;
                        messagePxy.fileMeta = fileMeta;
                        messagePxy.contentType = 1;
                        if (messagePxy.contentType !== 12 && tabId && tabId.toString() === contact.contactId) {
                            _this.addMessageToTab(messagePxy);
                        }
                        var optns = {
                            tabId: contact.contactId,
                            isTopPanelAdded: isTopPanelAdded
                        };
                        _this.submitMessage(messagePxy, optns);
                    });
                }
                $mck_msg_sbmt.attr('disabled', false);
                $applozic("." + randomId + " .mck-message-status").removeClass('mck-icon-sent').addClass('mck-icon-time');
                mckMessageLayout.addTooltip(randomId);
                mckMessageLayout.clearMessageField();
                FILE_META = [];
                delete TAB_MESSAGE_DRAFT[contact.contactId];
            };
            _this.addMessageToTab = function (messagePxy) {
                var message = {
                    'to': messagePxy.to,
                    'groupId': messagePxy.groupId,
                    'deviceKey': messagePxy.deviceKey,
                    'type': 5,
                    'contentType': messagePxy.contentType,
                    'message': messagePxy.message,
                    'conversationId': messagePxy.conversationId,
                    'topicId': messagePxy.topicId,
                    'sendToDevice': true,
                    'createdAtTime': new Date().getTime(),
                    'key': messagePxy.key,
                    'storeOnDevice': true,
                    'sent': false,
                    'shared': false,
                    'read': true
                };
                if (messagePxy.fileMeta) {
                    message.fileMeta = messagePxy.fileMeta;
                }
                mckMessageLayout.addMessage(message, true, true, false);
            };
            _this.sendInboxMessage = function (params) {
                $applozic.ajax({
                    type: "GET",
                    url: MCK_BASE_URL + MESSAGE_ADD_INBOX_URL,
                    global: false,
                    data: "sender=" + encodeURIComponent(params.sender) + "&messageContent=" + encodeURIComponent(params.messageContent),
                    contentType: 'text/plain',
                    success: function (data) {

                    }
                });
            };
            _this.submitMessage = function (messagePxy, optns) {
                var randomId = messagePxy.key;
                var $mck_msg_div = $applozic("#mck-message-cell .mck-message-inner div[name='message']." + randomId);
                delete messagePxy.key;
                $applozic.ajax({
                    type: "POST",
                    url: MCK_BASE_URL + MESSAGE_SEND_URL,
                    global: false,
                    data: w.JSON.stringify(messagePxy),
                    contentType: 'application/json',
                    success: function (data) {
                        var currentTabId = $mck_msg_inner.data('mck-id');
                        if (typeof data === 'object') {
                            var messageKey = data.messageKey;
                            if (currentTabId && (currentTabId.toString() === optns.tabId)) {
                                var conversationId = data.conversationId;
                                $mck_msg_inner.data('mck-conversationid', conversationId);
                                $mck_msg_div.removeClass(randomId).addClass(messageKey);
                                $mck_msg_div.data('msgkey', messageKey);
                                $applozic("." + messageKey + " .mck-message-status").removeClass('mck-icon-time').addClass('mck-icon-sent').attr('title', 'sent');
                                mckMessageLayout.addTooltip(messageKey);
                                if (optns.isTopPanelAdded) {
                                    $mck_show_more.data('datetime', data.createdAt);
                                }
                                mckMessageLayout.messageContextMenu(messageKey);
                            }
                            if (messagePxy.conversationPxy) {
                                var conversationPxy = messagePxy.conversationPxy;
                                if (messagePxy.topicId) {
                                    MCK_TOPIC_CONVERSATION_MAP[messagePxy.topicId] = [conversationId];
                                }
                                MCK_CONVERSATION_MAP[conversationId] = conversationPxy;
                            }
                        } else if (data === "CONVERSATION_CLOSED") {
                            $mck_msg_sbmt.attr('disabled', false);
                            mckMessageLayout.closeConversation();
                            $mck_msg_div.remove();
                            if (optns.isTopPanelAdded) {
                                $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                            }
                        } else if (data === 'error') {
                            $mck_msg_sbmt.attr('disabled', false);
                            $mck_msg_error.html("Unable to process your request. Please try again");
                            $mck_msg_error.removeClass('n-vis').addClass('vis');
                            $mck_msg_div.remove();
                            if (optns.isTopPanelAdded) {
                                $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                            }
                        }
                    },
                    error: function () {
                        $mck_msg_error.html('Unable to process your request. Please try again.');
                        $mck_msg_error.removeClass('n-vis').addClass('vis');
                        if ($mck_msg_div) {
                            $mck_msg_div.remove();
                        }
                        if (optns.isTopPanelAdded) {
                            $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                        }
                    }
                });
            };
            _this.deleteMessage = function (msgKey) {
                var tabId = $mck_msg_inner.data('mck-id');
                if (typeof tabId !== 'undefined') {
                    $applozic.ajax({
                        url: MCK_BASE_URL + MESSAGE_DELETE_URL + "?key=" + msgKey,
                        type: 'get',
                        success: function (data) {
                            if (data === 'success') {
                                var currentTabId = $mck_msg_inner.data('mck-id');
                                if (currentTabId === tabId) {
                                    $applozic("." + msgKey).remove();
                                    if ($mck_msg_inner.is(":empty")) {
                                        $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                                    }
                                }
                                mckStorage.clearMckMessageArray();
                            } else {
                                w.console.log('Unable to delete message. Please reload page.');
                            }
                        }
                    });
                }
            };
            _this.deleteConversation = function () {
                var tabId = $mck_msg_inner.data('mck-id');
                var isGroup = $mck_msg_inner.data("isgroup");
                var conversationId = $mck_msg_inner.data('mck-conversationid');
                if (typeof tabId !== 'undefined') {
                    var data = (isGroup) ? "groupId=" + tabId : "userId=" + encodeURIComponent(tabId);
                    if (conversationId) {
                        data += "&conversationId=" + conversationId;
                    }
                    $applozic.ajax({
                        type: "get",
                        url: MCK_BASE_URL + CONVERSATION_DELETE_URL,
                        global: false,
                        data: data,
                        success: function () {
                            var currentTabId = $mck_msg_inner.data('mck-id');
                            if (currentTabId === tabId) {
                                $mck_msg_inner.html("");
                                $mck_msg_cell.removeClass('n-vis').addClass('vis');
                                $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No messages yet!</div>');
                                $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                            }
                            mckStorage.clearMckMessageArray();
                        },
                        error: function () {
                        }
                    });
                }
            };
            _this.getMessages = function (params) {
                var reqData = "";
                if (typeof params.userId !== "undefined" && params.userId !== "") {
                    reqData = (params.isGroup) ? "&groupId=" + params.userId : "&userId=" + encodeURIComponent(params.userId);
                    if (params.startTime) {
                        reqData += "&endTime=" + params.startTime;
                    }
                    reqData += "&pageSize=30";
                    if (IS_MCK_TOPIC_BOX && params.conversationId) {
                        reqData += "&conversationId=" + params.conversationId;
                        if (typeof MCK_TAB_CONVERSATION_MAP[params.userId] === 'undefined') {
                            reqData += "&conversationReq=true";
                        }
                    }
                } else {
                    if (params.startTime) {
                        reqData += "&endTime=" + params.startTime;
                    }
                    reqData += "&mainPageSize=100";
                }

                var response = new Object();
                $applozic.ajax({
                    url: MCK_BASE_URL + MESSAGE_LIST_URL + "?startIndex=0" + reqData,
                    type: 'get',
                    success: function (data) {
                        response.status = "success";
                        response.data = data;
                        if (params.callback) {
                            params.callback(response);
                        }
                        return;
                    },
                    error: function () {
                        response.status = "error";
                        if (params.callback) {
                            params.callback(response);
                        }
                    }
                });
            };
            _this.getMessageList = function (params) {
                var tabId = params.id;
                if (typeof tabId !== "undefined" && tabId !== "") {
                    var data = (params.pageSize) ? "&pageSize=" + params.pageSize : "&pageSize=50";
                    data += (params.isGroup) ? "&groupId=" + tabId : "&userId=" + tabId;
                    if (params.startTime) {
                        data += "&endTime=" + params.startTime;
                    }
                } else {
                    var data = (params.pageSize) ? "&mainPageSize=" + params.pageSize : "&mainPageSize=50";
                    if (params.startTime) {
                        data += "&endTime=" + params.startTime;
                    }
                }
                if (typeof tabId === 'undefined') {
                    tabId = "";
                }
                var resp = {'id': tabId};
                $applozic.ajax({
                    url: MCK_BASE_URL + MESSAGE_LIST_URL + "?startIndex=0" + data,
                    type: 'get',
                    global: false,
                    success: function (data) {
                        resp.status = "success";
                        if (typeof data.message === "undefined" || data.message.length === 0) {
                            resp.messages = [];
                        } else {
                            var messages = data.message;
                            var messageFeeds = new Array();
                            $applozic.each(messages, function (i, message) {
                                if (typeof message.to !== "undefined") {
                                    var messageFeed = mckMessageLayout.getMessageFeed(message);
                                    messageFeeds.push(messageFeed);
                                }
                            });
                            resp.messages = messageFeeds;
                        }
                        params.callback(resp);
                    }, error: function () {
                        resp.status = "error";
                        params.callback(resp);
                    }
                });
            };
            _this.loadMessageList = function (params, callback) {
                var individual = false;
                var isConvReq = false;
                var reqData = "";
                if (typeof params.tabId !== "undefined" && params.tabId !== "") {
                    reqData = (params.isGroup) ? "&groupId=" + params.tabId : "&userId=" + encodeURIComponent(params.tabId);
                    individual = true;
                    if (params.startTime) {
                        reqData += "&endTime=" + params.startTime;
                    }
                    reqData += "&pageSize=30";
                    if (IS_MCK_TOPIC_BOX && params.conversationId) {
                        reqData += "&conversationId=" + params.conversationId;
                        if (typeof MCK_TAB_CONVERSATION_MAP[params.tabId] === 'undefined') {
                            isConvReq = true;
                            reqData += "&conversationReq=true";
                        } else {
                            mckMessageLayout.addConversationMenu(params.tabId, params.isGroup);
                        }
                    }
                } else {
                    CONTACT_SYNCING = true;
                    if (params.startTime) {
                        reqData += "&endTime=" + params.startTime;
                    }
                    reqData += "&mainPageSize=100";
                }
                if (!params.startTime) {
                    $mck_msg_inner.html("");
                }
                $mck_loading.removeClass('n-vis').addClass('vis');
                $applozic.ajax({
                    url: MCK_BASE_URL + MESSAGE_LIST_URL + "?startIndex=0" + reqData,
                    type: 'get',
                    global: false,
                    success: function (data) {
                        var isMessages = true;
                        var currUserId = $mck_msg_inner.data('mck-id');
                        $mck_loading.removeClass('vis').addClass('n-vis');
                        CONTACT_SYNCING = false;
                        if (params.tabId === currUserId || typeof currUserId === "undefined") {
                            if (data + '' === "null" || typeof data.message === "undefined" || data.message.length === 0) {
                                isMessages = false;
                                if (individual) {
                                    if (params.startTime) {
                                        $mck_show_more_icon.removeClass('n-vis').addClass('vis');
                                        $mck_show_more_icon.fadeOut(3000, function () {
                                            $mck_show_more_icon.removeClass('vis').addClass('n-vis');
                                        });
                                    } else if ($applozic("#mck-message-cell .mck-message-inner div[name='message']").length === 0) {
                                        $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                                        $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No messages yet!</div>');
                                    }
                                } else {
                                    if (!params.startTime) {
                                        $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No conversations yet!</div>');
                                    }
                                    $mck_msg_inner.data('datetime', "");
                                }
                            }
                            if (data + '' !== "null") {
                                if (individual) {
                                    if (isMessages) {
                                        if (params.startTime) {
                                            mckMessageLayout.processMessageList(data, false);
                                        } else {
                                            mckMessageLayout.processMessageList(data, true);
                                            $mck_tab_message_option.removeClass('n-vis').addClass('vis');
                                            if (typeof (MCK_CALLBACK) === "function") {
                                                MCK_CALLBACK(params.tabId);
                                            }
                                        }
                                    }
                                    if (data.userDetails.length > 0) {
                                        $applozic.each(data.userDetails, function (i, userDetail) {
                                            MCK_USER_DETAIL_MAP[userDetail.userId] = userDetail;
                                            if (!params.isGroup) {
                                                if (userDetail.connected) {
                                                    w.MCK_OL_MAP[userDetail.userId] = true;
                                                } else {
                                                    w.MCK_OL_MAP[userDetail.userId] = false;
                                                    if (typeof userDetail.lastSeenAtTime !== "undefined") {
                                                        MCK_LAST_SEEN_AT_MAP[userDetail.userId] = userDetail.lastSeenAtTime;
                                                    }
                                                }
                                                if (!IS_MCK_USER_DEACTIVATED) {
                                                    if (!params.isGroup) {
                                                        if (userDetail.blockedByThis) {
                                                            MCK_BLOCKED_TO_MAP[userDetail.userId] = true;
                                                            mckUserUtils.toggleBlockUser(params.tabId, true);
                                                        } else if (userDetail.blockedByOther) {
                                                            MCK_BLOCKED_BY_MAP[userDetail.userId] = true;
                                                            $mck_tab_title.removeClass('mck-tab-title-w-status');
                                                            $mck_tab_status.removeClass('vis').addClass('n-vis');
                                                            $mck_typing_box.removeClass('vis').addClass('n-vis');
                                                            $mck_msg_inner.data('blocked', false);
                                                        } else {
                                                            mckUserUtils.toggleBlockUser(params.tabId, false);
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    if (data.groupFeeds.length > 0) {
                                        $applozic.each(data.groupFeeds, function (i, groupFeed) {
                                            mckGroupLayout.addGroup(groupFeed);
                                        });
                                    }
                                    MCK_UNREAD_COUNT_MAP[params.tabId] = 0;
                                    if (data.conversationPxys.length > 0) {
                                        var tabConvArray = new Array();
                                        $applozic.each(data.conversationPxys, function (i, conversationPxy) {
                                            if (typeof conversationPxy === 'object') {
                                                tabConvArray.push(conversationPxy);
                                                MCK_CONVERSATION_MAP[conversationPxy.id] = conversationPxy;
                                                MCK_TOPIC_CONVERSATION_MAP[conversationPxy.topicId] = [conversationPxy.id];
                                                if (conversationPxy.topicDetail) {
                                                    try {
                                                        MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId] = $applozic.parseJSON(conversationPxy.topicDetail);
                                                    } catch (ex) {
                                                        w.console.log('Incorect Topic Detail!');
                                                    }
                                                }
                                            }
                                        });
                                        if (isConvReq) {
                                            MCK_TAB_CONVERSATION_MAP[params.tabId] = tabConvArray;
                                            mckMessageLayout.addConversationMenu(params.tabId, params.isGroup);
                                        }
                                    }
                                    if (params.conversationId) {
                                        var conversationPxy = MCK_CONVERSATION_MAP[params.conversationId];
                                        if (conversationPxy.closed) {
                                            mckMessageLayout.closeConversation();
                                        }
                                    }
                                    if (params.isGroup) {
                                        mckGroupLayout.addGroupStatus(mckGroupLayout.getGroup(params.tabId));
                                    }
                                    if (!params.startTime) {
                                        $mck_msg_inner.animate({
                                            scrollTop: $mck_msg_inner.prop("scrollHeight")
                                        }, 0);
                                        if (typeof callback === 'function') {
                                            callback(params);
                                        }
                                    }
                                } else {
                                    w.MCK_OL_MAP = [];
                                    if (data.userDetails.length > 0) {
                                        $applozic.each(data.userDetails, function (i, userDetail) {
                                            MCK_USER_DETAIL_MAP[userDetail.userId] = userDetail;
                                            if (userDetail.connected) {
                                                w.MCK_OL_MAP[userDetail.userId] = true;
                                            } else {
                                                w.MCK_OL_MAP[userDetail.userId] = false;
                                                if (typeof userDetail.lastSeenAtTime !== "undefined") {
                                                    MCK_LAST_SEEN_AT_MAP[userDetail.userId] = userDetail.lastSeenAtTime;
                                                }
                                            }
                                            MCK_UNREAD_COUNT_MAP[userDetail.userId] = userDetail.unreadCount;
                                            var contact = mckMessageLayout.getContact('' + userDetail.userId);
                                            (typeof contact === 'undefined') ? mckMessageLayout.createContactWithDetail(userDetail) : mckMessageLayout.updateContactDetail(contact, userDetail);
                                        });
                                    }
                                    if (data.groupFeeds.length > 0) {
                                        $applozic.each(data.groupFeeds, function (i, groupFeed) {
                                            MCK_UNREAD_COUNT_MAP[groupFeed.id] = groupFeed.unreadCount;
                                            mckGroupLayout.addGroup(groupFeed);
                                        });
                                    }
                                    if (data.blockedUserPxyList.blockedToUserList.length > 0) {
                                        $applozic.each(data.blockedUserPxyList.blockedToUserList, function (i, blockedToUser) {
                                            if (blockedToUser.userBlocked) {
                                                MCK_BLOCKED_TO_MAP[blockedToUser.blockedTo] = true;
                                            }
                                        });
                                    }
                                    if (data.blockedUserPxyList.blockedByUserList.length > 0) {
                                        $applozic.each(data.blockedUserPxyList.blockedByUserList, function (i, blockedByUser) {
                                            if (blockedByUser.userBlocked) {
                                                MCK_BLOCKED_BY_MAP[blockedByUser.blockedBy] = true;
                                            }
                                        });
                                    }
                                    if (data.conversationPxys.length > 0) {
                                        $applozic.each(data.conversationPxys, function (i, conversationPxy) {
                                            MCK_CONVERSATION_MAP[conversationPxy.id] = conversationPxy;
                                            MCK_TOPIC_CONVERSATION_MAP[conversationPxy.topicId] = [conversationPxy.id];
                                            if (conversationPxy.topicDetail) {
                                                try {
                                                    MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId] = $applozic.parseJSON(conversationPxy.topicDetail);
                                                } catch (ex) {
                                                    w.console.log('Incorect Topic Detail!');
                                                }
                                            }
                                        });
                                    }
                                    if (isMessages) {
                                        if (params.startTime) {
                                            mckMessageLayout.addContactsFromMessageList(data, false);
                                            mckStorage.updateMckMessageArray(data.message);
                                        } else {
                                            mckMessageLayout.addContactsFromMessageList(data, true);
                                            mckStorage.setMckMessageArray(data.message);
                                            $mck_msg_inner.animate({
                                                scrollTop: 0
                                            }, 0);
                                        }
                                    } else {
                                        $mck_msg_inner.data('datetime', "");
                                    }
                                }
                            }
                        }
                    },
                    error: function () {
                        CONTACT_SYNCING = false;
                        $mck_loading.removeClass('vis').addClass('n-vis');
                        w.console.log('Unable to load messages. Please reload page.');
                    }
                });
            };
            _this.loadGroupMessageList = function (groupId) {
                var individual = false;
                var filterParams = {
                    startIndex: 0,
                    pageSize: 100
                };
                if (typeof groupId !== "undefined" && groupId !== "") {
                    individual = true;
                    filterParams.groupId = groupId;
                }
                $mck_msg_inner.html("");
                $mck_loading.removeClass('n-vis').addClass('vis');
                $applozic.ajax({
                    url: MCK_BASE_URL + GROUP_MESSAGE_LIST_URL,
                    type: 'post',
                    data: w.JSON.stringify(filterParams),
                    contentType: 'application/json',
                    global: false,
                    success: function (data) {
                        var currUserId = $mck_msg_inner.data('mck-id');
                        if (groupId === currUserId) {
                            if (data + '' === "null" || typeof data.message === "undefined" || data.message.length === 0) {
                                if (individual) {
                                    if ($applozic("#mck-message-cell .mck-message-inner div[name='message']").length === 0) {
                                        $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                                        $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No messages yet!</div>');
                                    }
                                } else {
                                    $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No conversations yet!</div>');
                                }
                            } else {
                                if (individual) {
                                    //  w.MCK_OL_MAP[userId] = (data.userDetails.length > 0);
                                    mckMessageLayout.processMessageList(data, true);
                                    $mck_tab_message_option.removeClass('n-vis').addClass('vis');
                                    if (typeof (MCK_CALLBACK) === "function") {
                                        MCK_CALLBACK(groupId);
                                    }
                                } else {
                                    if (data.userDetails.length > 0) {
                                        $applozic.each(data.userDetails, function (i, userDetail) {
                                            MCK_UNREAD_COUNT_MAP[userDetail.userId] = userDetail.unreadCount;
                                        });
                                    }
                                    mckMessageLayout.addGroupFromMessageList(data, true);
                                }
                            }
                        }
                        $mck_loading.removeClass('vis').addClass('n-vis');
                        $mck_msg_inner.animate({
                            scrollTop: $mck_msg_inner.prop("scrollHeight")
                        }, 0);
                    },
                    error: function () {
                        $mck_loading.removeClass('vis').addClass('n-vis');
                        w.console.log('Unable to load messages. Please reload page.');
                    }
                });
            };
            _this.updateContactList = function (userId) {
                var paramData = "startIndex=0&pageSize=1&userId=" + encodeURIComponent(userId);
                $applozic.ajax({
                    url: MCK_BASE_URL + MESSAGE_LIST_URL,
                    data: paramData,
                    global: false,
                    type: 'get',
                    success: function (data) {
                        if (data + '' === "null" || typeof data.message === "undefined" || data.message.length === 0) {
                            mckMessageLayout.clearContactMessageData(userId);
                        } else {
                            var message = data.message[0];
                            if (typeof message !== 'undefined') {
                                mckMessageLayout.addContactsFromMessage(message, true);
                            }
                        }
                    },
                    error: function () {
                        mckMessageLayout.clearContactMessageData(userId);
                    }
                });
            };
            _this.sendDeliveryUpdate = function (message) {
                var data = "key=" + message.pairedMessageKey;
                $applozic.ajax({
                    url: MCK_BASE_URL + MESSAGE_DELIVERY_UPDATE_URL,
                    data: data,
                    global: false,
                    type: 'get',
                    success: function () {
                    },
                    error: function () {
                    }
                });
            };
            _this.sendReadUpdate = function (key) {
                if (typeof key !== "undefined" && key !== "") {
                    var data = "key=" + key;
                    $applozic.ajax({
                        url: MCK_BASE_URL + MESSAGE_READ_UPDATE_URL,
                        data: data,
                        global: false,
                        type: 'get',
                        success: function () {
                        },
                        error: function () {
                        }
                    });
                }
            };
            _this.conversationReadUpdate = function (tabId, isGroup) {
                if (tabId && (mckMessageLayout.getUnreadCount(tabId) > 0)) {
                    var data = (isGroup) ? "groupId=" + tabId : "userId=" + encodeURIComponent(tabId);
                    $applozic.ajax({
                        url: MCK_BASE_URL + CONVERSATION_READ_UPDATE_URL,
                        data: data,
                        global: false,
                        type: 'get',
                        success: function () {
                            MCK_UNREAD_COUNT_MAP[tabId] = 0;
                        },
                        error: function () {
                        }
                    });
                }
            };
            _this.getConversationId = function (params) {
                if (!params.isGroup && !params.isMessage && (params.topicStatus !== CONVERSATION_STATUS_MAP[1])) {
                    var conversationId = MCK_TOPIC_CONVERSATION_MAP[params.topicId];
                    if (conversationId) {
                        conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                        if (typeof conversationPxy === 'object') {
                            $mck_msg_inner.data('mck-conversationid', conversationPxy.id);
                            params.conversationId = conversationPxy.id;
                            if (typeof MCK_TAB_CONVERSATION_MAP[params.tabId] !== 'undefined') {
                                var tabConvArray = MCK_TAB_CONVERSATION_MAP[params.tabId];
                                tabConvArray.push(conversationPxy);
                                MCK_TAB_CONVERSATION_MAP[params.tabId] = tabConvArray;
                            }
                            mckMessageLayout.loadTab(params);
                            return;
                        }
                    }
                }
                if (params.topicId) {
                    var conversationPxy = {
                        'topicId': params.topicId,
                        'userId': params.tabId,
                        'status': params.topicStatus
                    };
                    if (params.isGroup) {
                        conversationPxy.supportIds = [];
                        conversationPxy.supportIds.push(params.supportId);
                    }
                    var topicDetail = MCK_TOPIC_DETAIL_MAP[params.topicId];
                    if (typeof topicDetail === 'object') {
                        conversationPxy.topicDetail = w.JSON.stringify(topicDetail);
                    }
                    $applozic.ajax({
                        url: MCK_BASE_URL + CONVERSATION_ID_URL,
                        global: false,
                        data: w.JSON.stringify(conversationPxy),
                        type: 'post',
                        contentType: 'application/json',
                        success: function (data) {
                            if (typeof data === 'object' && data.status === "success") {
                                var groupPxy = data.response;
                                if (typeof groupPxy === 'object' && groupPxy.conversationPxy !== 'undefined') {
                                    var conversationPxy = groupPxy.conversationPxy;
                                    MCK_CONVERSATION_MAP[conversationPxy.id] = conversationPxy;
                                    MCK_TOPIC_CONVERSATION_MAP[conversationPxy.topicId] = [conversationPxy.id];
                                    if (conversationPxy.topicDetail) {
                                        try {
                                            MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId] = $applozic.parseJSON(conversationPxy.topicDetail);
                                        } catch (ex) {
                                            w.console.log('Incorect Topic Detail!');
                                        }
                                    }
                                    $mck_msg_inner.data('mck-conversationid', conversationPxy.id);
                                    params.conversationId = conversationPxy.id;
                                    if (typeof MCK_TAB_CONVERSATION_MAP[params.tabId] !== 'undefined') {
                                        var tabConvArray = MCK_TAB_CONVERSATION_MAP[params.tabId];
                                        tabConvArray.push(conversationPxy);
                                        MCK_TAB_CONVERSATION_MAP[params.tabId] = tabConvArray;
                                    }
                                    if (params.isGroup) {
                                        var group = mckGroupLayout.addGroup(groupPxy);
                                        params.tabId = group.contactId;
                                    }
                                    (params.isMessage && conversationPxy.created) ? mckMessageLayout.loadTab(params, _this.dispatchMessage) : mckMessageLayout.loadTab(params);
                                }
                            }
                        },
                        error: function () {
                        }
                    });
                }
            };
            _this.getTopicId = function (params) {
                if (params.conversationId) {
                    var data = "id=" + params.conversationId;
                    $applozic.ajax({
                        url: MCK_BASE_URL + TOPIC_ID_URL,
                        data: data,
                        global: false,
                        type: 'get',
                        success: function (data) {
                            if (typeof data === 'object' && data.status === "success") {
                                var conversationPxy = data.response;
                                if (typeof conversationPxy === 'object') {
                                    MCK_TOPIC_CONVERSATION_MAP[conversationPxy.topicId] = [params.conversationId];
                                    MCK_CONVERSATION_MAP[params.conversationId] = conversationPxy;
                                    if (conversationPxy.topicDetail) {
                                        try {
                                            MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId] = $applozic.parseJSON(conversationPxy.topicDetail);
                                        } catch (ex) {
                                            w.console.log('Incorect Topic Detail!');
                                        }
                                    }
                                    if (typeof (MCK_PRICE_DETAIL) === "function" && params.priceText) {
                                        MCK_PRICE_DETAIL({'custId': MCK_USER_ID, 'suppId': params.suppId, 'productId': conversationPxy.topicId, 'price': params.priceText});
                                        _this.sendConversationCloseUpdate(params.conversationId);
                                    }
                                    if (params.messageType && typeof params.message === 'object') {
                                        var tabId = (params.message.groupId) ? params.message.groupId : params.message.to;
                                        if (typeof MCK_TAB_CONVERSATION_MAP[tabId] !== 'undefined') {
                                            var tabConvArray = MCK_TAB_CONVERSATION_MAP[tabId];
                                            tabConvArray.push(conversationPxy);
                                            MCK_TAB_CONVERSATION_MAP[tabId] = tabConvArray;
                                        }
                                        mckMessageLayout.populateMessage(params.messageType, params.message, params.notifyUser);
                                    }
                                }
                            }
                        },
                        error: function () {
                        }
                    });
                }
            };
            _this.sendConversationCloseUpdate = function (conversationId) {
                if (conversationId) {
                    var data = "id=" + conversationId;
                    $applozic.ajax({
                        url: MCK_BASE_URL + CONVERSATION_CLOSE_UPDATE_URL,
                        data: data,
                        global: false,
                        type: 'get',
                        success: function () {
                        },
                        error: function () {
                        }
                    });
                }
            };
            _this.sendPriceMessage = function () {
                var priceText = $mck_price_text_box.val();
                if (priceText === "") {
                    $mck_price_text_box.addClass('mck-text-req');
                    return;
                }
                priceText = $applozic.trim(priceText);
                var tabId = $mck_msg_to.val();
                var conversationId = $mck_msg_inner.data('mck-conversationid', conversationId);
                var messagePxy = {
                    "type": 5,
                    "contentType": 4,
                    "message": priceText
                };
                if ($mck_msg_inner.data("isgroup") === true) {
                    messagePxy.groupId = tabId;
                } else {
                    messagePxy.to = tabId;
                }
                if ($mck_msg_inner.data('mck-conversationid')) {
                    var conversationId = $mck_msg_inner.data('mck-conversationid');
                    messagePxy.conversationId = conversationId;
                    var conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                    if (conversationPxy !== 'object') {
                        _this.getTopicId({'conversationId': conversationId, 'suppId': tabId, 'priceText': priceText});
                    } else if (typeof (MCK_PRICE_DETAIL) === "function") {
                        MCK_PRICE_DETAIL({'custId': MCK_USER_ID, 'suppId': tabId, 'productId': conversationPxy.topicId, 'price': priceText});
                    }
                    $mck_price_text_box.val("");
                }
                _this.sendMessage(messagePxy);
            };
            _this.dispatchMessage = function (params) {
                if (params.messagePxy === 'object') {
                    var messagePxy = params.messagePxy;
                    if (params.topicId) {
                        var topicDetail = MCK_TOPIC_DETAIL_MAP[params.topicId];
                        if (typeof topicDetail === 'object' && topicDetail.title !== 'undefined') {
                            if (!messagePxy.message) {
                                messagePxy.message = $applozic.trim(topicDetail.title);
                            }
                            if (params.conversationId) {
                                messagePxy.conversationId = params.conversationId;
                            } else if (params.topicId) {
                                var conversationPxy = {
                                    'topicId': params.topicId
                                };
                                if (typeof topicDetail === "object") {
                                    conversationPxy.topicDetail = w.JSON.stringify(topicDetail);
                                }
                                messagePxy.conversationPxy = conversationPxy;
                            }
                        }
                        if (!messagePxy.message && topicDetail.link) {
                            var fileMeta = {
                                "blobKey": $applozic.trim(topicDetail.link),
                                "contentType": "image/png"
                            };
                            messagePxy.fileMeta = fileMeta;
                            messagePxy.contentType = 5;
                            FILE_META = [];
                            FILE_META.push(fileMeta);
                        }
                    }
                    if (params.isGroup) {
                        messagePxy.groupId = params.tabId;
                    } else {
                        messagePxy.to = params.tabId;
                    }
                    _this.sendMessage(messagePxy);
                }
            };
            _this.getGroup = function (params) {
                var usersArray = [];
                $applozic.each(params.users, function (i, user) {
                    if (typeof user.userId !== "undefined") {
                        usersArray.push(user);
                    }
                });
                if (usersArray.length > 0) {
                    var groupInfo = {
                        'groupName': params.groupName,
                        'users': usersArray,
                        'type': params.type
                    };
                    $applozic.ajax({
                        url: MCK_BASE_URL + GROUP_CREATE_URL,
                        global: false,
                        data: w.JSON.stringify(groupInfo),
                        type: 'post',
                        contentType: 'application/json',
                        success: function (data) {
                            if (typeof data === 'object' && data.status === "success") {
                                var groupPxy = data.response;
                                if (typeof groupPxy === 'object') {
                                    var group = mckGroupLayout.addGroup(groupPxy);
                                    if (groupPxy.users.length > 0) {
                                        $applozic.each(groupPxy.users, function (i, userDetail) {
                                            MCK_USER_DETAIL_MAP[userDetail.userId] = userDetail;
                                            if (userDetail.connected) {
                                                w.MCK_OL_MAP[userDetail.userId] = true;
                                            } else {
                                                w.MCK_OL_MAP[userDetail.userId] = false;
                                                if (typeof userDetail.lastSeenAtTime !== "undefined") {
                                                    MCK_LAST_SEEN_AT_MAP[userDetail.userId] = userDetail.lastSeenAtTime;
                                                }
                                            }
                                            MCK_UNREAD_COUNT_MAP[userDetail.userId] = userDetail.unreadCount;
                                            var contact = mckMessageLayout.getContact('' + userDetail.userId);
                                            (typeof contact === 'undefined') ? mckMessageLayout.createContactWithDetail(userDetail) : mckMessageLayout.updateContactDetail(contact, userDetail);
                                        });
                                    }
                                    params.tabId = group.contactId;
                                    params.isGroup = true;
                                    (params.isMessage) ? mckMessageLayout.loadTab(params, _this.dispatchMessage) : mckMessageLayout.loadTab(params);
                                }
                            }
                        },
                        error: function () {
                        }
                    });
                }
            };
        }

        function MckContactUtils() {
            var _this = this;
            _this.getContactId = function (contact) {
                var contactId = contact.contactId;
                return _this.formatContactId(contactId);
            };
            _this.formatContactId = function (contactId) {
                if (contactId.indexOf("+") === 0) {
                    contactId = contactId.substring(1);
                }
                contactId = decodeURIComponent(contactId);
                return contactId.replace(/\@/g, "AT").replace(/\./g, "DOT").replace(/\*/g, "STAR").replace(/\#/g, "HASH").replace(/\|/g, "VBAR").replace(/\+/g, "PLUS").replace(/\;/g, "SCOLON");
            };
        }

        function MckMessageLayout() {
            var _this = this;
            var emojiTimeoutId = "";
            var $mck_search = $applozic("#mck-search");
            var $mck_msg_to = $applozic("#mck-msg-to");
            var $file_name = $applozic(".mck-file-lb");
            var $file_size = $applozic(".mck-file-sz");
            var $mck_sidebox = $applozic("#mck-sidebox");
            var $mck_file_box = $applozic("#mck-file-box");
            var $mck_msg_sbmt = $applozic("#mck-msg-sbmt");
            var $mck_msg_form = $applozic("#mck-msg-form");
            var $mck_text_box = $applozic("#mck-text-box");
            var $mck_msg_error = $applozic("#mck-msg-error");
            var $mck_show_more = $applozic("#mck-show-more");
            var $mck_tab_title = $applozic("#mck-tab-title");
            var $mck_tab_status = $applozic("#mck-tab-status");
            var $mck_msg_cell = $applozic("#mck-message-cell");
            var $mck_typing_box = $applozic(".mck-typing-box");
            var $mck_product_box = $applozic("#mck-product-box");
            var $mck_search_list = $applozic("#mck-search-list");
            var $mck_loading = $applozic("#mck-contact-loading");
            var $mck_price_widget = $applozic("#mck-price-widget");
            var $mck_msg_response = $applozic("#mck-msg-response");
            var $mck_product_icon = $applozic(".mck-product-icon");
            var $mck_contact_list = $applozic("#mck-contact-list");
            var $mck_product_title = $applozic(".mck-product-title");
            var $mck_response_text = $applozic("#mck_response_text");
            var $li_mck_block_user = $applozic("#li-mck-block-user");
            var $mck_delete_button = $applozic("#mck-delete-button");
            var $file_progress = $applozic("#mck-file-box .progress");
            var $mck_tab_individual = $applozic("#mck-tab-individual");
            var $mck_sidebox_search = $applozic("#mck-sidebox-search");
            var $mck_search_loading = $applozic("#mck-search-loading");
            var $mck_attachfile_box = $applozic("#mck-attachfile-box");
            var $mck_atttachmenu_box = $applozic("#mck-attachmenu-box");
            var $mck_sidebox_content = $applozic("#mck-sidebox-content");
            var $mck_tab_option_panel = $applozic("#mck-tab-option-panel");
            var $file_remove = $applozic("#mck-file-box .mck-remove-file");
            var $mck_contacts_content = $applozic("#mck-contacts-content");
            var $mck_tab_conversation = $applozic("#mck-tab-conversation");
            var $mck_product_subtitle = $applozic(".mck-product-subtitle");
            var $mck_conversation_list = $applozic("#mck-conversation-list");
            var $product_box_caret = $applozic("#mck-product-box .mck-caret");
            var $mck_tab_message_option = $applozic(".mck-tab-message-option");
            var $modal_footer_content = $applozic(".mck-box-ft .mck-box-form");
            var $mck_typing_box_text = $applozic(".mck-typing-box .name-text");
            var $mck_conversation_header = $applozic("#mck-conversation-header");
            var $mck_msg_inner = $applozic("#mck-message-cell .mck-message-inner");
            var $mck_product_up_key = $applozic(".mck-product-rt-up .mck-product-key");
            var $mck_product_up_value = $applozic(".mck-product-rt-up .mck-product-value");
            var $mck_product_down_key = $applozic(".mck-product-rt-down .mck-product-key");
            var $mck_product_down_value = $applozic(".mck-product-rt-down .mck-product-value");
            var FILE_PREVIEW_URL = "/rest/ws/aws/file/";
            var LINK_EXPRESSION = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var LINK_MATCHER = new RegExp(LINK_EXPRESSION);
            var markup = '<div name="message" data-msgdelivered="${msgDeliveredExpr}" data-msgsent="${msgSentExpr}" data-msgtype="${msgTypeExpr}" data-msgtime="${msgCreatedAtTime}" data-msgcontent="${replyIdExpr}" data-msgkey="${msgKeyExpr}" data-contact="${toExpr}" class="mck-m-b ${msgKeyExpr} ${msgFloatExpr}"><div class="mck-clear"><div class="blk-lg-12"><div class="mck-msg-box ${msgClassExpr}">' +
                    '<div class="${nameTextExpr} ${showNameExpr}">${msgNameExpr}</div>' +
                    '<div class="mck-file-text mck-msg-text notranslate blk-lg-12 mck-attachment n-vis" data-filemetakey="${fileMetaKeyExpr}" data-filename="${fileNameExpr}" data-filesize="${fileSizeExpr}">{{html fileExpr}}</div>' +
                    '<div class="mck-msg-text mck-msg-content"></div>' +
                    '<div class="n-vis mck-context-menu">' +
                    '<ul><li><a class="mck-message-delete">Delete</a></li></ul></div>' +
                    '</div></div>' +
                    '<div class="${msgFloatExpr}-muted mck-text-light mck-text-muted mck-text-xs mck-t-xs">${createdAtTimeExpr} <span class="${statusIconExpr} mck-message-status"></span></div>' +
                    '</div></div>';
            var contactbox = '<li id="li-${contHtmlExpr}" class="${contIdExpr}" data-msg-time="${msgCreatedAtTimeExpr}">' +
                    '<a class="${mckLauncherExpr}" href="#" data-mck-conversationid="${conversationExpr}" data-mck-id="${contIdExpr}" data-isgroup="${contTabExpr}">' +
                    '<div class="mck-row" title="${contNameExpr}">' +
                    '<div class="mck-conversation-topic mck-truncate ${contHeaderExpr}">${titleExpr}</div>' +
                    '<div class="blk-lg-3">{{html contImgExpr}}</div>' +
                    '<div class="blk-lg-9">' +
                    '<div class="mck-row">' +
                    '<div class="blk-lg-8 mck-cont-name mck-truncate"><div class="mck-ol-status ${contOlExpr}"><span class="mck-ol-icon" title="online"></span>&nbsp;</div><strong>${contNameExpr}</strong></div>' +
                    '<div class="mck-text-muted move-right mck-cont-msg-date mck-truncate blk-lg-4">${msgCreatedDateExpr}</div></div>' +
                    '<div class="mck-row">' +
                    '<div class="mck-cont-msg-wrapper blk-lg-6 mck-truncate msgTextExpr"></div>' +
                    '<div class="mck-unread-count-box move-right mck-truncate ${contUnreadExpr}"><span class="mck-unread-count-text">{{html contUnreadCount}}</span></div>' +
                    '</div></div></div></a></li>';
            var convbox = '<li id="li-${convIdExpr}" class="${convIdExpr}">' +
                    '<a class="${mckLauncherExpr}" href="#" data-mck-conversationid="${convIdExpr}" data-mck-id="${tabIdExpr}" data-isgroup="${isGroupExpr}" data-mck-topicid="${topicIdExpr}" data-isconvtab="true">' +
                    '<div class="mck-row mck-truncate" title="${convTitleExpr}">${convTitleExpr}</div>' +
                    '</a></li>';
            $applozic.template("messageTemplate", markup);
            $applozic.template("contactTemplate", contactbox);
            $applozic.template("convTemplate", convbox);
            _this.openConversation = function () {
                if ($mck_sidebox.css('display') === 'none') {
                    $applozic('.mckModal').mckModal('hide');
                    $mck_sidebox.mckModal();
                }
                $mck_msg_to.focus();
            };
            _this.initEmojis = function () {
                try {
                    $applozic("#mck-text-box").emojiarea({button: "#mck-btn-smiley",
                        wysiwyg: true,
                        menuPosition: 'top'});
                } catch (ex) {
                    if (!emojiTimeoutId) {
                        emojiTimeoutId = setTimeout(function () {
                            _this.initEmojis();
                        }, 30000);
                    }
                }
            };
            _this.loadTab = function (params, callback) {
                var currTabId = $mck_msg_inner.data('mck-id');
                if (currTabId) {
                    if ($mck_text_box.html().length > 1 || $mck_file_box.hasClass('vis')) {
                        var text = $mck_text_box.html();
                        var tab_draft = {
                            'text': text,
                            'files': []
                        };
                        if ($mck_file_box.hasClass('vis')) {
                            $applozic(".mck-file-box").each(function () {
                                var $fileBox = $applozic(this);
                                var file = {
                                    filelb: $fileBox.find('.mck-file-lb').html(),
                                    filesize: $fileBox.find('.mck-file-sz').html()
                                };
                                var fileMeta = $fileBox.data('mckfile');
                                if (typeof fileMeta === 'object') {
                                    file.fileMeta = fileMeta;
                                }
                                tab_draft.files.push(file);
                            });
                        }
                        TAB_MESSAGE_DRAFT[currTabId] = tab_draft;
                    } else {
                        delete TAB_MESSAGE_DRAFT[currTabId];
                    }
                }
                _this.clearMessageField();
                _this.addDraftMessage(params.tabId);
                $mck_msg_error.html("");
                $mck_msg_error.removeClass('vis').addClass('n-vis');
                $mck_response_text.html("");
                $mck_msg_response.removeClass('vis').addClass('n-vis');
                $mck_msg_form[0].reset();
                $mck_msg_form.removeClass('n-vis').addClass('vis');
                $mck_msg_inner.html("");
                $mck_msg_error.removeClass('mck-no-mb');
                $mck_contacts_content.removeClass('n-vis').addClass('vis');
                $modal_footer_content.removeClass('vis').addClass('n-vis');
                $mck_sidebox_search.removeClass('vis').addClass('n-vis');
                $mck_sidebox_content.removeClass('n-vis').addClass('vis');
                $mck_conversation_header.addClass('n-vis');
                $mck_loading.removeClass('vis').addClass('n-vis');
                $mck_msg_inner.removeClass('mck-group-inner');
                $mck_tab_status.removeClass('vis').addClass('n-vis');
                $mck_tab_title.removeClass("mck-tab-title-w-status");
                $mck_tab_title.removeClass("mck-tab-title-w-typing");
                $mck_typing_box.removeClass('vis').addClass('n-vis');
                $mck_typing_box_text.html("");
                $mck_msg_inner.data('isgroup', params.isGroup);
                $mck_msg_inner.data('datetime', "");
                if (params.tabId) {
                    mckInitializeChannel.subscibeToTypingChannel(params.tabId, params.isGroup);
                    $mck_msg_to.val(params.tabId);
                    $mck_msg_inner.data('mck-id', params.tabId);
                    $mck_msg_inner.data('mck-conversationid', params.conversationId);
                    $mck_msg_inner.data('mck-topicid', params.topicId);
                    $mck_show_more.data('tabId', params.tabId);
                    $mck_tab_option_panel.removeClass('n-vis').addClass('vis');
                    $mck_contacts_content.removeClass('vis').addClass('n-vis');
                    $modal_footer_content.removeClass('n-vis').addClass('vis');
                    $mck_delete_button.removeClass('n-vis').addClass('vis');
                    if (params.isGroup) {
                        $mck_msg_inner.addClass('mck-group-inner');
                        $li_mck_block_user.removeClass('vis').addClass('n-vis');
                    } else {
                        $li_mck_block_user.removeClass('n-vis').addClass('vis');
                    }
                    if (!params.topicId && params.conversationId) {
                        var conversationPxy = MCK_CONVERSATION_MAP[params.conversationId];
                        if (typeof conversationPxy === 'object') {
                            params.topicId = conversationPxy.topicId;
                        }
                    }
                    if (params.topicId) {
                        var topicDetail = MCK_TOPIC_DETAIL_MAP[params.topicId];
                        if (typeof topicDetail === "object") {
                            if (IS_MCK_TOPIC_HEADER) {
                                $mck_msg_inner.data('mck-title', topicDetail.title);
                                $mck_conversation_header.html(topicDetail.title);
                                $mck_conversation_header.removeClass('n-vis');
                            } else if (IS_MCK_TOPIC_BOX) {
                                _this.setProductProperties(topicDetail);
                                $product_box_caret.addClass('n-vis');
                                $mck_product_box.addClass('mck-product-box-wc');
                                $mck_conversation_list.addClass('n-vis');
                                $mck_product_box.removeClass('n-vis').addClass('vis');
                            }
                        }
                    }
                    if (IS_MCK_LOCSHARE) {
                        $mck_attachfile_box.removeClass("vis").addClass('n-vis');
                        $mck_atttachmenu_box.removeClass("n-vis").addClass("vis");
                    } else {
                        $mck_atttachmenu_box.removeClass("vis").addClass("n-vis");
                        $mck_attachfile_box.removeClass("n-vis").addClass('vis');
                    }
                    $mck_tab_title.html(_this.getTabDisplayName(params.tabId, params.isGroup, params.userName));
                    $mck_tab_conversation.removeClass('vis').addClass('n-vis');
                    $mck_tab_individual.removeClass('n-vis').addClass('vis');
                    if (MCK_MODE === 'support') {
                        $applozic('.mck-tab-link').removeClass('vis').addClass('n-vis');
                    }
                    if (MCK_PRICE_WIDGET_ENABLED) {
                        $mck_price_widget.removeClass('n-vis').addClass('vis');
                        $mck_msg_inner.addClass('mck-msg-w-panel');
                    }
                    if (IS_MCK_USER_DEACTIVATED) {
                        $mck_msg_error.html("Deactivated");
                        $mck_msg_error.removeClass('n-vis').addClass('vis').addClass('mck-no-mb');
                        $mck_msg_form.removeClass('vis').addClass('n-vis');
                    }
                } else {
                    params.tabId = "";
                    mckInitializeChannel.unsubscibeToTypingChannel();
                    $mck_tab_individual.removeClass('vis').addClass('n-vis');
                    $mck_tab_conversation.removeClass('n-vis').addClass('vis');
                    $mck_product_box.removeClass('vis').addClass('n-vis');
                    $mck_msg_inner.data('mck-id', "");
                    $mck_msg_inner.data('mck-conversationid', "");
                    $mck_msg_inner.data('mck-topicid', "");
                    $mck_price_widget.removeClass('vis').addClass('n-vis');
                    $mck_msg_inner.removeClass('mck-msg-w-panel');
                    $mck_tab_option_panel.removeClass('vis').addClass('n-vis');
                    $mck_delete_button.removeClass('vis').addClass('n-vis');
                    $mck_msg_to.val("");
                    var mckMessageArray = mckStorage.getMckMessageArray();
                    if (mckMessageArray !== null && mckMessageArray.length > 0) {
                        mckMessageLayout.addContactsFromMessageList({
                            message: mckMessageArray
                        }, true);
                        $mck_msg_inner.animate({
                            scrollTop: 0
                        }, 0);
                        _this.openConversation();
                        return;
                    }
                }
                mckMessageService.loadMessageList(params, callback);
                _this.openConversation();
            };
            _this.setProductProperties = function (topicDetail) {
                $mck_product_title.html(topicDetail.title);
                $mck_product_icon.html(_this.getTopicLink(topicDetail.link));
                var subtitle = (topicDetail.subtitle) ? topicDetail.subtitle : "";
                $mck_product_subtitle.html(subtitle);
                var key1 = (topicDetail.key1) ? topicDetail.key1 : "";
                var value1 = (topicDetail.value1) ? topicDetail.value1 : "";
                $mck_product_up_key.html(key1);
                $mck_product_up_value.html(value1);
                var key2 = (topicDetail.key2) ? topicDetail.key2 : "";
                var value2 = (topicDetail.value2) ? topicDetail.value2 : "";
                $mck_product_down_key.html(key2);
                $mck_product_down_value.html(value2);
            };
            _this.getTopicLink = function (topicLink) {
                return (topicLink) ? '<img src="' + topicLink + '">' : '<span class="mck-icon-no-image"></span>';
            };
            _this.processMessageList = function (data, scroll) {
                var showMoreDateTime;
                if (typeof data.message.length === "undefined") {
                    _this.addMessage(data.message, false, scroll, true);
                    showMoreDateTime = data.createdAtTime;
                } else {
                    $applozic.each(data.message, function (i, message) {
                        if (!(typeof message.to === "undefined")) {
                            _this.addMessage(message, false, scroll, true);
                            showMoreDateTime = message.createdAtTime;
                        }
                    });
                }
                $mck_show_more.data('datetime', showMoreDateTime);
            };
            _this.closeConversation = function () {
                if (typeof MCK_DISPLAY_TEXT === 'function') {
                    var displayText = MCK_DISPLAY_TEXT();
                    if (typeof displayText === 'object') {
                        var text = displayText.onConversationClose;
                    }
                }
                if (!text) {
                    text = 'Chat disabled with user';
                }
                $mck_msg_error.html(text);
                $mck_msg_error.removeClass('n-vis').addClass('vis').addClass('mck-no-mb');
                $mck_msg_form.removeClass('vis').addClass('n-vis');
            };
            _this.addTooltip = function (msgKey) {
                $applozic("." + msgKey + " .mck-icon-time").attr('title', 'pending');
                $applozic("." + msgKey + " .mck-btn-trash").attr('title', 'delete');
                $applozic("." + msgKey + " .mck-icon-sent").attr('title', 'sent');
                $applozic("." + msgKey + " .mck-btn-forward").attr('title', 'forward message');
                $applozic("." + msgKey + " .mck-icon-delivered").attr('title', 'delivered');
                $applozic("." + msgKey + " .mck-icon-read").attr('title', 'delivered and read');
                $applozic("." + msgKey + " .msgtype-outbox-cr").attr('title', 'sent via Carrier');
                $applozic("." + msgKey + " .msgtype-outbox-mck").attr('title', 'sent');
                $applozic("." + msgKey + " .msgtype-inbox-cr").attr('title', 'received via Carrier');
                $applozic("." + msgKey + " .msgtype-inbox-mck").attr('title', 'recieved');
            };
            _this.fetchContact = function (contactId) {
                var contact = _this.getContact(contactId);
                if (typeof contact === 'undefined') {
                    contact = _this.createContact(contactId);
                }
                return contact;
            };
            _this.getContact = function (contactId) {
                if (typeof MCK_CONTACT_MAP[contactId] === 'object') {
                    return  MCK_CONTACT_MAP[contactId];
                } else {
                    return;
                }
            };
            _this.getContactDisplayName = function (userId) {
                if (typeof MCK_CONTACT_NAME_MAP[userId] === 'string') {
                    return  MCK_CONTACT_NAME_MAP[userId];
                } else {
                    return;
                }
            };
            _this.addMessage = function (msg, append, scroll, appendContextMenu) {
                if (msg.type === 6 || msg.type === 7) {
                    return;
                }
                if ($applozic("#mck-message-cell ." + msg.key).length > 0) {
                    return;
                }
                if ($applozic("#mck-message-cell .mck-no-data-text").length > 0) {
                    $applozic(".mck-no-data-text").remove();
                }
                var messageClass = "";
                var floatWhere = "mck-msg-right";
                var statusIcon = "mck-icon-time";
                var contactExpr = "vis";
                if (msg.type === 0 || msg.type === 4 || msg.type === 6) {
                    floatWhere = "mck-msg-left";
                }
                if (msg.contentType === 4 || msg.contentType === 10) {
                    floatWhere = "mck-msg-center";
                }
                statusIcon = _this.getStatusIconName(msg);
                var replyId = msg.key;
                var replyMessageParameters = "'" + msg.deviceKey + "'," + "'" + msg.to + "'" + ",'" + msg.to + "'" + ",'" + replyId + "'";
                var displayName = "";
                var nameTextExpr = "";
                var showNameExpr = "n-vis";
                if (msg.groupId && msg.contentType !== 4 && (msg.type === 0 || msg.type === 4 || msg.type === 6)) {
                    var displayName = _this.getTabDisplayName(msg.to, false);
                    showNameExpr = "vis";
                    nameTextExpr = _this.getNameTextClassByAlphabet(displayName);
                }
                if (msg.groupId && msg.contentType === 10) {
                    displayName = "";
                    nameTextExpr = "";
                }
                var msgFeatExpr = "n-vis";
                var fileName = "";
                var fileSize = "";
                var frwdMsgExpr = msg.message;
                if (typeof msg.fileMeta === "object") {
                    fileName = msg.fileMeta.name;
                    fileSize = msg.fileMeta.size;
                }
                var msgList = [
                    {
                        msgKeyExpr: msg.key,
                        msgDeliveredExpr: msg.delivered,
                        msgSentExpr: msg.sent,
                        msgCreatedAtTime: msg.createdAtTime,
                        msgTypeExpr: msg.type,
                        msgSourceExpr: msg.source,
                        statusIconExpr: statusIcon,
                        contactExpr: contactExpr,
                        toExpr: msg.to,
                        showNameExpr: showNameExpr,
                        msgNameExpr: displayName,
                        nameTextExpr: nameTextExpr,
                        msgFloatExpr: floatWhere,
                        replyIdExpr: replyId,
                        createdAtTimeExpr: mckDateUtils.getDate(msg.createdAtTime),
                        msgFeatExpr: msgFeatExpr,
                        replyMessageParametersExpr: replyMessageParameters,
                        msgClassExpr: messageClass,
                        msgExpr: frwdMsgExpr,
                        selfDestructTimeExpr: msg.timeToLive,
                        fileMetaKeyExpr: msg.fileMetaKey,
                        fileExpr: _this.getFilePath(msg),
                        fileNameExpr: fileName,
                        fileSizeExpr: fileSize
                    }
                ];
                append ? $applozic.tmpl("messageTemplate", msgList).appendTo("#mck-message-cell .mck-message-inner") : $applozic.tmpl("messageTemplate", msgList).prependTo("#mck-message-cell .mck-message-inner");
                var emoji_template = "";
                if (msg.message) {
                    var msg_text = msg.message.replace(/\n/g, '<br/>');
                    if (w.emoji !== null && typeof w.emoji !== 'undefined') {
                        emoji_template = w.emoji.replace_unified(msg_text);
                        emoji_template = w.emoji.replace_colons(emoji_template);
                    } else {
                        emoji_template = msg_text;
                    }
                }
                if (msg.conversationId) {
                    var conversationPxy = MCK_CONVERSATION_MAP[msg.conversationId];
                    if (typeof conversationPxy !== 'object') {
                        mckMessageService.getTopicId({'conversationId': msg.conversationId});
                    }
                    if (append) {
                        $mck_msg_inner.data('mck-conversationid', msg.conversationId);
                        if (conversationPxy) {
                            var topicDetail = MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId];
                            if (typeof topicDetail === "object") {
                                if (IS_MCK_TOPIC_BOX) {
                                    _this.setProductProperties(topicDetail);
                                } else if (IS_MCK_TOPIC_HEADER) {
                                    $mck_conversation_header.html(topicDetail.title);
                                }
                            }
                        }
                    }
                }
                if (msg.contentType === 4) {
                    var priceText = emoji_template;
                    emoji_template = "Final agreed price: " + emoji_template;
                    if (!MCK_PRICE_WIDGET_ENABLED)
                        emoji_template += '<br/><button class="mck-accept" data-mck-topic-price="' + priceText + '" data-mck-conversationid="' + msg.conversationId + '">Accept</button>';
                }
                var $textMessage = $applozic("." + replyId + " .mck-msg-content");
                if (emoji_template.indexOf('emoji-inner') === -1 && msg.contentType === 0) {
                    var nodes = emoji_template.split("<br/>");
                    for (var i = 0; i < nodes.length; i++) {
                        var x = d.createElement('div');
                        x.appendChild(d.createTextNode(nodes[i]));
                        if (nodes[i] && nodes[i].match(LINK_MATCHER)) {
                            x = $applozic(x).linkify({target: '_blank'});
                        }
                        $textMessage.append(x);
                    }
                } else {
                    $textMessage.html(emoji_template);
                    $textMessage.linkify({target: '_blank'});
                }
                if (msg.fileMeta) {
                    $applozic("." + replyId + " .mck-file-text a").trigger('click');
                    $applozic("." + replyId + " .mck-file-text").removeClass('n-vis').addClass('vis');
                    if ($textMessage.html() === "") {
                        $textMessage.removeClass('vis').addClass('n-vis');
                    }
                }
                if (msg.contentType === 2) {
                    $textMessage.removeClass('vis').addClass('n-vis');
                    $applozic("." + replyId + " .mck-file-text").removeClass('n-vis').addClass('vis');
                }
                if (scroll) {
                    $mck_msg_inner.animate({
                        scrollTop: $mck_msg_inner.prop("scrollHeight")
                    }, 0);
                }
                if ($mck_tab_message_option.hasClass('n-vis')) {
                    $mck_tab_message_option.removeClass('n-vis').addClass('vis');
                }
                _this.addTooltip(msg.key);
                if (msg.contentType !== 4 && msg.contentType !== 10 && appendContextMenu) {
                    _this.messageContextMenu(msg.key);
                }
            };
            _this.getFilePath = function (msg) {
                if (msg.contentType === 2) {
                    try {
                        var geoLoc = $applozic.parseJSON(msg.message);
                        if (geoLoc.lat && geoLoc.lon) {
                            return '<a href="http://maps.google.com/maps?z=17&t=m&q=loc:' + geoLoc.lat + "," + geoLoc.lon + '" target="_blank"><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=200x150&center=' + geoLoc.lat + "," + geoLoc.lon + '&maptype=roadmap&markers=color:red|' + geoLoc.lat + "," + geoLoc.lon + '"/></a>';
                        }
                    } catch (ex) {
                        if (msg.message.indexOf(",") !== -1) {
                            return '<a href="http://maps.google.com/maps?z=17&t=m&q=loc:' + msg.message + '" target="_blank"><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=200x150&center=' + msg.message + '&maptype=roadmap&markers=color:red|' + msg.message + '" /></a>';
                        }
                    }
                }
                if (typeof msg.fileMeta === "object") {
                    if (msg.fileMeta.contentType.indexOf("image") !== -1) {
                        if (msg.fileMeta.contentType.indexOf("svg") !== -1) {
                            return '<a href="#" role="link" class="file-preview-link fancybox-media fancybox" data-type="' + msg.fileMeta.contentType + '" data-url="' + MCK_FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" data-name="' + msg.fileMeta.name + '"><img src="' + MCK_FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" area-hidden="true"></img></a>';
                        } else if (msg.contentType === 5) {
                            return '<a href="#" role="link" class="file-preview-link fancybox-media fancybox" data-type="' + msg.fileMeta.contentType + '" data-url="' + msg.fileMeta.blobKey + '" data-name="' + msg.fileMeta.name + '"><img src="' + msg.fileMeta.blobKey + '" area-hidden="true"></img></a>';
                        } else {
                            return '<a href="#" role="link" class="file-preview-link fancybox-media fancybox" data-type="' + msg.fileMeta.contentType + '" data-url="' + MCK_FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" data-name="' + msg.fileMeta.name + '"><img src="' + msg.fileMeta.thumbnailUrl + '" area-hidden="true" ></img></a>';
                        }
                    } else if (msg.fileMeta.contentType.indexOf("video") !== -1) {
                        return '<a href="#" role="link" class="file-preview-link fancybox-media fancybox" data-type="' + msg.fileMeta.contentType + '" data-url="' + MCK_FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" data-name="' + msg.fileMeta.name + '"><div class="mck-video-box n-vis"><video controls preload><source src="' + MCK_FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" type="' + msg.fileMeta.contentType + '">Your browser does not support the HTML 5 video tag</video></div><span class="file-detail"><span class="mck-file-name"><span class="mck-icon-attachment"></span>&nbsp;' + msg.fileMeta.name + '</span>&nbsp;<span class="file-size">' + mckFileService.getFilePreviewSize(msg.fileMeta.size) + '</span></span></a>';
                    } else {
                        return '<a href="' + MCK_FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" role="link" class="file-preview-link" target="_blank"><span class="file-detail"><span class="mck-file-name"><span class="mck-icon-attachment"></span>&nbsp;' + msg.fileMeta.name + '</span>&nbsp;<span class="file-size">' + mckFileService.getFilePreviewSize(msg.fileMeta.size) + '</span></span></a>';
                    }
                }
                return "";
            };
            _this.getFileIcon = function (msg) {
                if (msg.fileMetaKey && typeof msg.fileMeta === "object") {
                    return (msg.fileMeta.contentType.indexOf("image") !== -1) ? '<span class="mck-icon-camera"></span>&nbsp;<span>image</span>' : '<span class="mck-icon-attachment"></span>&nbsp;<span>file</span>';
                } else {
                    return "";
                }
            };
            _this.getContactImageLink = function (contact, displayName) {
                var imgsrctag = "";
                if (!displayName) {
                    displayName = mckGroupLayout.getGroupDisplayName(contact.contactId);
                }
                if (contact.isGroup) {
                    imgsrctag = _this.getContactImageByAlphabet(displayName);
                } else {
                    if (typeof (MCK_GETUSERIMAGE) === "function") {
                        var imgsrc = MCK_GETUSERIMAGE(contact.contactId);
                        if (imgsrc && typeof imgsrc !== 'undefined') {
                            imgsrctag = '<img src="' + imgsrc + '"/>';
                        }
                    }
                    if (!imgsrctag) {
                        if (contact.photoSrc) {
                            imgsrctag = '<img src="' + contact.photoSrc + '"/>';
                        } else if (contact.photoLink) {
                            imgsrctag = '<img src="' + MCK_BASE_URL + '/contact.image?photoLink=' + contact.photoLink + '"/>';
                        } else {
                            if (!displayName) {
                                displayName = contact.displayName;
                            }
                            imgsrctag = _this.getContactImageByAlphabet(displayName);
                        }
                    }
                }
                return imgsrctag;
            };
            _this.getContactImageByAlphabet = function (name) {
                if (typeof name === 'undefined' || name === "") {
                    return '<div class="mck-alpha-contact-image mck-alpha-user"><span class="mck-icon-user"></span></div>';
                }
                var first_alpha = name.charAt(0);
                var letters = /^[a-zA-Z]+$/;
                if (first_alpha.match(letters)) {
                    first_alpha = first_alpha.toUpperCase();
                    return '<div class="mck-alpha-contact-image alpha_' + first_alpha + '"><span class="mck-contact-icon">' + first_alpha + '</span></div>';
                } else {
                    return '<div class="mck-alpha-contact-image alpha_user"><span class="mck-icon-user"></span></div>';
                }
            };
            _this.getNameTextClassByAlphabet = function (name) {
                if (typeof name === 'undefined' || name === "") {
                    return 'mck-text-user';
                }
                var first_alpha = name.charAt(0);
                var letters = /^[a-zA-Z]+$/;
                if (first_alpha.match(letters)) {
                    first_alpha = first_alpha.toLowerCase();
                    return 'mck-text-' + first_alpha;
                } else {
                    return 'mck-text-user';
                }
            };
            _this.addContactsFromMessageList = function (data, isReloaded) {
                var showMoreDateTime;
                if (data + '' === "null") {
                    showMoreDateTime = "";
                    return;
                } else {
                    if (isReloaded) {
                        $mck_msg_inner.html('<ul id="mck-contact-list" class="mck-contact-list mck-nav mck-nav-tabs mck-nav-stacked"></ul>');
                    }
                    if (typeof data.message.length === "undefined") {
                        if (data.message.groupId) {
                            _this.addGroupFromMessage(data.message);
                        } else {
                            _this.addContactsFromMessage(data.message);
                        }
                        showMoreDateTime = data.message.createdAtTime;
                    } else {
                        $applozic.each(data.message, function (i, message) {
                            if (!(typeof message.to === "undefined")) {
                                (message.groupId) ? _this.addGroupFromMessage(message, true) : _this.addContactsFromMessage(message, true);
                                showMoreDateTime = message.createdAtTime;
                            }
                        });
                    }
                    $mck_msg_inner.data('datetime', showMoreDateTime);
                }
            };
            _this.addGroupFromMessageList = function (data, isReloaded) {
                if (data + '' === "null") {
                    return;
                } else {
                    if (isReloaded) {
                        $mck_msg_inner.html('<ul id="mck-group-list" class="mck-contact-list mck-nav mck-nav-tabs mck-nav-stacked"></ul>');
                    }
                    if (typeof data.message.length === "undefined") {
                        _this.addGroupFromMessage(data.message);
                    } else {
                        $applozic.each(data.message, function (i, message) {
                            if (!(typeof message.to === "undefined")) {
                                _this.addGroupFromMessage(message, true);
                            }
                        });
                    }
                }
            };
            _this.createContact = function (contactId) {
                var displayName = _this.getContactDisplayName(contactId);
                if (typeof displayName === 'undefined') {
                    displayName = contactId;
                }
                var contact = {
                    'contactId': contactId,
                    'htmlId': mckContactUtils.formatContactId(contactId),
                    'displayName': displayName,
                    'name': displayName + " <" + contactId + ">" + " [" + "Main" + "]",
                    'value': contactId,
                    'rel': '',
                    'photoLink': '',
                    'photoSrc': '',
                    'email': '',
                    'unsaved': true,
                    'appVersion': null,
                    'isGroup': false
                };
                MCK_CONTACT_MAP[contactId] = contact;
                return contact;
            };
            _this.createContactWithDetail = function (data) {
                var displayName = data.displayName;
                var contactId = data.userId;
                if (!displayName) {
                    displayName = _this.getContactDisplayName(contactId);
                }
                if (typeof displayName === 'undefined') {
                    displayName = contactId;
                } else {
                    MCK_CONTACT_NAME_MAP[contactId] = displayName;
                }
                var photoLink = (data.photoLink) ? data.photoLink : "";
                if (!photoLink) {
                    photoLink = (data.imageLink) ? data.imageLink : "";
                }
                var contact = {
                    'contactId': contactId,
                    'htmlId': mckContactUtils.formatContactId(contactId),
                    'displayName': displayName,
                    'name': displayName + " <" + contactId + ">" + " [" + "Main" + "]",
                    'value': contactId,
                    'rel': '',
                    'photoLink': '',
                    'photoSrc': photoLink,
                    'email': '',
                    'unsaved': true,
                    'appVersion': null,
                    'isGroup': false
                };
                MCK_CONTACT_MAP[contactId] = contact;
                return contact;
            };
            _this.updateContactDetail = function (contact, data) {
                var displayName = data.displayName;
                var contactId = data.userId;
                if (!displayName) {
                    displayName = _this.getContactDisplayName(contactId);
                }
                if (typeof displayName === 'undefined') {
                    displayName = contactId;
                } else {
                    MCK_CONTACT_NAME_MAP[contactId] = displayName;
                }
                contact.displayName = displayName;
                var photoLink = data.photoLink;
                if (!photoLink) {
                    photoLink = (data.imageLink) ? data.imageLink : "";
                }
                contact.photoSrc = photoLink;
                MCK_CONTACT_MAP[contactId] = contact;
                return contact;
            };
            _this.addContactsFromMessage = function (message, update) {
                var contactIdsArray = _this.getUserIdFromMessage(message);
                if (contactIdsArray.length > 0 && contactIdsArray[0]) {
                    for (var i = 0; i < contactIdsArray.length; i++) {
                        var contact = _this.fetchContact('' + contactIdsArray[i]);
                        _this.updateRecentConversationList(contact, message, update);
                    }
                }
            };
            _this.addGroupFromMessage = function (message, update) {
                var groupId = message.groupId;
                var group = mckGroupLayout.getGroup('' + groupId);
                if (typeof group === 'undefined') {
                    group = mckGroupLayout.createGroup(groupId);
                    mckGroupService.loadGroups();
                }
                _this.updateRecentConversationList(group, message, update);
            };
            _this.updateRecentConversationList = function (contact, message, update) {
                var $listId = "mck-contact-list";
                if ($applozic("#" + $listId + " #li-" + contact.htmlId).length > 0) {
                    var $mck_msg_part = $applozic("#" + $listId + " #li-" + contact.htmlId + " .mck-cont-msg-wrapper");
                    if (($mck_msg_part.is(":empty") || update) && message !== undefined) {
                        _this.updateContact(contact, message, $listId);
                    }
                } else {
                    _this.addContact(contact, $listId, message);
                }
            };
            _this.addContactsToSearchList = function (userIdArray, isLocal) {
                var contactsArray = [];
                if (isLocal) {
                    for (var i = 0; i < MCK_CONTACT_ARRAY.length; i++) {
                        var contact = MCK_CONTACT_ARRAY[i];
                        userIdArray.push(contact.contactId);
                    }
                }
                userIdArray.sort();
                $mck_search_list.html('');
                for (var j = 0; j < userIdArray.length; j++) {
                    var userId = userIdArray[j];
                    if (userId) {
                        var contact = _this.fetchContact('' + userId);
                        contactsArray.push(contact);
                        if ($applozic("#mck-search-list #li-" + contact.htmlId).length === 0) {
                            _this.addContact(contact, "mck-search-list");
                        }
                    }
                }
                _this.initAutoSuggest(contactsArray);
            };
            _this.initAutoSuggest = function (contactsArray) {
                var typeaheadArray = [];
                var typeaheadEntry;
                var typeaheadMap = {};
                var contactSuggestionsArray = [];
                for (var j = 0; j < contactsArray.length; j++) {
                    var contact = contactsArray[j];
                    contact.displayName = _this.getTabDisplayName(contact.contactId, false);
                    typeaheadEntry = (contact.displayName) ? $applozic.trim(contact.displayName) : $applozic.trim(contact.contactId);
                    typeaheadMap[typeaheadEntry] = contact;
                    typeaheadArray.push(typeaheadEntry);
                    contactSuggestionsArray.push(typeaheadEntry);
                }
                $mck_search.mcktypeahead({
                    source: typeaheadArray,
                    matcher: function (item) {
                        var contact = typeaheadMap[item];
                        var contactNameArray = contact.displayName.split(" ");
                        var contactNameLength = contactNameArray.length;
                        var contactFName = contactNameArray[0];
                        var contactMName = "";
                        var contactLName = "";
                        if (contactNameLength === 2) {
                            contactLName = contactNameArray[1];
                        } else if (contactNameLength >= 3) {
                            contactLName = contactNameArray[contactNameLength - 1];
                            contactMName = contactNameArray[contactNameLength - 2];
                        }
                        var matcher = new RegExp(this.query, "i");
                        return matcher.test(contact.displayName) || matcher.test(contact.contactId) || matcher.test(contactMName) || matcher.test(contactLName) || matcher.test(contact.email) || matcher.test(contactFName + " " + contactLName);
                    },
                    highlighter: function (item) {
                        var contact = typeaheadMap[item];
                        return contact.displayName;
                    },
                    updater: function (item) {
                        var contact = typeaheadMap[item];
                        mckMessageLayout.loadTab({tabId: contact.contactId, isGroup: false});
                        $modal_footer_content.removeClass('n-vis').addClass('vis');
                    }
                });
                _this.initSearchAutoType();
            };
            _this.initSearchAutoType = function () {
                $mck_search.keypress(function (e) {
                    if (e.which === 13) {
                        var tabId = $mck_search.val();
                        if (tabId !== "") {
                            mckMessageLayout.loadTab({'tabId': tabId, 'isGroup': false});
                            $modal_footer_content.removeClass('n-vis').addClass('vis');
                        }
                        $applozic(this).val("");
                        return true;
                    }
                });
                $applozic(d).on("click", ".mck-tab-search", function (e) {
                    e.preventDefault();
                    var tabId = $mck_search.val();
                    if (tabId !== "") {
                        mckMessageLayout.loadTab({tabId: tabId, isGroup: false});
                        $modal_footer_content.removeClass('n-vis').addClass('vis');
                    }
                    $mck_search.val("");
                });
            };
            _this.removeContact = function (contact) {
                $applozic("#li-" + contact.htmlId).remove();
            };
            _this.updateContact = function (contact, message, $listId) {
                var $contactElem = $applozic("#li-" + contact.htmlId);
                var currentMessageTime = $contactElem.data('msg-time');
                if (message && message.createdAtTime > currentMessageTime) {
                    var unreadCount = _this.getUnreadCount(contact.contactId);
                    var emoji_template = _this.getMessageTextForContactPreview(message, contact, 15);
                    $applozic("#li-" + contact.htmlId + " .mck-cont-msg-date").html(typeof message.createdAtTime === 'undefined' ? "" : mckDateUtils.getTimeOrDate(message ? message.createdAtTime : "", true));
                    var $messageText = $applozic("#li-" + contact.htmlId + " .mck-cont-msg-wrapper");
                    $messageText.html("");
                    (typeof emoji_template === 'object') ? $messageText.append(emoji_template) : $messageText.html(emoji_template);
                    if (message.conversationId) {
                        var conversationId = message.conversationId;
                        var conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                        if (typeof conversationPxy === 'object') {
                            var topicId = conversationPxy.topicId;
                            if (topicId && IS_MCK_TOPIC_HEADER) {
                                var topicDetail = MCK_TOPIC_DETAIL_MAP[topicId];
                                if (typeof topicDetail === "object") {
                                    $applozic("#li-" + contact.htmlId + " .mck-conversation-topic").html(topicDetail.title);
                                }
                            }
                        }
                        $applozic("#li-" + contact.htmlId + " a").data('mck-conversationid', conversationId);
                    }
                    if (unreadCount > 0) {
                        $applozic("#li-" + contact.htmlId + " .mck-unread-count-text").html(unreadCount);
                        $applozic("#li-" + contact.htmlId + " .mck-unread-count-box").removeClass('n-vis').addClass('vis');
                    }
                    var latestCreatedAtTime = $applozic('#' + $listId + ' li:nth-child(1)').data('msg-time');
                    $contactElem.data('msg-time', message.createdAtTime);
                    if ((typeof latestCreatedAtTime === "undefined" || (message ? message.createdAtTime : "") >= latestCreatedAtTime) && $applozic("#mck-contact-list li").index($contactElem) !== 0) {
                        $applozic('#' + $listId + ' li:nth-child(1)').before($contactElem);
                    }
                }
            };
            _this.clearContactMessageData = function (userId) {
                var htmlId = mckContactUtils.formatContactId(userId);
                $applozic("#li-" + htmlId + " .mck-cont-msg-date").html("");
                $applozic("#li-" + htmlId + " .mck-cont-msg-wrapper").html("");
            };
            _this.addContact = function (contact, $listId, message) {
                var emoji_template = _this.getMessageTextForContactPreview(message, contact, 100);
                var conversationId = "";
                var isGroupTab = false;
                if (typeof message !== "undefined") {
                    if (message.conversationId) {
                        conversationId = message.conversationId;
                        var conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                    }
                    if (message.groupId) {
                        isGroupTab = true;
                    }
                }
                var displayName = _this.getTabDisplayName(contact.contactId, isGroupTab);
                var imgsrctag = _this.getContactImageLink(contact, displayName);
                var prepend = false;
                var unreadCount = _this.getUnreadCount(contact.contactId);
                var unreadCountStatus = (unreadCount > 0 && $listId !== "mck-search-list") ? "vis" : "n-vis";
                var olStatus = "n-vis";
                if (!MCK_BLOCKED_TO_MAP[contact.contactId] && !MCK_BLOCKED_BY_MAP[contact.contactId] && IS_MCK_OL_STATUS && w.MCK_OL_MAP[contact.contactId]) {
                    olStatus = "vis";
                    prepend = true;
                }
                var isContHeader = "n-vis";
                if (typeof conversationPxy === 'object' && IS_MCK_TOPIC_HEADER) {
                    var topicDetail = MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId];
                    if (typeof topicDetail === "object") {
                        isContHeader = "vis";
                        var title = topicDetail.title;
                    }
                }
                var contactList = [
                    {
                        contHtmlExpr: contact.htmlId,
                        contIdExpr: contact.contactId,
                        contTabExpr: isGroupTab,
                        msgCreatedAtTimeExpr: message ? message.createdAtTime : "",
                        mckLauncherExpr: MCK_LAUNCHER,
                        contImgExpr: imgsrctag,
                        contOlExpr: olStatus,
                        contUnreadExpr: unreadCountStatus,
                        contUnreadCount: unreadCount,
                        contNameExpr: displayName,
                        conversationExpr: conversationId,
                        contHeaderExpr: isContHeader,
                        titleExpr: title,
                        msgCreatedDateExpr: message ? mckDateUtils.getTimeOrDate(message.createdAtTime, true) : ""
                    }
                ];
                var latestCreatedAtTime = $applozic('#' + $listId + ' li:nth-child(1)').data('msg-time');
                if (typeof latestCreatedAtTime === "undefined" || (message ? message.createdAtTime : "") > latestCreatedAtTime || ($listId.indexOf("search") !== -1 && prepend)) {
                    $applozic.tmpl("contactTemplate", contactList).prependTo('#' + $listId);
                } else {
                    $applozic.tmpl("contactTemplate", contactList).appendTo('#' + $listId);
                }
                var $textMessage = $applozic("#li-" + contact.htmlId + " .msgTextExpr");
                (typeof emoji_template === 'object') ? $textMessage.append(emoji_template) : $textMessage.html(emoji_template);
            };
            _this.addConversationMenu = function (tabId, isGroup) {
                var currTabId = $mck_msg_inner.data('mck-id');
                $mck_conversation_list.html("");
                if (tabId !== currTabId) {
                    return;
                }
                var tabConvArray = MCK_TAB_CONVERSATION_MAP[tabId];
                if (typeof tabConvArray === 'undefined' || tabConvArray.length === 0 || tabConvArray.length === 1) {
                    $product_box_caret.addClass('n-vis');
                    $mck_product_box.addClass('mck-product-box-wc');
                    $mck_conversation_list.addClass('n-vis');
                    return;
                }
                $mck_conversation_list.removeClass('n-vis');
                $product_box_caret.removeClass('n-vis');
                $mck_product_box.removeClass('mck-product-box-wc');
                $applozic.each(tabConvArray, function (i, convPxy) {
                    if ($applozic("#mck-conversation-list #li-" + convPxy.id).length === 0) {
                        var title = "";
                        if (convPxy.topicDetail) {
                            var topicDetail = $applozic.parseJSON(convPxy.topicDetail);
                            title = (typeof topicDetail === 'object') ? topicDetail.title : convPxy.topicDetail;
                        }
                        if (!title) {
                            title = convPxy.topicId;
                        }
                        var convList = [
                            {
                                convIdExpr: convPxy.id,
                                tabIdExpr: tabId,
                                isGroupExpr: isGroup,
                                topicIdExpr: convPxy.topicId,
                                convTitleExpr: title,
                                mckLauncherExpr: MCK_LAUNCHER
                            }
                        ];
                        $applozic.tmpl("convTemplate", convList).appendTo($mck_conversation_list);
                    }
                });
                if ($applozic("#mck-conversation-list li").length < 2) {
                    $product_box_caret.addClass('n-vis');
                    $mck_product_box.addClass('mck-product-box-wc');
                    $mck_conversation_list.addClass('n-vis');
                }
            };
            _this.loadContacts = function (data) {
                if (data + '' === "null" || typeof data === "undefined" || typeof data.contacts === "undefined" || data.contacts.length === 0) {
                    return;
                }
                if (typeof data.contacts.length === "undefined") {
                    if ((typeof data.contacts.userId !== "undefined")) {
                        data = data.contacts;
                        var contact = _this.getContact('' + data.userId);
                        contact = (typeof contact === 'undefined') ? _this.createContactWithDetail(data) : _this.updateContactDetail(contact, data);
                        MCK_CONTACT_ARRAY.push(contact);
                    }
                } else {
                    MCK_CONTACT_ARRAY.length = 0;
                    $applozic.each(data.contacts, function (i, data) {
                        if ((typeof data.userId !== "undefined")) {
                            var contact = _this.getContact('' + data.userId);
                            contact = (typeof contact === 'undefined') ? _this.createContactWithDetail(data) : _this.updateContactDetail(contact, data);
                            MCK_CONTACT_ARRAY.push(contact);
                        }
                    });
                }
            };
            _this.getStatusIcon = function (msg) {
                return '<span class="' + _this.getStatusIconName(msg) + ' move-right ' + msg.key + '_status status-icon"></span>';
            };
            _this.getStatusIconName = function (msg) {
                if (msg.type === 7 || msg.type === 6 || msg.type === 4 || msg.type === 0) {
                    return "";
                }
                if (msg.status === 5) {
                    return 'mck-icon-read';
                }
                if (msg.status === 4) {
                    return 'mck-icon-delivered';
                }
                if (msg.type === 3 || msg.type === 5 || (msg.type === 1 && (msg.source === 0 || msg.source === 1))) {
                    return 'mck-icon-sent';
                }
                return "";
            };
            _this.clearMessageField = function () {
                $mck_text_box.html("");
                $mck_msg_sbmt.attr('disabled', false);
                $mck_file_box.removeClass('vis').removeClass('mck-text-req').addClass('n-vis').attr("required", "").html("");
            };
            _this.addDraftMessage = function (tabId) {
                FILE_META = [];
                if (tabId && typeof TAB_MESSAGE_DRAFT[tabId] === 'object') {
                    var draftMessage = TAB_MESSAGE_DRAFT[tabId];
                    $mck_text_box.html(draftMessage.text);
                    if (draftMessage.files.length > 0) {
                        $applozic.each(draftMessage.files, function (i, file) {
                            mckFileService.addFileBox(file);
                        });
                        $file_name.html(draftMessage.filelb);
                        $file_size.html(draftMessage.filesize);
                        $mck_file_box.removeClass('n-vis').removeClass('mck-text-req').addClass('vis').removeAttr('required');
                    }
                } else {
                    FILE_META = [];
                }
            };
            _this.removeConversationThread = function (userId) {
                mckStorage.clearMckMessageArray();
                var contact = _this.getContact(userId);
                var currentTabId = $mck_msg_inner.data('mck-id');
                if (typeof currentTabId === 'undefined' || currentTabId === '') {
                    if (typeof contact !== 'undefined') {
                        $applozic("#li-" + contact.htmlId).remove();
                    } else {
                        userId = mckContactUtils.formatContactId(userId);
                        $applozic("#li-" + userId).remove();
                    }
                } else if (currentTabId === userId) {
                    $mck_msg_inner.html("");
                    $mck_msg_cell.removeClass('n-vis').addClass('vis');
                    $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                }
            };
            _this.removedDeletedMessage = function (key, userId) {
                mckStorage.clearMckMessageArray();
                var $divMessage = $applozic("." + key);
                if ($divMessage.length > 0) {
                    $divMessage.remove();
                    if ($mck_msg_inner.is(":empty")) {
                        $mck_msg_cell.removeClass('n-vis').addClass('vis');
                        $mck_tab_message_option.removeClass('vis').addClass('n-vis');
                    }
                } else if (typeof userId !== "undefined") {
                    var mckContactListLength = $applozic("#mck-contact-list").length;
                    if (mckContactListLength > 0) {
                        mckMessageService.updateContactList(userId);
                    }
                }
            };
            _this.getMessageTextForContactPreview = function (message, contact, size) {
                var emoji_template = "";
                if (typeof message !== 'undefined') {
                    if (message.message) {
                        if (message.contentType === 2) {
                            emoji_template = '<span class="mck-icon-marker"></span>';
                            return emoji_template;
                        }
                        var msg = message.message;
                        if (msg.startsWith("<img")) {
                            return '<span class="mck-icon-camera"></span>&nbsp;<span>image</span>';
                        } else {
                            emoji_template = w.emoji.replace_unified(msg);
                            emoji_template = w.emoji.replace_colons(emoji_template);
                            emoji_template = (emoji_template.indexOf('</span>') !== -1) ? emoji_template.substring(0, emoji_template.lastIndexOf('</span>')) : emoji_template.substring(0, size);
                        }
                        if (!contact.isGroup) {
                            if (emoji_template.indexOf('emoji-inner') === -1 && message.contentType === 0) {
                                var x = d.createElement('p');
                                x.appendChild(d.createTextNode(emoji_template));
                                emoji_template = x;
                            }
                        }
                    } else if (message.fileMetaKey && typeof message.fileMeta === "object") {
                        emoji_template = (message.fileMeta.contentType.indexOf("image") !== -1) ? '<span class="mck-icon-camera"></span>&nbsp;<span>image</span>' : '<span class="mck-icon-attachment"></span>&nbsp;<span>file</span>';
                    }
                    if (contact.isGroup && contact.type !== 3) {
                        var msgFrom = (message.to.split(",")[0] === MCK_USER_ID) ? "Me" : mckMessageLayout.getTabDisplayName(message.to.split(",")[0], false);
                        if (message.contentType !== 10) {
                            emoji_template = msgFrom + ": " + emoji_template;
                        }
                        if (emoji_template.indexOf('emoji-inner') === -1 && message && message.message && message.contentType === 0) {
                            var x = d.createElement('p');
                            x.appendChild(d.createTextNode(emoji_template));
                            emoji_template = x;
                        }
                    }

                }
                return emoji_template;
            };
            _this.getTextForMessagePreview = function (message, contact) {
                var emoji_template = "";
                if (typeof message !== 'undefined') {
                    if (message.message) {
                        var msg = message.message;
                        if (msg.startsWith("<img")) {
                            emoji_template = 'image attachment';
                        } else {
                            var x = d.createElement('div');
                            x.innerHTML = msg;
                            msg = $applozic.trim(mckUtils.textVal(x));
                            emoji_template = msg.substring(0, 50);
                        }
                    } else if (message.fileMetaKey && typeof message.fileMeta === "object") {
                        emoji_template = (message.fileMeta.contentType.indexOf("image") !== -1) ? 'image attachment' : 'file attachment';
                    }
                    if (contact.isGroup && contact.type !== 3) {
                        var msgFrom = (message.to.split(",")[0] === MCK_USER_ID) ? "Me" : mckMessageLayout.getTabDisplayName(message.to.split(",")[0], false);
                        emoji_template = msgFrom + ": " + emoji_template;
                    }
                }
                return emoji_template;
            };
            _this.getUserIdFromMessage = function (message) {
                var tos = message.to;
                if (tos.lastIndexOf(",") === tos.length - 1) {
                    tos = tos.substring(0, tos.length - 1);
                }
                return tos.split(",");
            };
            _this.getUserIdArrayFromMessageList = function (messages) {
                var userIdArray = new Array();
                if (typeof messages.length === "undefined") {
                    userIdArray.concat(_this.getUserIdFromMessage(messages));
                } else {
                    $applozic.each(messages, function (i, message) {
                        if (!(typeof message.to === "undefined")) {
                            userIdArray = userIdArray.concat(_this.getUserIdFromMessage(message));
                        }
                    });
                }
                return userIdArray;
            };
            _this.messageContextMenu = function (messageKey) {
                var $messageBox = $applozic("." + messageKey + " .mck-msg-box");
                if ($messageBox.addEventListener) {
                    $messageBox.addEventListener('contextmenu', function (e) {
                        e.preventDefault();
                    }, false);
                } else {
                    $messageBox.bind('contextmenu', function (e) {
                        e.preventDefault();
                        $applozic(".mck-context-menu").removeClass("vis").addClass("n-vis");
                        $applozic("." + messageKey + " .mck-context-menu").removeClass("n-vis").addClass("vis");
                        w.event.returnValue = false;
                    });
                }
            };
            _this.updateDraftMessage = function (tabId, fileMeta) {
                if (typeof fileMeta === 'object') {
                    var tab_draft = {
                        'text': "",
                        files: []
                    };
                    var file = {
                        fileMeta: fileMeta,
                        filelb: mckFileService.getFilePreviewPath(fileMeta),
                        filesize: mckFileService.getFilePreviewSize(fileMeta.size)
                    };
                    if ((typeof tabId !== 'undefined') && (typeof TAB_MESSAGE_DRAFT[tabId] === 'object')) {
                        tab_draft = TAB_MESSAGE_DRAFT[tabId];
                        $applozic.each(tab_draft.files, function (i, oldFile) {
                            if (oldFile.filelb === file.filelb) {
                                tab_draft.files.splice(i, 1);
                            }
                        });
                    }
                    tab_draft.files.push(file);
                }
                TAB_MESSAGE_DRAFT[tabId] = tab_draft;
            };
            _this.updateUnreadCount = function (tabId) {
                MCK_UNREAD_COUNT_MAP[tabId] = (typeof (MCK_UNREAD_COUNT_MAP[tabId]) === 'undefined') ? 1 : MCK_UNREAD_COUNT_MAP[tabId] + 1;
            };
            _this.getUnreadCount = function (userId) {
                if (typeof (MCK_UNREAD_COUNT_MAP[userId]) === 'undefined') {
                    MCK_UNREAD_COUNT_MAP[userId] = 0;
                    return 0;
                } else {
                    return MCK_UNREAD_COUNT_MAP[userId];
                }
            };
            _this.getTabDisplayName = function (tabId, isGroup, userName) {
                var displayName = "";
                if (isGroup) {
                    return mckGroupLayout.getGroupDisplayName(tabId);
                } else {
                    if (typeof (MCK_GETUSERNAME) === "function") {
                        displayName = MCK_GETUSERNAME(tabId);
                    }
                    if (typeof userName !== 'undefined' && userName) {
                        displayName = userName;
                        MCK_CONTACT_NAME_MAP[tabId] = userName;
                    }
                    if (!displayName) {
                        displayName = _this.getContactDisplayName(tabId);
                    }
                    if (!displayName) {
                        var contact = _this.fetchContact('' + tabId);
                        if (typeof contact.displayName !== "undefined") {
                            displayName = contact.displayName;
                        }
                    }
                    if (!displayName) {
                        displayName = tabId;
                    }
                    return displayName;
                }
            };
            _this.populateMessage = function (messageType, message, notifyUser) {
                var tabId = $mck_msg_inner.data('mck-id');
                var contact = (message.groupId) ? mckGroupLayout.getGroup(message.groupId) : mckMessageLayout.getContact(message.to);
                if ((typeof tabId === "undefined") || tabId === "") {
                    var mckContactListLength = $applozic("#mck-contact-list").length;
                    if (mckContactListLength > 0) {
                        (message.groupId) ? mckMessageLayout.addGroupFromMessage(message, true) : mckMessageLayout.addContactsFromMessage(message, true);
                    }
                    if (messageType === "APPLOZIC_01" || messageType === "MESSAGE_RECEIVED") {
                        if (typeof contact === 'undefined') {
                            contact = (message.groupId) ? mckGroupLayout.createGroup(message.groupId) : mckMessageLayout.createContact(message.to);
                        }
                        if (message.contentType !== 10) {
                            mckMessageLayout.updateUnreadCount(contact.contactId);
                        }
                        mckNotificationService.notifyUser(message);
                        $applozic("#li-" + contact.htmlId + " .mck-unread-count-text").html(mckMessageLayout.getUnreadCount(contact.contactId));
                        if (mckMessageLayout.getUnreadCount(contact.contactId) > 0) {
                            $applozic("#li-" + contact.htmlId + " .mck-unread-count-box").removeClass("n-vis").addClass("vis");
                        }
                        mckMessageService.sendDeliveryUpdate(message);
                    }
                } else {
                    if (typeof contact === 'undefined') {
                        contact = (message.groupId) ? mckGroupLayout.createGroup(message.groupId) : mckMessageLayout.createContact(message.to);
                    }
                    if (messageType === "APPLOZIC_01" || messageType === "MESSAGE_RECEIVED") {
                        if (typeof contact !== 'undefined') {
                            if (typeof tabId !== 'undefined' && tabId === contact.contactId) {
                                if (message.conversationId) {
                                    var currConvId = $mck_msg_inner.data('mck-conversationid');
                                    if (currConvId && currConvId.toString() === message.conversationId.toString()) {
                                        mckMessageLayout.addMessage(message, true, true, true);
                                        mckMessageService.sendReadUpdate(message.pairedMessageKey);
                                    }
                                } else {
                                    mckMessageLayout.addMessage(message, true, true, true);
                                    mckMessageService.sendReadUpdate(message.pairedMessageKey);
                                }
                                if (!message.groupId) {
                                    $applozic("#mck-tab-status").html("Online");
                                    mckUserUtils.updateUserStatus({'userId': message.to, 'status': 1});
                                }
                                //Todo: use contactNumber instead of contactId for Google Contacts API.
                            } else {
                                mckMessageLayout.updateUnreadCount(contact.contactId);
                                mckMessageService.sendDeliveryUpdate(message);
                            }
                            if (notifyUser) {
                                mckNotificationService.notifyUser(message);
                            }
                        }
                    } else if (messageType === "APPLOZIC_02") {
                        if ((message.type !== 5 || message.source !== 1)) {
                            if (mckContactListLength > 0) {
                                mckMessageLayout.addContactsFromMessage(message, true);
                            } else {
                                if (typeof contact !== 'undefined') {
                                    if (typeof tabId !== 'undefined' && tabId === contact.contactId) {
                                        mckMessageLayout.addMessage(message, true, true, true);
                                        if (message.type === 3) {
                                            $applozic("." + message.key + " .mck-message-status").removeClass('mck-icon-time').addClass('mck-icon-sent');
                                            mckMessageLayout.addTooltip(message.key);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                $mck_loading.removeClass('vis').addClass('n-vis');
            };
            _this.getMessageFeed = function (message) {
                var messageFeed = {};
                messageFeed.key = message.key;
                messageFeed.timeStamp = message.createdAtTime;
                messageFeed.message = message.message;
                messageFeed.from = (message.type === 4) ? message.to : MCK_USER_ID;
                messageFeed.to = (message.type === 5) ? message.to : MCK_USER_ID;
                messageFeed.status = "read";
                messageFeed.type = (message.type === 4) ? 'inbox' : 'outbox';
                if (message.type === 5) {
                    if (message.status === 3) {
                        messageFeed.status = "sent";
                    } else if (message.status === 4) {
                        messageFeed.status = "delivered";
                    }
                }
                if (typeof message.fileMeta === 'object') {
                    message.fileMeta.url = MCK_FILE_URL + '/rest/ws/aws/file/' + message.fileMeta.blobKey;
                    delete message.fileMeta.blobKey;
                    messageFeed.file = message.fileMeta;
                }
                return messageFeed;
            };
        }

        function MckUserUtils() {
            var _this = this;
            var $mck_msg_form = $applozic("#mck-msg-form");
            var $mck_msg_error = $applozic("#mck-msg-error");
            var $mck_tab_title = $applozic("#mck-tab-title");
            var $mck_tab_status = $applozic("#mck-tab-status");
            var $mck_typing_box = $applozic(".mck-typing-box");
            var $mck_block_button = $applozic("#mck-block-button");
            var $mck_message_inner = $applozic("#mck-message-cell .mck-message-inner");
            _this.updateUserStatus = function (params) {
                if (typeof MCK_USER_DETAIL_MAP[params.userId] === 'object') {
                    var userDetail = MCK_USER_DETAIL_MAP[params.userId];
                    if (params.status === 0) {
                        userDetail.connected = false;
                        userDetail.lastSeenAtTime = params.lastSeenAtTime;
                    } else if (params.status === 1) {
                        userDetail.connected = true;
                    }
                } else {
                    var userIdArray = new Array();
                    userIdArray.push(params.userId);
                    mckContactService.getUsersDetail(userIdArray);
                }
            };
            _this.getUserDetail = function (userId) {
                if (typeof MCK_USER_DETAIL_MAP[userId] === 'object') {
                    return MCK_USER_DETAIL_MAP[userId];
                } else {
                    return;
                }
            };
            _this.checkUserConnectedStatus = function () {
                var userIdArray = new Array();
                var otherUserIdArray = new Array();
                $applozic(".mck-user-ol-status").each(function () {
                    var tabId = $applozic(this).data('mck-id');
                    if (typeof tabId !== "undefined" && tabId !== "") {
                        userIdArray.push(tabId);
                        var htmlId = mckContactUtils.formatContactId('' + tabId);
                        $applozic(this).addClass(htmlId);
                        $applozic(this).next().addClass(htmlId);
                    }
                });
                if (userIdArray.length > 0) {
                    $applozic.each(userIdArray, function (i, userId) {
                        if (typeof MCK_USER_DETAIL_MAP[userId] === 'undefined') {
                            otherUserIdArray.push(userId);
                        }
                    });
                    (otherUserIdArray.length > 0) ? mckContactService.getUsersDetail(otherUserIdArray, {setStatus: true}) : _this.updateUserConnectedStatus();
                }
            };
            _this.updateUserConnectedStatus = function () {
                $applozic(".mck-user-ol-status").each(function () {
                    var $this = $applozic(this);
                    var tabId = $this.data('mck-id');
                    if (tabId) {
                        var userDetail = MCK_USER_DETAIL_MAP[tabId];
                        if (typeof MCK_USER_DETAIL_MAP[tabId] !== 'undefined' && userDetail.connected) {
                            $this.removeClass('n-vis').addClass('vis');
                            $this.next().html('(Online)');
                        } else {
                            $this.removeClass('vis').addClass('n-vis');
                            $this.next().html('(Offline)');
                        }
                    }
                });
            };
            _this.toggleBlockUser = function (tabId, isBlocked) {
                if (isBlocked) {
                    $mck_msg_error.html('You have blocked this user.');
                    $mck_msg_error.removeClass('n-vis').addClass('vis').addClass('mck-no-mb');
                    $mck_msg_form.removeClass('vis').addClass('n-vis');
                    $mck_tab_title.removeClass('mck-tab-title-w-status');
                    $mck_tab_status.removeClass('vis').addClass('n-vis');
                    $mck_typing_box.removeClass('vis').addClass('n-vis');
                    $mck_message_inner.data('blocked', true);
                    $mck_block_button.html('Unblock User');
                } else {
                    $mck_msg_error.html('');
                    $mck_msg_error.removeClass('vis').addClass('n-vis').removeClass('mck-no-mb');
                    $mck_msg_form.removeClass('n-vis').addClass('vis');
                    $mck_message_inner.data('blocked', false);
                    $mck_block_button.html('Block User');
                    if (!MCK_BLOCKED_BY_MAP[tabId] && (w.MCK_OL_MAP[tabId] || MCK_LAST_SEEN_AT_MAP[tabId])) {
                        if (w.MCK_OL_MAP[tabId]) {
                            $mck_tab_status.html("Online");
                            $mck_tab_status.attr('title', "Online");
                        } else if (MCK_LAST_SEEN_AT_MAP[tabId]) {
                            var lastSeenAt = mckDateUtils.getLastSeenAtStatus(MCK_LAST_SEEN_AT_MAP[tabId]);
                            $mck_tab_status.html(lastSeenAt);
                            $mck_tab_status.attr('title', lastSeenAt);
                        }
                        $mck_tab_title.addClass("mck-tab-title-w-status");
                        $mck_tab_status.removeClass('n-vis').addClass('vis');
                    }
                }
            };
        }

        function MckContactService() {
            var _this = this;
            var $mck_search_List = $applozic("#mck-search-list");
            var $mck_sidebox_search = $applozic("#mck-sidebox-search");
            var $mck_search_loading = $applozic("#mck-search-loading");
            var $mck_search_inner = $applozic("#mck-search-cell .mck-message-inner");
            var USER_BLOCK_URL = "/rest/ws/user/block";
            var CONTACT_NAME_URL = "/rest/ws/user/info";
            var USER_DETAIL_URL = "/rest/ws/user/detail";
            var CONTACT_LIST_URL = "/rest/ws/user/ol/list";
            var USER_STATUS_URL = "/rest/ws/user/chat/status";
            _this.getContactDisplayName = function (userIdArray) {
                var mckContactNameArray = [];
                if (userIdArray.length > 0 && userIdArray[0]) {
                    var data = "";
                    var uniqueUserIdArray = userIdArray.filter(function (item, pos) {
                        return userIdArray.indexOf(item) === pos;
                    });
                    for (var i = 0; i < uniqueUserIdArray.length; i++) {
                        var userId = uniqueUserIdArray[i];
                        if (typeof MCK_CONTACT_NAME_MAP[userId] === 'undefined') {
                            data += "userIds=" + encodeURIComponent(userId) + "&";
                        }
                    }
                    if (data.lastIndexOf("&") === data.length - 1) {
                        data = data.substring(0, data.length - 1);
                    }
                    if (data) {
                        $applozic.ajax({
                            url: MCK_BASE_URL + CONTACT_NAME_URL,
                            data: data,
                            global: false,
                            type: 'get',
                            success: function (data) {
                                for (var userId in data) {
                                    if (data.hasOwnProperty(userId)) {
                                        mckContactNameArray.push([userId, data[userId]]);
                                        MCK_CONTACT_NAME_MAP[userId] = data[userId];
                                        var contact = mckMessageLayout.fetchContact(userId);
                                        contact.displayName = data[userId];
                                    }
                                }
                                mckStorage.updateMckContactNameArray(mckContactNameArray);
                            },
                            error: function () {
                            }
                        });
                    }
                }
            };
            _this.loadContacts = function () {
                $mck_search_loading.removeClass('n-vis').addClass('vis');
                $mck_search_List.html('');
                var userIdArray = [];
                $applozic.ajax({
                    url: MCK_BASE_URL + CONTACT_LIST_URL + "?startIndex=0&pageSize=20",
                    type: 'get',
                    global: false,
                    success: function (data) {
                        $mck_search_loading.removeClass('vis').addClass('n-vis');
                        if ($mck_sidebox_search.hasClass('vis')) {
                            for (var userId in data) {
                                if (data.hasOwnProperty(userId)) {
                                    w.MCK_OL_MAP[userId] = data[userId] === 'true';
                                    userIdArray.push(userId);
                                }
                            }
                            _this.getContactDisplayName(userIdArray);
                            if (userIdArray !== null && userIdArray.length > 0) {
                                mckMessageLayout.addContactsToSearchList(userIdArray, false);
                            } else {
                                $mck_search_inner.html('<div class="mck-no-data-text mck-text-muted">No contacts yet!</div>');
                                mckMessageLayout.initSearchAutoType();
                            }
                        }
                    },
                    error: function () {
                        $mck_search_loading.removeClass('vis').addClass('n-vis');
                        w.console.log('Unable to load contacts. Please reload page.');
                    }
                });
            };
            _this.getUsersDetail = function (userIdArray, params) {
                if (typeof userIdArray === 'undefined' || userIdArray.length < 1) {
                    return;
                }
                var data = "";
                var uniqueUserIdArray = userIdArray.filter(function (item, pos) {
                    return userIdArray.indexOf(item) === pos;
                });
                for (var i = 0; i < uniqueUserIdArray.length; i++) {
                    var userId = uniqueUserIdArray[i];
                    if (typeof MCK_USER_DETAIL_MAP[userId] === 'undefined') {
                        data += "userIds=" + encodeURIComponent(userId) + "&";
                    }
                }
                $applozic.ajax({
                    url: MCK_BASE_URL + USER_DETAIL_URL + "?" + data,
                    type: 'get',
                    success: function (data) {
                        if (data + '' === 'null') {
                            if (params.message) {
                                mckMessageLayout.populateMessage(params.messageType, params.message, params.notifyUser);
                            }
                        } else {
                            if (data.length > 0) {
                                $applozic.each(data, function (i, userDetail) {
                                    MCK_USER_DETAIL_MAP[userDetail.userId] = userDetail;
                                    w.MCK_OL_MAP[userDetail.userId] = (userDetail.connected);
                                    var contact = mckMessageLayout.getContact('' + userDetail.userId);
                                    contact = (typeof contact === 'undefined') ? mckMessageLayout.createContactWithDetail(userDetail) : mckMessageLayout.updateContactDetail(contact, userDetail);
                                    MCK_CONTACT_ARRAY.push(contact);
                                });
                                if (params) {
                                    if (params.setStatus) {
                                        mckUserUtils.updateUserConnectedStatus();
                                    } else if (params.message) {
                                        mckMessageLayout.populateMessage(params.messageType, params.message, params.notifyUser);
                                    }
                                }
                            }
                        }
                    },
                    error: function () {
                    }
                });
            };
            _this.getUserStatus = function (params) {
                var response = new Object();
                $applozic.ajax({
                    url: MCK_BASE_URL + USER_STATUS_URL,
                    type: 'get',
                    success: function (data) {
                        response.status = "success";
                        response.data = data;
                        if (params.callback) {
                            params.callback(response);
                        }
                        return;
                    },
                    error: function () {
                        response.status = "error";
                        if (params.callback) {
                            params.callback(response);
                        }
                    }
                });
            };
            _this.blockUser = function (userId, isBlock) {
                if (!userId || typeof isBlock === 'undefined') {
                    return;
                }
                var data = "userId=" + userId + "&block=" + isBlock;
                $applozic.ajax({
                    url: MCK_BASE_URL + USER_BLOCK_URL,
                    type: 'get',
                    data: data,
                    success: function (data) {
                        if (typeof data === 'object') {
                            if (data.status === 'success') {
                                MCK_BLOCKED_TO_MAP[userId] = isBlock;
                                mckUserUtils.toggleBlockUser(userId, isBlock);
                            }
                        }
                    },
                    error: function () {

                    }
                });
            };
        }

        function MckGroupService() {
            var _this = this;
            var $mck_loading = $applozic("#mck-contact-loading");
            var GROUP_LIST_URL = "/rest/ws/group/list";
            var GROUP_FEED_URL = "/rest/ws/group/info";
            _this.loadGroups = function () {
                $applozic.ajax({
                    url: MCK_BASE_URL + GROUP_LIST_URL,
                    type: 'get',
                    global: false,
                    success: function (data) {
                        if (data.status === "success") {
                            var groups = data.response;
                            if (groups + '' === "null" || typeof groups === "undefined" || typeof groups.length === 0) {
                                return;
                            }
                            mckGroupLayout.loadGroups(groups);
                            $mck_loading.removeClass('vis').addClass('n-vis');
                        }
                    },
                    error: function () {
                        $mck_loading.removeClass('vis').addClass('n-vis');
                        w.console.log('Unable to load groups. Please reload page.');
                    }
                });
            };
            _this.getGroupFeedFromMessage = function (message, messageType, notifyUser) {
                var data = "groupId=" + message.groupId;
                if (message.conversationId) {
                    var conversationPxy = MCK_CONVERSATION_MAP[message.conversationId];
                    if ((typeof conversationPxy !== 'object') || (typeof MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId] !== 'object')) {
                        data += "&conversationId=" + message.conversationId;
                    }
                }
                $applozic.ajax({
                    url: MCK_BASE_URL + GROUP_FEED_URL,
                    data: data,
                    type: 'get',
                    global: false,
                    success: function (data) {
                        if (data.status === "success") {
                            var groupFeed = data.response;
                            if (groupFeed + '' === "null" || typeof groupFeed !== "object") {
                                return;
                            }
                            var conversationPxy = groupFeed.conversationPxy;
                            mckGroupLayout.addGroup(groupFeed);
                            var tabConvArray = new Array();
                            if (typeof conversationPxy === "object") {
                                MCK_CONVERSATION_MAP[conversationPxy.id] = conversationPxy;
                                MCK_TOPIC_CONVERSATION_MAP[conversationPxy.topicId] = [conversationPxy.id];
                                if (conversationPxy.topicDetail) {
                                    MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId] = $applozic.parseJSON(conversationPxy.topicDetail);
                                }
                                tabConvArray.push(conversationPxy);
                            }
                            if (tabConvArray.length > 0) {
                                MCK_TAB_CONVERSATION_MAP[message.groupId] = tabConvArray;
                            }
                            mckMessageLayout.populateMessage(messageType, message, notifyUser);
                        }
                    },
                    error: function () {
                        $mck_loading.removeClass('vis').addClass('n-vis');
                        w.console.log('Unable to load groups. Please reload page.');
                    }
                });
            };
        }

        function MckGroupLayout() {
            var _this = this;
            var $mck_tab_title = $applozic("#mck-tab-title");
            var $mck_tab_status = $applozic("#mck-tab-status");
            _this.loadGroups = function (groups) {
                if (typeof groups.length === "undefined") {
                    if ((typeof groups.id !== "undefined")) {
                        mckGroupLayout.addGroup(groups);
                    }
                } else {
                    $applozic.each(groups, function (i, group) {
                        if ((typeof group.id !== "undefined")) {
                            mckGroupLayout.addGroup(group);
                        }
                    });
                }
            };
            _this.getGroup = function (groupId) {
                if (typeof MCK_GROUP_MAP[groupId] === 'object') {
                    return  MCK_GROUP_MAP[groupId];
                } else {
                    return;
                }
            };
            _this.getGroupDisplayName = function (groupId) {
                if (typeof MCK_GROUP_MAP[groupId] === 'object') {
                    var group = MCK_GROUP_MAP[groupId];
                    var displayName = group["displayName"];
                    if (group.type === 3) {
                        if (displayName.indexOf(MCK_USER_ID) !== -1) {
                            displayName = displayName.replace(MCK_USER_ID, "").replace(":", "");
                            if (typeof (MCK_GETUSERNAME) === "function") {
                                var name = (MCK_GETUSERNAME(displayName));
                                displayName = (name) ? name : displayName;
                            }
                        }
                    }
                    if (!displayName && group.type === 5) {
                        displayName = 'Broadcast';
                    }
                    if (!displayName) {
                        displayName = group.contactId;
                    }
                    return displayName;
                } else {
                    return groupId;
                }
            };
            _this.addGroup = function (group) {
                var name = (group.name) ? group.name : group.id;
                var groupFeed = {
                    'contactId': group.id.toString(),
                    'htmlId': mckContactUtils.formatContactId('' + group.id),
                    'displayName': name,
                    'name': name + " <" + group.id + ">" + " [" + "Main" + "]",
                    'value': group.id.toString(),
                    'adminName': group.adminName,
                    'type': group.type,
                    'members': group.membersName,
                    'isGroup': true
                };
                MCK_GROUP_MAP[group.id] = groupFeed;
                return groupFeed;
            };
            _this.createGroup = function (groupId) {
                var group = {
                    'contactId': groupId.toString(),
                    'htmlId': mckContactUtils.formatContactId('' + groupId),
                    'name': groupId + " <" + groupId + ">" + " [" + "Main" + "]",
                    'displayName': groupId.toString(),
                    'value': groupId.toString(),
                    'type': 2,
                    'adminName': "",
                    'isGroup': true
                };
                MCK_GROUP_MAP[groupId] = group;
                return group;
            };
            _this.addGroupStatus = function (group) {
                if (group.members.length > 1) {
                    var groupMembers = "";
                    for (var i = 0; i < group.members.length; i++) {
                        if (MCK_USER_ID === '' + group.members[i] && group.type === 5) {
                            continue;
                        }
                        var contact = mckMessageLayout.fetchContact('' + group.members[i]);
                        var name = mckMessageLayout.getTabDisplayName(contact.contactId, false);
                        groupMembers += name + ",";
                    }
                    groupMembers = groupMembers.replace(/,\s*$/, "");
                    $mck_tab_status.html(groupMembers);
                    $mck_tab_status.removeClass('n-vis').addClass('vis');
                    $mck_tab_title.addClass("mck-tab-title-w-status");
                } else {
                    $mck_tab_title.removeClass("mck-tab-title-w-status");
                    $mck_tab_status.removeClass('vis').addClass('n-vis');
                }
            };
        }

        function MckStorage() {
            var _this = this;
            var MCK_MESSAGE_ARRAY = [];
            var MCK_CONTACT_NAME_ARRAY = [];
            _this.getMckMessageArray = function () {
                return (typeof (w.sessionStorage) !== "undefined") ? $applozic.parseJSON(w.sessionStorage.getItem("mckMessageArray")) : MCK_MESSAGE_ARRAY;
            };
            _this.clearMckMessageArray = function () {
                if (typeof (w.sessionStorage) !== "undefined") {
                    w.sessionStorage.removeItem("mckMessageArray");
                } else {
                    MCK_MESSAGE_ARRAY.length = 0;
                }
            };
            _this.setMckMessageArray = function (messages) {
                if (typeof (w.sessionStorage) !== "undefined") {
                    w.sessionStorage.setItem('mckMessageArray', w.JSON.stringify(messages));
                } else {
                    MCK_MESSAGE_ARRAY = messages;
                }
            };
            _this.updateMckMessageArray = function (mckMessageArray) {
                if (typeof (w.sessionStorage) !== "undefined") {
                    var mckLocalMessageArray = $applozic.parseJSON(w.sessionStorage.getItem('mckMessageArray'));
                    if (mckLocalMessageArray !== null) {
                        mckLocalMessageArray = mckLocalMessageArray.concat(mckMessageArray);
                        w.sessionStorage.setItem('mckMessageArray', w.JSON.stringify(mckLocalMessageArray));
                    } else {
                        w.sessionStorage.setItem('mckMessageArray', w.JSON.stringify(mckMessageArray));
                    }
                    return  mckMessageArray;
                } else {
                    MCK_MESSAGE_ARRAY = MCK_MESSAGE_ARRAY.concat(mckMessageArray);
                    return MCK_MESSAGE_ARRAY;
                }
            };
            _this.getMckContactNameArray = function () {
                return (typeof (w.sessionStorage) !== "undefined") ? $applozic.parseJSON(w.sessionStorage.getItem("mckContactNameArray")) : MCK_CONTACT_NAME_ARRAY;
            };
            _this.setMckContactNameArray = function (mckContactNameArray) {
                if (typeof (w.sessionStorage) !== "undefined") {
                    w.sessionStorage.setItem('mckContactNameArray', w.JSON.stringify(mckContactNameArray));
                } else {
                    MCK_CONTACT_NAME_ARRAY = mckContactNameArray;
                }
            };
            _this.updateMckContactNameArray = function (mckContactNameArray) {
                if (typeof (w.sessionStorage) !== "undefined") {
                    var mckLocalcontactNameArray = $applozic.parseJSON(w.sessionStorage.getItem('mckContactNameArray'));
                    if (mckLocalcontactNameArray !== null) {
                        mckContactNameArray = mckContactNameArray.concat(mckLocalcontactNameArray);
                    }
                    w.sessionStorage.setItem('mckContactNameArray', w.JSON.stringify(mckContactNameArray));
                    return mckContactNameArray;
                } else {
                    MCK_CONTACT_NAME_ARRAY = MCK_CONTACT_NAME_ARRAY.concat(mckContactNameArray);
                    return  MCK_CONTACT_NAME_ARRAY;
                }
            };
        }

        function MckMapLayout() {
            var _this = this;
            var GEOCODER = "";
            var CURR_LOC_ADDRESS = "";
            var CURR_LATITIUDE = 40.7324319;
            var CURR_LONGITUDE = -73.82480777777776;
            var $mck_my_loc = $applozic("#mck-my-loc");
            var $mck_loc_box = $applozic("#mck-loc-box");
            var $mck_loc_lat = $applozic("#mck-loc-lat");
            var $mck_loc_lon = $applozic("#mck-loc-lon");
            var $mck_footer = $applozic("#mck-sidebox-ft");
            var $mck_file_menu = $applozic("#mck-file-menu");
            var $mck_btn_attach = $applozic("#mck-btn-attach");
            var $mckMapContent = $applozic("#mck-map-content");
            var $mck_loc_address = $applozic("#mck-loc-address");
            _this.init = function () {
                if (IS_MCK_LOCSHARE) {
                    GEOCODER = new w.google.maps.Geocoder;
                    _this.getCurrentLocation(_this.onGetCurrLocation, _this.onErrorCurrLocation);
                    $mck_btn_attach.on('click', function () {
                        _this.fileMenuToggle();
                    });
                }
                $mck_my_loc.on("click", function () {
                    _this.getCurrentLocation(_this.onGetMyCurrLocation, _this.onErrorMyCurrLocation);
                });
            };
            _this.fileMenuReposition = function () {
                var offset = $mck_footer.offset();
                offset.bottom = w.innerHeight - (offset.top);
                $mck_file_menu.css({
                    bottom: (offset.bottom > 51) ? offset.bottom : 51,
                    right: 0
                });
            };
            _this.fileMenuToggle = function () {
                if ($mck_btn_attach.hasClass('on')) {
                    $mck_btn_attach.removeClass('on');
                    $mck_file_menu.hide();
                } else {
                    _this.fileMenuReposition();
                    $mck_btn_attach.addClass('on');
                    $mck_file_menu.show();
                }
            };
            _this.onGetCurrLocation = function (loc) {
                CURR_LATITIUDE = loc.coords.latitude;
                CURR_LONGITUDE = loc.coords.longitude;
                _this.openMapBox();
            };
            _this.onErrorCurrLocation = function () {
                CURR_LATITIUDE = 46.15242437752303;
                CURR_LONGITUDE = 2.7470703125;
                _this.openMapBox();
            };
            _this.onErrorMyCurrLocation = function (err) {
                alert("Unable to retrieve your location. ERROR(" + err.code + "): " + err.message);
            };
            _this.onGetMyCurrLocation = function (loc) {
                CURR_LATITIUDE = loc.coords.latitude;
                CURR_LONGITUDE = loc.coords.longitude;
                $mck_loc_lat.val(CURR_LATITIUDE);
                $mck_loc_lon.val(CURR_LONGITUDE);
                $mck_loc_lat.trigger('change');
                $mck_loc_lon.trigger('change');
                if (CURR_LOC_ADDRESS) {
                    $mck_loc_address.val(CURR_LOC_ADDRESS);
                } else if (GEOCODER) {
                    var latlng = {lat: CURR_LATITIUDE, lng: CURR_LONGITUDE};
                    GEOCODER.geocode({'location': latlng}, function (results, status) {
                        if (status === "OK") {
                            if (results[1]) {
                                CURR_LOC_ADDRESS = results[1].formatted_address;

                            }
                        }
                    });
                }
            };
            _this.getCurrentLocation = function (succFunc, errFunc) {
                w.navigator.geolocation.getCurrentPosition(succFunc, errFunc);
            };
            _this.getSelectedLocation = function () {
                return {lat: CURR_LATITIUDE, lon: CURR_LONGITUDE};
            };
            _this.openMapBox = function () {
                $mckMapContent.locationpicker({
                    location: {latitude: CURR_LATITIUDE, longitude: CURR_LONGITUDE},
                    radius: 0,
                    scrollwheel: true,
                    inputBinding: {
                        latitudeInput: $mck_loc_lat,
                        longitudeInput: $mck_loc_lon,
                        locationNameInput: $mck_loc_address
                    },
                    enableAutocomplete: true,
                    enableReverseGeocode: true,
                    onchanged: function (currentLocation) {
                        CURR_LATITIUDE = currentLocation.latitude;
                        CURR_LONGITUDE = currentLocation.longitude;
                    }
                });
                $mck_loc_box.on('shown.bs.mck-box', function () {
                    $mckMapContent.locationpicker('autosize');
                });
            };
        }
        function MckMapService() {
            var _this = this;
            var $mck_msg_to = $applozic("#mck-msg-to");
            var $mck_btn_loc = $applozic("#mck-btn-loc");
            var $mck_loc_box = $applozic('#mck-loc-box');
            var $mck_msg_sbmt = $applozic("#mck-msg-sbmt");
            var $mck_msg_error = $applozic("#mck-msg-error");
            var $mck_loc_submit = $applozic("#mck-loc-submit");
            var $mck_msg_response = $applozic("#mck-msg-response");
            var $mck_response_text = $applozic("#mck_response_text");
            var $mck_msg_inner = $applozic("#mck-message-cell .mck-message-inner");
            $mck_btn_loc.on("click", function () {
                $mck_loc_box.mckModal();
            });
            $mck_loc_submit.on("click", function () {
                var messagePxy = {
                    "type": 5,
                    "contentType": 2,
                    "message": w.JSON.stringify(mckMapLayout.getSelectedLocation())
                };
                var conversationId = $mck_msg_inner.data('mck-conversationid');
                var topicId = $mck_msg_inner.data('mck-topicid');
                if (conversationId) {
                    messagePxy.conversationId = conversationId;
                } else if (topicId) {
                    var conversationPxy = {
                        'topicId': topicId
                    };
                    var topicDetail = MCK_TOPIC_DETAIL_MAP[topicId];
                    if (typeof topicDetail === "object") {
                        conversationPxy.topicDetail = w.JSON.stringify(topicDetail);
                    }
                    messagePxy.conversationPxy = conversationPxy;
                }
                if ($mck_msg_inner.data("isgroup") === true) {
                    messagePxy.groupId = $mck_msg_to.val();
                } else {
                    messagePxy.to = $mck_msg_to.val();
                }
                $mck_msg_sbmt.attr('disabled', true);
                $mck_msg_error.removeClass('vis').addClass('n-vis');
                $mck_msg_error.html("");
                $mck_response_text.html("");
                $mck_msg_response.removeClass('vis').addClass('n-vis');
                mckMessageService.sendMessage(messagePxy);
                $mck_loc_box.mckModal('hide');
            });
        }

        function MckFileService() {
            var _this = this;
            var ONE_KB = 1024;
            var ONE_MB = 1048576;
            var $file_box = $applozic("#mck-file-box");
            var $mck_msg_sbmt = $applozic("#mck-msg-sbmt");
            var $mck_text_box = $applozic("#mck-text-box");
            var $file_upload = $applozic(".mck-file-upload");
            var $mck_msg_inner = $applozic("#mck-message-cell .mck-message-inner");
            var FILE_PREVIEW_URL = "/rest/ws/aws/file";
            var FILE_UPLOAD_URL = "/rest/ws/aws/file/url";
            var FILE_DELETE_URL = "/rest/ws/aws/file/delete";
            var mck_filebox_tmpl = '<div id="mck-filebox-${fileIdExpr}" class="mck-file-box ${fileIdExpr}">' +
                    '<div class="mck-file-expr">' +
                    '<span class="mck-file-content blk-lg-8"><span class="mck-file-lb">{{html fileNameExpr}}</span>&nbsp;<span class="mck-file-sz">${fileSizeExpr}</span></span>' +
                    '<span class="progress progress-striped active blk-lg-3" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="progress-bar progress-bar-success bar" stye></span></span>' +
                    '<span class="move-right">' +
                    '<button type="button" class="mck-box-close mck-remove-file" data-dismiss="div" aria-hidden="true">x</button>' +
                    '</span></div></div>';
            $applozic.template("fileboxTemplate", mck_filebox_tmpl);
            _this.init = function () {
                $file_upload.on('change', function () {
                    var data = new Object();
                    var file = $applozic(this).children('input')[0].files[0];
                    var uploadErrors = [];
                    if (typeof file === 'undefined') {
                        return;
                    }
                    if ($applozic(".mck-file-box").length > 4) {
                        uploadErrors.push("Can't upload more than 5 files at a time");
                    }
                    if (file['size'] > (MCK_FILEMAXSIZE * ONE_MB)) {
                        uploadErrors.push("file size can not be more than " + MCK_FILEMAXSIZE + " MB");
                    }
                    if (uploadErrors.length > 0) {
                        alert(uploadErrors.toString());
                    } else {
                        var randomId = mckUtils.randomId();
                        var fileboxList = [
                            {
                                fileIdExpr: randomId,
                                fileName: file.name,
                                fileNameExpr: '<a href="#">' + file.name + '</a>',
                                fileSizeExpr: _this.getFilePreviewSize(file.size)
                            }
                        ];
                        $applozic.tmpl("fileboxTemplate", fileboxList).appendTo('#mck-file-box');
                        var $fileContainer = $applozic(".mck-file-box." + randomId);
                        var $file_name = $applozic(".mck-file-box." + randomId + " .mck-file-lb");
                        var $file_progressbar = $applozic(".mck-file-box." + randomId + " .progress .bar");
                        var $file_progress = $applozic(".mck-file-box." + randomId + " .progress");
                        var $file_remove = $applozic(".mck-file-box." + randomId + " .mck-remove-file");
                        $file_progressbar.css('width', '0%');
                        $file_progress.removeClass('n-vis').addClass('vis');
                        $file_remove.attr("disabled", true);
                        $file_upload.attr("disabled", true);
                        $file_box.removeClass('n-vis').addClass('vis');
                        if (file.name === $applozic(".mck-file-box." + randomId + " .mck-file-lb a").html()) {
                            var currTab = $mck_msg_inner.data('mck-id');
                            var uniqueId = file.name + file.size;
                            TAB_FILE_DRAFT[uniqueId] = currTab;
                            $mck_msg_sbmt.attr('disabled', true);
                            data.files = [];
                            data.files.push(file);
                            var xhr = new XMLHttpRequest();
                            (xhr.upload || xhr).addEventListener('progress', function (e) {
                                var progress = parseInt(e.loaded / e.total * 100, 10);
                                $file_progressbar.css(
                                        'width',
                                        progress + '%'
                                        );
                            });
                            xhr.addEventListener('load', function (e) {
                                var responseJson = $applozic.parseJSON(this.responseText);
                                if (typeof responseJson.fileMeta === "object") {
                                    var file_meta = responseJson.fileMeta;
                                    var fileExpr = _this.getFilePreviewPath(file_meta);
                                    var name = file_meta.name;
                                    var size = file_meta.size;
                                    var currTabId = $mck_msg_inner.data('mck-id');
                                    var uniqueId = name + size;
                                    var fileTabId = TAB_FILE_DRAFT[uniqueId];
                                    if (currTab !== currTabId) {
                                        mckMessageLayout.updateDraftMessage(fileTabId, file_meta);
                                        delete TAB_FILE_DRAFT[uniqueId];
                                        return;
                                    }
                                    $file_remove.attr("disabled", false);
                                    $file_upload.attr("disabled", false);
                                    $mck_msg_sbmt.attr('disabled', false);
                                    delete TAB_FILE_DRAFT[uniqueId];
                                    $file_name.html(fileExpr);
                                    $file_progress.removeClass('vis').addClass('n-vis');
                                    $applozic(".mck-file-box .progress").removeClass('vis').addClass('n-vis');
                                    $mck_text_box.removeAttr('required');
                                    FILE_META.push(file_meta);
                                    $fileContainer.data('mckfile', file_meta);
                                    $file_upload.children('input').val("");
                                    return false;
                                } else {
                                    $file_remove.attr("disabled", false);
                                    $mck_msg_sbmt.attr('disabled', false);
                                    //  FILE_META = "";
                                    $file_remove.trigger('click');
                                }
                            });
                            $applozic.ajax({
                                type: "GET",
                                url: MCK_FILE_URL + FILE_UPLOAD_URL,
                                global: false,
                                data: "data=" + new Date().getTime(),
                                crosDomain: true,
                                success: function (result) {
                                    var fd = new FormData();
                                    fd.append('files[]', file);
                                    xhr.open("POST", result, true);
                                    xhr.send(fd);
                                },
                                error: function () {
                                }
                            });
                        }
                        return false;
                    }
                });
                $applozic(d).on("click", '.mck-remove-file', function () {
                    var $currFileBox = $applozic(this).parents('.mck-file-box');
                    var currFileMeta = $currFileBox.data('mckfile');
                    $currFileBox.remove();
                    $mck_msg_sbmt.attr('disabled', false);
                    if ($file_box.find('.mck-file-box').length === 0) {
                        $file_box.removeClass('vis').addClass('n-vis');
                        $mck_text_box.attr("required", "");
                    }
                    if (typeof currFileMeta === 'object') {
                        _this.deleteFileMeta(currFileMeta.blobKey);
                        $applozic.each(FILE_META, function (i, fileMeta) {
                            if (typeof fileMeta !== 'undefined' && fileMeta.blobKey === currFileMeta.blobKey) {
                                FILE_META.splice(i, 1);
                            }
                        });
                    }
                });
            };
            _this.deleteFileMeta = function (blobKey) {
                $applozic.ajax({
                    url: MCK_FILE_URL + FILE_DELETE_URL + '?key=' + blobKey,
                    type: 'post',
                    success: function () {
                    },
                    error: function () {
                    }
                });
            };
            _this.getFilePreviewPath = function (fileMeta) {
                return (typeof fileMeta === "object") ? '<a href="' + MCK_FILE_URL + FILE_PREVIEW_URL + fileMeta.blobKey + '" target="_blank">' + fileMeta.name + '</a>' : "";
            };
            _this.getFilePreviewSize = function (fileSize) {
                if (fileSize) {
                    if (fileSize > ONE_MB) {
                        return "(" + parseInt(fileSize / ONE_MB) + " MB)";
                    } else if (fileSize > ONE_KB) {
                        return "(" + parseInt(fileSize / ONE_KB) + " KB)";
                    } else {
                        return "(" + parseInt(fileSize) + " B)";
                    }
                }
                return "";
            };
            _this.addFileBox = function (file) {
                var fileboxId = mckUtils.randomId();
                var fileName = "";
                if (typeof file.fileMeta === 'object') {
                    fileboxId = file.fileMeta.createdAtTime;
                    fileName = file.fileMeta.name;
                }
                var fileboxList = [
                    {
                        fileNameExpr: file.filelb,
                        fileSizeExpr: file.filesize,
                        fileIdExpr: fileboxId,
                        fileName: fileName
                    }
                ];
                $applozic.tmpl("fileboxTemplate", fileboxList).appendTo('#mck-file-box');
                var $fileContainer = $applozic(".mck-file-box." + fileboxId);
                var $file_remove = $fileContainer.find(".mck-remove-file");
                var $file_progress = $fileContainer.find(".progress");
                if (typeof file.fileMeta === 'object') {
                    $fileContainer.data('mckblob', file.fileMeta.blobKey);
                    $mck_text_box.removeAttr('required');
                    $mck_msg_sbmt.attr('disabled', false);
                    $file_remove.attr('disabled', false);
                    $file_progress.removeClass('vis').addClass('n-vis');
                    FILE_META.push(file.fileMeta);
                } else {
                    $mck_msg_sbmt.attr('disabled', true);
                    $file_remove.attr('disabled', true);
                    $file_progress.removeClass('n-vis').addClass('vis');
                }
            };
        }

        function MckNotificationService() {
            var _this = this;
            var $mck_sidebox;
            var $mck_msg_inner;
            var $mck_msg_preview;
            var $mck_preview_icon;
            var $mck_preview_name;
            var notificationTimeout;
            var $mck_sidebox_launcher;
            var $mck_preview_msg_content;
            var $mck_preview_file_content;
            _this.init = function () {
                $mck_sidebox = $applozic("#mck-sidebox");
                $mck_msg_preview = $applozic("#mck-msg-preview");
                $mck_sidebox_launcher = $applozic("#mck-sidebox-launcher");
                $mck_msg_inner = $applozic("#mck-message-cell .mck-message-inner");
                $mck_preview_icon = $applozic("#mck-msg-preview .mck-preview-icon");
                $mck_preview_name = $applozic("#mck-msg-preview .mck-preview-cont-name");
                $mck_preview_msg_content = $applozic("#mck-msg-preview .mck-preview-msg-content");
                $mck_preview_file_content = $applozic("#mck-msg-preview .mck-preview-file-content");
                notificationTimeout = 60;
            };
            _this.isChrome = function () {
                return /chrom(e|ium)/.test(w.navigator.userAgent.toLowerCase());
            };
            _this.notifyUser = function (message) {
                var notificationTimeout = 60;
                if (message.type === 7) {
                    return;
                }
                var contact = (message.groupId) ? mckGroupLayout.getGroup('' + message.groupId) : mckMessageLayout.fetchContact('' + message.to.split(",")[0]);
                var isGroup = false;
                if (message.groupId) {
                    isGroup = true;
                }
                var displayName = mckMessageLayout.getTabDisplayName(contact.contactId, isGroup);
                _this.showNewMessageNotification(message, contact, displayName);
                if (IS_MCK_NOTIFICATION && !IS_MCK_TAB_FOCUSED) {
                    if (_this.isChrome()) {
                        var msg = mckMessageLayout.getTextForMessagePreview(message, contact);
                        var c_version = parseInt(w.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
                        if (c_version >= 35) {
                            if (!w.Notification) {
                                return;
                            }
                            if (w.Notification.permission !== "granted") {
                                w.Notification.requestPermission();
                            }
                            var iconLink = MCK_NOTIFICATION_ICON_LINK;
                            if (typeof (MCK_GETUSERIMAGE) === "function" && !contact.isGroup) {
                                var imgsrc = MCK_GETUSERIMAGE(contact.contactId);
                                if (imgsrc && typeof imgsrc !== 'undefined') {
                                    iconLink = imgsrc;
                                }
                            }
                            var notification = new w.Notification(displayName, {
                                icon: iconLink, body: msg
                            });
                            notification.onclick = function () {
                                w.focus();
                                this.close();
                            };
                            setTimeout(function () {
                                notification.close();
                            }, notificationTimeout * 1000);
                        } else {
                            if (typeof w.webkitNotifications === "undefined") {
                                return;
                            }
                            if (w.webkitNotifications.checkPermission() === 0) {
                                var notification = w.webkitNotifications.createNotification(iconLink, displayName, msg);
                                _this.showNotification(notification);
                            }
                        }
                    } else {
                        if (typeof w.webkitNotifications === "undefined") {
                            return;
                        }
                        if (w.webkitNotifications.checkPermission() === 0) {
                            var notification = w.webkitNotifications.createNotification(iconLink, displayName, msg);
                            _this.showNotification(notification);
                        }
                    }
                }
            };
            _this.showNewMessageNotification = function (message, contact, displayName) {
                if (!IS_NOTIFICATION_ENABLED) {
                    return;
                }
                var currTabId = $mck_msg_inner.data('mck-id');
                if (currTabId === contact.contactId) {
                    if (message.conversationId) {
                        var currConvId = $mck_msg_inner.data('mck-conversationid');
                        currConvId = (typeof currConvId !== "undefined" && currConvId !== "") ? currConvId.toString() : "";
                        if (currConvId === message.conversationId.toString()) {
                            return;
                        }
                    } else {
                        return;
                    }
                }
                $mck_msg_preview.data('isgroup', contact.isGroup);
                var conversationId = (message.conversationId) ? message.conversationId : "";
                $mck_msg_preview.data('mck-conversationid', conversationId);
                var imgsrctag = mckMessageLayout.getContactImageLink(contact, displayName);
                if (message.message) {
                    var msg = mckMessageLayout.getMessageTextForContactPreview(message, contact, 50);
                    $mck_preview_msg_content.html("");
                    (typeof msg === 'object') ? $mck_preview_msg_content.append(msg) : $mck_preview_msg_content.html(msg);
                    $mck_preview_msg_content.removeClass('n-vis').addClass('vis');
                } else {
                    $mck_preview_msg_content.html("");
                }
                if (message.fileMetaKey) {
                    $mck_preview_file_content.html(mckMessageLayout.getFileIcon(message));
                    $mck_preview_file_content.removeClass('n-vis').addClass('vis');
                    if ($mck_preview_msg_content.html() === "") {
                        $mck_preview_msg_content.removeClass('vis').addClass('n-vis');
                    }
                } else {
                    $mck_preview_file_content.html("");
                    $mck_preview_file_content.removeClass('vis').addClass('n-vis');
                }
                $mck_preview_name.html(displayName);
                $mck_preview_icon.html(imgsrctag);
                $mck_msg_preview.data('mck-id', contact.contactId);
                $mck_msg_preview.show();
                setTimeout(function () {
                    $mck_msg_preview.fadeOut(3000);
                }, 10000);
            };
            _this.showNotification = function (notification) {
                if (_this.isChrome()) {
                    notification.onclick = function () {
                        w.focus();
                        this.cancel();
                    };
                }
                notification.show();
                setTimeout(function () {
                    notification.cancel();
                }, notificationTimeout * 1000);
            };
        }

        function MckInitializeChannel() {
            var _this = this;
            var subscriber = null;
            var stompClient = null;
            var TYPING_TAB_ID = "";
            var typingSubscriber = null;
            var checkConnectedIntervalId;
            var sendConnectedStatusIntervalId;
            var $mck_sidebox = $applozic("#mck-sidebox");
            var $mck_tab_title = $applozic("#mck-tab-title");
            var $mck_typing_box = $applozic(".mck-typing-box");
            var $mck_tab_status = $applozic("#mck-tab-status");
            var $mck_typing_box_text = $applozic(".mck-typing-box .name-text");
            var $mck_message_inner = $applozic("#mck-message-cell .mck-message-inner");
            _this.init = function () {
                var port = (!MCK_WEBSOCKET_URL.startsWith("https")) ? "15674" : "15675";
                if (typeof SockJS === 'function') {
                    var socket = new SockJS(MCK_WEBSOCKET_URL + ":" + port + "/stomp");
                    stompClient = w.Stomp.over(socket);
                    stompClient.heartbeat.outgoing = 0;
                    stompClient.heartbeat.incoming = 0;
                    stompClient.connect("guest", "guest", _this.onConnect, _this.onError, '/');
                    w.addEventListener("beforeunload", function (e) {
                        _this.sendStatus(0);
                    });
                }
            };
            _this.checkConnected = function () {
                if (stompClient.connected) {
                    if (checkConnectedIntervalId) {
                        clearInterval(checkConnectedIntervalId);
                    }
                    if (sendConnectedStatusIntervalId) {
                        clearInterval(sendConnectedStatusIntervalId);
                    }
                    checkConnectedIntervalId = setInterval(function () {
                        _this.connectToSocket();
                    }, 600000);
                    sendConnectedStatusIntervalId = setInterval(function () {
                        _this.sendStatus(2);
                    }, 1200000);
                } else {
                    _this.connectToSocket();
                }
            };
            _this.connectToSocket = function () {
                if (!stompClient.connected) {
                    if ($mck_sidebox.css('display') === 'block') {
                        var currTabId = $mck_message_inner.data('mck-id');
                        if (currTabId) {
                            var isGroup = $mck_message_inner.data('isgroup');
                            var conversationId = $mck_message_inner.data('mck-conversationid');
                            var topicId = $mck_message_inner.data('mck-topicid');
                            mckStorage.clearMckMessageArray();
                            mckMessageLayout.loadTab({'tabId': currTabId, 'isGroup': isGroup, 'conversationId': conversationId, 'topicId': topicId});
                        } else {
                            mckStorage.clearMckMessageArray();
                            mckMessageLayout.loadTab({'tabId': "", 'isGroup': false});
                        }
                    }
                    _this.init();
                }
            };
            _this.stopConnectedCheck = function () {
                if (checkConnectedIntervalId) {
                    clearInterval(checkConnectedIntervalId);
                }
                if (sendConnectedStatusIntervalId) {
                    clearInterval(sendConnectedStatusIntervalId);
                }
                checkConnectedIntervalId = "";
                sendConnectedStatusIntervalId = "";
                _this.disconnect();
            };
            _this.disconnect = function () {
                if (stompClient && stompClient.connected) {
                    _this.sendStatus(0);
                    stompClient.disconnect();
                }
            };
            _this.unsubscibeToTypingChannel = function () {
                if (stompClient && stompClient.connected) {
                    if (typingSubscriber) {
                        if (MCK_TYPING_STATUS === 1) {
                            _this.sendTypingStatus(0, TYPING_TAB_ID);
                        }
                        typingSubscriber.unsubscribe();
                    }
                }
                typingSubscriber = null;
            };
            _this.unsubscibeToNotification = function () {
                if (stompClient && stompClient.connected) {
                    if (subscriber) {
                        subscriber.unsubscribe();
                    }
                }
                subscriber = null;
            };
            _this.subscibeToTypingChannel = function (tabId, isGroup) {
                var subscribeId = (isGroup) ? tabId : MCK_USER_ID;
                if (stompClient && stompClient.connected) {
                    typingSubscriber = stompClient.subscribe("/topic/typing-" + MCK_APP_ID + "-" + subscribeId, _this.onTypingStatus);
                } else {
                    _this.reconnect();
                }
            };
            _this.sendTypingStatus = function (status, tabId) {
                if (status === 1 && MCK_TYPING_STATUS === 1) {
                    stompClient.send('/topic/typing-' + MCK_APP_ID + "-" + TYPING_TAB_ID, {"content-type": "text/plain"}, MCK_APP_ID + "," + MCK_USER_ID + "," + status);
                }
                if (tabId) {
                    if (tabId === TYPING_TAB_ID && status === MCK_TYPING_STATUS && status === 1) {
                        return;
                    }
                    TYPING_TAB_ID = tabId;
                    stompClient.send('/topic/typing-' + MCK_APP_ID + "-" + tabId, {"content-type": "text/plain"}, MCK_APP_ID + "," + MCK_USER_ID + "," + status);
                    setTimeout(function () {
                        MCK_TYPING_STATUS = 0;
                    }, 60000);
                } else if (status === 0) {
                    stompClient.send('/topic/typing-' + MCK_APP_ID + "-" + TYPING_TAB_ID, {"content-type": "text/plain"}, MCK_APP_ID + "," + MCK_USER_ID + "," + status);
                }
                MCK_TYPING_STATUS = status;
            };
            _this.onTypingStatus = function (resp) {
                var message = resp.body;
                var publisher = message.split(",")[1];
                var status = Number(message.split(",")[2]);
                var tabId = resp.headers.destination.substring(resp.headers.destination.lastIndexOf("-") + 1, resp.headers.destination.length);
                var currTabId = $mck_message_inner.data('mck-id');
                var isGroup = $mck_message_inner.data('isgroup');
                if (!MCK_BLOCKED_TO_MAP[publisher] && !MCK_BLOCKED_BY_MAP[publisher]) {
                    if (status === 1) {
                        if ((MCK_USER_ID !== publisher || !isGroup) && (currTabId === publisher || currTabId === tabId)) {
                            var isGroup = $mck_message_inner.data('isgroup');
                            $mck_tab_title.addClass("mck-tab-title-w-typing");
                            $mck_tab_status.removeClass('vis').addClass('n-vis');
                            if (isGroup) {
                                if (publisher !== MCK_USER_ID) {
                                    var displayName = mckMessageLayout.getTabDisplayName(publisher, false);
                                    displayName = displayName.split(" ")[0];
                                    $mck_typing_box_text.html(displayName + " is ");
                                }
                            } else {
                                $mck_typing_box_text.html("");
                            }
                            $mck_typing_box.removeClass('n-vis').addClass('vis');
                            setTimeout(function () {
                                $mck_tab_title.removeClass("mck-tab-title-w-typing");
                                $mck_typing_box.removeClass('vis').addClass('n-vis');
                                if ($mck_tab_title.hasClass("mck-tab-title-w-status")) {
                                    $mck_tab_status.removeClass('n-vis').addClass('vis');
                                }
                                $mck_typing_box_text.html("");
                            }, 60000);
                        }
                    } else {
                        $mck_tab_title.removeClass("mck-tab-title-w-typing");
                        $mck_typing_box.removeClass('vis').addClass('n-vis');
                        if ($mck_tab_title.hasClass("mck-tab-title-w-status")) {
                            $mck_tab_status.removeClass('n-vis').addClass('vis');
                        }
                        $mck_typing_box_text.html("");
                    }
                }
            };
            _this.reconnect = function () {
                _this.unsubscibeToTypingChannel();
                _this.unsubscibeToNotification();
                _this.disconnect();
                _this.init();
            };
            _this.onError = function (err) {
                w.console.log("Error in channel notification. " + err.body);
            };
            _this.sendStatus = function (status) {
                if (stompClient && stompClient.connected) {
                    stompClient.send('/topic/status', {"content-type": "text/plain"}, MCK_TOKEN + "," + status);
                }
            };
            _this.onConnect = function () {
                if (stompClient.connected) {
                    if (subscriber) {
                        _this.unsubscibeToNotification();
                    }
                    subscriber = stompClient.subscribe("/topic/" + MCK_TOKEN, _this.onMessage);
                    _this.sendStatus(1);
                    _this.checkConnected();
                } else {
                    setTimeout(function () {
                        subscriber = stompClient.subscribe("/topic/" + MCK_TOKEN, _this.onMessage);
                        _this.sendStatus(1);
                        _this.checkConnected();
                    }, 5000);
                }
            };
            _this.onMessage = function (obj) {
                var resp = $applozic.parseJSON(obj.body);
                var messageType = resp.type;
                if (messageType === "APPLOZIC_04" || messageType === "MESSAGE_DELIVERED") {
                    $applozic("." + resp.message.split(",")[0] + " .mck-message-status").removeClass('mck-icon-time').removeClass('mck-icon-sent').addClass('mck-icon-delivered');
                    mckMessageLayout.addTooltip(resp.message.split(",")[0]);
                } else if (messageType === "APPLOZIC_08" || messageType === "MT_MESSAGE_DELIVERED_READ") {
                    $applozic("." + resp.message.split(",")[0] + " .mck-message-status").removeClass('mck-icon-time').removeClass('mck-icon-sent').removeClass('mck-icon-delivered').addClass('mck-icon-read');
                    mckMessageLayout.addTooltip(resp.message.split(",")[0]);
                } else if (messageType === "APPLOZIC_05") {
                    var key = resp.message.split(",")[0];
                    var userId = resp.message.split(",")[1];
                    mckMessageLayout.removedDeletedMessage(key, userId);
                } else if (messageType === "APPLOZIC_06") {
                    var userId = resp.message;
                    if (typeof userId !== 'undefined') {
                        mckMessageLayout.removeConversationThread(userId);
                    }
                } else if (messageType === "APPLOZIC_11") {
                    var userId = resp.message;
                    var contact = mckMessageLayout.fetchContact(userId);
                    var tabId = $mck_message_inner.data('mck-id');
                    if (!MCK_BLOCKED_TO_MAP[userId] && !MCK_BLOCKED_BY_MAP[userId]) {
                        if (tabId === contact.contactId) {
                            $applozic("#mck-tab-status").html("Online");
                        } else {
                            var htmlId = mckContactUtils.formatContactId(userId);
                            $applozic("#li-" + htmlId + " .mck-ol-status").removeClass('n-vis').addClass('vis');
                        }
                        $applozic(".mck-user-ol-status." + htmlId).removeClass('n-vis').addClass('vis');
                        $applozic(".mck-user-ol-status." + htmlId).next().html('(Online)');
                        w.MCK_OL_MAP[userId] = true;
                        mckUserUtils.updateUserStatus({'userId': resp.message, 'status': 1});
                    }
                } else if (messageType === "APPLOZIC_12") {
                    var userId = resp.message.split(",")[0];
                    var lastSeenAtTime = resp.message.split(",")[1];
                    w.MCK_OL_MAP[userId] = false;
                    if (lastSeenAtTime) {
                        MCK_LAST_SEEN_AT_MAP[userId] = lastSeenAtTime;
                    }
                    var htmlId = mckContactUtils.formatContactId(userId);
                    if (!MCK_BLOCKED_TO_MAP[userId] && !MCK_BLOCKED_BY_MAP[userId]) {
                        $applozic(".mck-user-ol-status." + htmlId).removeClass('vis').addClass('n-vis');
                        $applozic(".mck-user-ol-status." + htmlId).next().html('(Offline)');
                        $applozic("#li-" + htmlId + " .mck-ol-status").removeClass('vis').addClass('n-vis');
                        mckUserUtils.updateUserStatus({'userId': resp.message.split(",")[0], 'status': 0, 'lastSeenAtTime': resp.message.split(",")[1]});
                    }
                } else if (messageType === "APPLOZIC_09") {
                    var userId = resp.message;
                    var contact = mckMessageLayout.fetchContact(userId);
                    MCK_UNREAD_COUNT_MAP[contact.contactId] = 0;
                    var tabId = $mck_message_inner.data('mck-id');
                    if ((typeof tabId === "undefined") || tabId === "") {
                        $applozic("#li-" + contact.htmlId + " .mck-unread-count-text").html(mckMessageLayout.getUnreadCount(contact.contactId));
                        $applozic("#li-" + contact.htmlId + " .mck-unread-count-box").removeClass("vis").addClass("n-vis");
                    }
                } else if (messageType === "APPLOZIC_10") {
                    var userId = resp.message;
                    var contact = mckMessageLayout.getContact(userId);
                    if (typeof contact === 'undefined') {
                        var userIdArray = [];
                        userIdArray.push(userId);
                        mckContactService.getUsersDetail(userIdArray);
                    }
                    var tabId = $mck_message_inner.data('mck-id');
                    if (tabId === userId) {
                        $applozic(".mck-msg-right .mck-message-status").removeClass('mck-icon-time').removeClass('mck-icon-sent').removeClass('mck-icon-delivered').addClass('mck-icon-read');
                        $applozic(".mck-msg-right .mck-icon-delivered").attr('title', 'delivered and read');
                    }
                } else if (messageType === "APPLOZIC_16") {
                    var status = resp.message.split(":")[0];
                    var userId = resp.message.split(":")[1];
                    var contact = mckMessageLayout.fetchContact(userId);
                    var tabId = $mck_message_inner.data('mck-id');
                    if (tabId === contact.contactId) {
                        if (status === BLOCK_STATUS_MAP[0]) {
                            MCK_BLOCKED_TO_MAP[contact.contactId] = true;
                            mckUserUtils.toggleBlockUser(tabId, true);
                        } else {
                            MCK_BLOCKED_BY_MAP[contact.contactId] = true;
                            $mck_tab_title.removeClass('mck-tab-title-w-status');
                            $mck_tab_status.removeClass('vis').addClass('n-vis');
                            $mck_typing_box.removeClass('vis').addClass('n-vis');
                        }
                    } else {
                        $applozic("#li-" + contact.htmlId + " .mck-ol-status").removeClass('vis').addClass('n-vis');
                    }
                } else if (messageType === "APPLOZIC_17") {
                    var status = resp.message.split(":")[0];
                    var userId = resp.message.split(":")[1];
                    var contact = mckMessageLayout.fetchContact(userId);
                    var tabId = $mck_message_inner.data('mck-id');
                    if (tabId === contact.contactId) {
                        if (status === BLOCK_STATUS_MAP[2]) {
                            MCK_BLOCKED_TO_MAP[contact.contactId] = false;
                            mckUserUtils.toggleBlockUser(tabId, false);
                        } else if (w.MCK_OL_MAP[tabId] || MCK_LAST_SEEN_AT_MAP[tabId]) {
                            MCK_BLOCKED_BY_MAP[contact.contactId] = false;
                            if (!MCK_BLOCKED_TO_MAP[tabId]) {
                                if (w.MCK_OL_MAP[tabId]) {
                                    $mck_tab_status.html("Online");
                                } else if (MCK_LAST_SEEN_AT_MAP[tabId]) {
                                    $mck_tab_status.html(mckDateUtils.getLastSeenAtStatus(MCK_LAST_SEEN_AT_MAP[tabId]));
                                }
                                $mck_tab_title.addClass("mck-tab-title-w-status");
                                $mck_tab_status.removeClass('n-vis').addClass('vis');
                            }
                        }
                    } else if (w.MCK_OL_MAP[tabId]) {
                        $applozic("#li-" + contact.htmlId + " .mck-ol-status").removeClass('n-vis').addClass('vis');
                    }
                } else if (messageType === "APPLOZIC_18") {
                    IS_MCK_USER_DEACTIVATED = false;
                } else if (messageType === "APPLOZIC_19") {
                    IS_MCK_USER_DEACTIVATED = true;
                } else {
                    var message = resp.message;
                    //  var userIdArray = mckMessageLayout.getUserIdFromMessage(message);
                    //  mckContactService.getContactDisplayName(userIdArray);
                    //  mckMessageLayout.openConversation();
                    if (messageType === "APPLOZIC_03" && message.type !== 0 && message.type !== 4) {
                        $applozic("." + message.key + " .mck-message-status").removeClass('mck-icon-time').addClass('mck-icon-sent');
                        mckMessageLayout.addTooltip(message.key);
                        return;
                    } else if (messageType === "APPLOZIC_01" || messageType === "APPLOZIC_02" || messageType === "MESSAGE_RECEIVED") {
                        var messageArray = [];
                        messageArray.push(message);
                        mckStorage.updateMckMessageArray(messageArray);
                        var contact = (message.groupId) ? mckGroupLayout.getGroup(message.groupId) : mckMessageLayout.getContact(message.to);
                        var $mck_sidebox_content = $applozic("#mck-sidebox-content");
                        var tabId = $mck_message_inner.data('mck-id');
                        if (!$mck_sidebox_content.hasClass('n-vis')) {
                            if (typeof contact === 'undefined') {
                                if (message.groupId) {
                                    mckGroupService.getGroupFeedFromMessage(message, messageType, resp.notifyUser);
                                } else {
                                    var userIdArray = [];
                                    userIdArray.push(message.to);
                                    mckContactService.getUsersDetail(userIdArray, {message: message, messageType: messageType, notifyUser: resp.notifyUser});
                                }
                                return;
                            } else {
                                if (message.conversationId) {
                                    var conversationPxy = MCK_CONVERSATION_MAP[message.conversationId];
                                    if ((IS_MCK_TOPIC_HEADER || IS_MCK_TOPIC_BOX) && ((typeof conversationPxy !== 'object') || (typeof (MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId]) !== 'object'))) {
                                        mckMessageService.getTopicId({'conversationId': message.conversationId, 'messageType': messageType, 'message': message, 'notifyUser': resp.notifyUser});
                                        return;
                                    }
                                }
                                mckMessageLayout.populateMessage(messageType, message, resp.notifyUser);
                            }
                        }
                    }
                }
            };
        }

        function MckDateUtils() {
            var _this = this;
            var fullDateFormat = "mmm d, h:MM TT";
            var onlyDateFormat = "mmm d";
            var onlyTimeFormat = "h:MM TT";
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            _this.getDate = function (createdAtTime) {
                var date = new Date(parseInt(createdAtTime, 10));
                var currentDate = new Date();
                return ((currentDate.getDate() === date.getDate()) && (currentDate.getMonth() === date.getMonth()) && (currentDate.getYear() === date.getYear())) ? dateFormat(date, onlyTimeFormat, false) : dateFormat(date, fullDateFormat, false);
            };
            _this.getLastSeenAtStatus = function (lastSeenAtTime) {
                var date = new Date(parseInt(lastSeenAtTime, 10));
                var currentDate = new Date();
                if ((currentDate.getDate() === date.getDate()) && (currentDate.getMonth() === date.getMonth()) && (currentDate.getYear() === date.getYear())) {
                    var hoursDiff = currentDate.getHours() - date.getHours();
                    var timeDiff = w.Math.floor((currentDate.getTime() - date.getTime()) / 60000);
                    if (timeDiff < 60) {
                        return  (timeDiff <= 1) ? "Last seen 1 min ago" : "Last seen " + timeDiff + " mins ago";
                    }
                    return (hoursDiff === 1) ? "Last seen 1 hour ago" : "Last seen " + hoursDiff + " hours ago";
                } else if (((currentDate.getDate() - date.getDate() === 1) && (currentDate.getMonth() === date.getMonth()) && (currentDate.getYear() === date.getYear()))) {
                    return "Last seen on yesterday";
                } else {
                    return "Last seen on " + dateFormat(date, onlyDateFormat, false);
                }
            };
            _this.getTimeOrDate = function (createdAtTime, timeFormat) {
                var date = new Date(parseInt(createdAtTime, 10));
//                var localDate = new Date();
//                var utcTime = parseInt(date.getTime() + (localDate.getTimezoneOffset() * 60000));
//                date = new Date(parseInt(utcTime + parseInt(MCK_USER_TIMEZONEOFFSET, 10)));
                var currentDate = new Date();
//                var utcCurrentTime = parseInt(currentDate.getTime() + (localDate.getTimezoneOffset() * 60000));
//                currentDate = new Date(parseInt(utcCurrentTime + parseInt(MCK_USER_TIMEZONEOFFSET, 10)));
                if (timeFormat) {
                    return ((currentDate.getDate() === date.getDate()) && (currentDate.getMonth() === date.getMonth()) && (currentDate.getYear() === date.getYear())) ? dateFormat(date, onlyTimeFormat, false) : dateFormat(date, onlyDateFormat, false);
                } else {
                    return dateFormat(date, fullDateFormat, false);
                }
            };
            _this.getSystemDate = function (time) {
                var date = new Date(parseInt(time, 10));
                return dateFormat(date, fullDateFormat, false);
            };
            var dateFormat = function () {
                var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                        timezoneClip = /[^-+\dA-Z]/g,
                        pad = function (val, len) {
                            val = String(val);
                            len = len || 2;
                            while (val.length < len)
                                val = "0" + val;
                            return val;
                        };
                // Regexes and supporting functions are cached through closure
                return function (date, mask, utc) {
                    var dF = dateFormat;
                    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
                    if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
                        mask = date;
                        date = undefined;
                    }
                    // Passing date through Date applies Date.parse, if necessary
                    date = date ? new Date(date) : new Date;
                    if (isNaN(date))
                        throw SyntaxError("invalid date");
                    mask = String(mask);
                    // mask = String(dF.masks[mask] || mask || dF.masks["default"]);
                    // Allow setting the utc argument via the mask
                    if (mask.slice(0, 4) === "UTC:") {
                        mask = mask.slice(4);
                        utc = true;
                    }
                    var _ = utc ? "getUTC" : "get",
                            d = date[_ + "Date"](),
                            D = date[_ + "Day"](),
                            m = date[_ + "Month"](),
                            y = date[_ + "FullYear"](),
                            H = date[_ + "Hours"](),
                            M = date[_ + "Minutes"](),
                            s = date[_ + "Seconds"](),
                            L = date[_ + "Milliseconds"](),
                            o = utc ? 0 : date.getTimezoneOffset(),
                            flags = {
                                d: d,
                                dd: pad(d),
                                ddd: dF.i18n.dayNames[D],
                                dddd: dF.i18n.dayNames[D + 7],
                                m: m + 1,
                                mm: pad(m + 1),
                                mmm: dF.i18n.monthNames[m],
                                mmmm: dF.i18n.monthNames[m + 12],
                                yy: String(y).slice(2),
                                yyyy: y,
                                h: H % 12 || 12,
                                hh: pad(H % 12 || 12),
                                H: H,
                                HH: pad(H),
                                M: M,
                                MM: pad(M),
                                s: s,
                                ss: pad(s),
                                l: pad(L, 3),
                                L: pad(L > 99 ? w.Math.round(L / 10) : L),
                                t: H < 12 ? "a" : "p",
                                tt: H < 12 ? "am" : "pm",
                                T: H < 12 ? "A" : "P",
                                TT: H < 12 ? "AM" : "PM",
                                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                                o: (o > 0 ? "-" : "+") + pad(w.Math.floor(w.Math.abs(o) / 60) * 100 + w.Math.abs(o) % 60, 4),
                                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
                            };
                    return mask.replace(token, function ($0) {
                        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                    });
                };
            }();
            // Some common format strings
            dateFormat.masks = {
                "default": "mmm d, yyyy h:MM TT",
                fullDateFormat: "mmm d, yyyy h:MM TT",
                onlyDateFormat: "mmm d",
                onlyTimeFormat: "h:MM TT",
                mailDateFormat: "mmm d, yyyy",
                mediumDate: "mmm d, yyyy",
                longDate: "mmmm d, yyyy",
                fullDate: "dddd, mmmm d, yyyy",
                shortTime: "h:MM TT",
                mediumTime: "h:MM:ss TT",
                longTime: "h:MM:ss TT Z",
                isoDate: "yyyy-mm-dd",
                isoTime: "HH:MM:ss",
                isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
                isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
            };
            // Internationalization strings
            dateFormat.i18n = {
                dayNames: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
                ],
                monthNames: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ]
            };
        }
    }
}($applozic, window, document));