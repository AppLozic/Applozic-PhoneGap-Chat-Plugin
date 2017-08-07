
Checkout the new plugin for phonegap which have native look and feel

https://github.com/AppLozic/Applozic-Cordova-Ionic-PhoneGap-Chat-Plugin











Documentation for PhoneGap 1.0 version plugin for HTML, Javascript interface.
________________________________________________________________________________________________________________________
# Applozic-PhoneGap-Chat-Plugin
PhoneGap Real Time Chat & Messaging Plugin 

Applozic powers real time messaging across any device, any platform & anywhere in the world. Integrate our simple SDK to engage your users with image, file, location sharing and audio/video conversations.

Signup at [https://www.applozic.com/signup.html](https://www.applozic.com/signup.html?utm_source=github&utm_medium=readme&utm_campaign=phonegap) to get the application key.


Documentation: [Applozic PhoneGap Chat & Messaging Plugin Documentation](https://www.applozic.com/docs/phonegap-chat-plugin.html?utm_source=github&utm_medium=readme&utm_campaign=phonegap)

#### Step 1: Add plugin
Copy [applozic folder](https://github.com/AppLozic/Applozic-PhoneGap-Chat-Plugin/tree/master/www/applozic) containing js and css files into your project folder.

#### Step 2: Script under head
Add the following under ```<head>``` tag:

```
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' https://apps.applozic.com https://maps.google.com https://maps.googleapis.com 'unsafe-inline' 'unsafe-eval'; style-src 'self' https://apps.applozic.com 'unsafe-inline'"> 
    
    <link href="applozic/css/mck-combined.min.css" rel="stylesheet">
    <link href="applozic/css/app/mck-sidebox-1.0.css" rel="stylesheet">
    <link href="applozic/css/app/mck-mobile-fullview.css" rel="stylesheet">
	
    <!-- Custom JS -->
    <script type="text/javascript">
        var $original;
        if (typeof jQuery !== 'undefined') {
            $original = jQuery.noConflict(true);
            $ = $original;
            jQuery = $original;
        }
    </script>
    <script src="applozic/js/jquery-2.2.2.min.js"></script>
  ```
  
#### Step 3: Chat UI HTML
  Copy the following HTML under <body> tag for Chat UI.
  
  ```   
     <div id="mck-sidebox" class="mck-sidebox mck-box fade">
        	<div class="mck-box-dialog mck-box-sm mck-right mck-bg-white">
        		<div id="mck-sidebox-content"
        			class="mck-sidebox-content mck-box-content">
        			<div id="mck-conversation-header"
        				class="mck-conversation-header mck-truncate n-vis"></div>
        			<div class="mck-box-top">
        				<div class="blk-lg-10">
        					<div id="mck-tab-individual" class="mck-row n-vis">
        						<div class="mck-tab-link blk-lg-4">
        							<a href="#" role="link" class="mck-conversation-tab-link"><span
        								class="mck-icon-backward"></span></a>
        						</div>
        						<div class="blk-lg-8 mck-box-title">
        							<div id="mck-tab-title" class="mck-tab-title mck-truncate">
        								Conversations</div>
        							<div id="mck-tab-status"
        								class="mck-tab-status mck-truncate n-vis"></div>
        							<div class="mck-typing-box mck-truncate n-vis">
        								<span id="mck-typing-label">typing...</span>
        							</div>
        						</div>
        					</div>
        					<div id="mck-tab-conversation" class="mck-row">
        						<h4 id="mck-conversation-title" class="mck-box-title mck-truncate">Conversations</h4>
        					</div>
        				</div>
        				<div class="blk-lg-2">
        					<button type="button"
        						class="mck-minimize-icon mck-box-close mck-close icon n-vis">
        						<span aria-hidden="true">&minus;</span>
        					</button>
        					<button type="button"
        						class="mck-box-close mck-close-sidebox move-right"
        						data-dismiss="mckbox" aria-label="Close">
        						<span aria-hidden="true">&times;</span>
        					</button>
        				</div>
        			</div>
        			<div id="mck-product-group"
        				class="mck-tab-panel mck-btn-group mck-product-group">
        				<div id="mck-product-box"
        					class="mck-product-box n-vis mck-dropdown-toggle"
        					data-toggle="mckdropdown" aria-expanded="true">
        					<div class="mck-row">
        						<div class="blk-lg-10">
        							<div class="mck-row">
        								<div class="blk-lg-3 mck-product-icon"></div>
        								<div class="blk-lg-9">
        									<div class="mck-row">
        										<div class="blk-lg-8 mck-product-title mck-truncate"></div>
        										<div
        											class="move-right mck-product-rt-up mck-truncate blk-lg-4">
        											<strong class="mck-product-key"></strong><span
        												class="mck-product-value"></span>
        										</div>
        									</div>
        									<div class="mck-row">
        										<div class="blk-lg-8 mck-truncate mck-product-subtitle"></div>
        										<div
        											class="move-right mck-product-rt-down mck-truncate blk-lg-4">
        											<strong class="mck-product-key"></strong><span
        												class="mck-product-value"></span>
        										</div>
        									</div>
        								</div>
        							</div>
        						</div>
        						<div class="blk-lg-2">
        							<span class="mck-caret n-vis"></span>
        						</div>
        					</div>
        				</div>
        				<ul id="mck-conversation-list"
        					class="mck-dropdown-menu menu-right mck-conversation-list n-vis"
        					role="menu"></ul>
        			</div>
        			<div id="mck-tab-option-panel"
        				class="mck-tab-panel mck-top-btn-panel">
        				<div id="mck-tab-menu-box" class="mck-tab-menu-box vis">
        					<div class="mck-row">
        						<div class="blk-lg-2 move-right">
        							<div class="mck-dropdown-toggle" data-toggle="mckdropdown"
        								aria-expanded="true">
        								<img
        									src="applozic/css/app/images/mck-icon-menu.png"
        									alt="Tab Menu">
        							</div>
        							<ul id="mck-tab-menu-list"
        								class="mck-dropdown-menu mck-tab-menu-box menu-right"
        								role="menu">
        								<li class="mck-tab-message-option"><a href="#"
        									id="mck-btn-clear-messages"
        									class="mck-btn-clear-messages menu-item" title="Clear Messages">
        										Clear Messages </a></li>
        								<li id="li-mck-block-user"><a href="#"
        									id="mck-block-button" class="menu-item" title="Block User">
        										Block User </a></li>
        								<li id="li-mck-group-info" class="mck-group-menu-options">
        									<a href="#" id="mck-group-info-btn" class="menu-item"
        									title="Group Info"> Group Info </a>
        								</li>
        								<li id="li-mck-leave-group" class="mck-group-menu-options">
        									<a href="#" id="mck-btn-leave-group" class="menu-item"
        									title="Exit Group"> Exit Group </a>
        								</li>
        							</ul>
        						</div>
        					</div>
        				</div>
        			</div>
        			<div class="mck-box-body">
        				<div id="mck-message-cell" class="mck-tab-cell mck-message-cell">
        					<div id="mck-price-widget"
        						class="mck-row mck-price-widget mck-top-widget n-vis">
        						<div class="mck-widget-panel">
        							<input type="text" id="mck-price-text-box"
        								placeholder="Enter final agreed price">
        							<button type="button" id="mck-price-submit"
        								class="mck-btn mck-btn-green mck-price-submit" title="Submit">
        								<span>Submit</span>
        							</button>
        						</div>
        					</div>
        					<div class="mck-message-inner"></div>
        					<div id="mck-contact-loading" class="mck-loading">
        						<img src="applozic/css/app/images/ring.gif"
        							alt="Loading" />
        					</div>
        					<div id="mck-no-conversations"
        						class="mck-no-data-text mck-text-muted n-vis">
        						<h3>No conversations yet!</h3>
        					</div>
        					<div id="mck-no-messages"
        						class="mck-no-data-text mck-text-muted n-vis">
        						<h3>No messages yet!</h3>
        					</div>
        					<div id="mck-no-more-conversations"
        						class="mck-show-more-icon n-vis">
        						<h3>No more conversations!</h3>
        					</div>
        					<div id="mck-no-more-messages" class="mck-show-more-icon n-vis">
        						<h3>No more messages!</h3>
        					</div>
        				</div>
        			</div>
        			<div id="mck-offline-message-box"
        				class="mck-offline-message-box n-vis">SET DEFAULT OFFLINE
        				MESSAGE!</div>
        			<div id="mck-sidebox-ft" class="mck-box-ft">
        				<div class="mck-box-form mck-row n-vis">
        					<div class="blk-lg-12">
        						<p id="mck-msg-error" class="mck-sidebox-error n-vis"></p>
        					</div>
        					<div id="mck-msg-response" class="blk-lg-12 mck-box-response n-vis">
        						<div id="mck-response-text" class="response-text"></div>
        					</div>
        					<div class="blk-lg-12">
        						<form id="mck-msg-form" class="vertical mck-msg-form">
        							<div class="mck-form-group n-vis">
        								<label class="sr-only placeholder-text control-label"
        									for="mck-msg-to">To:</label> <input class="mck-form-cntrl"
        									id="mck-msg-to" name="mck-msg-to" placeholder="To" required>
        							</div>
        							<div class="mck-form-group last last-child">
        								<label class="sr-only placeholder-text control-label"
        									for="mck-textbox">Message</label>
        								<div id="mck-textbox-container" class="mck-textbox-container">
        									<div class="mck-blk-2 mck-text-box-panel move-left">
        										<div class="mck-blk-12">
        											<button type="button" id="mck-btn-smiley"
        												class="mck-btn mck-btn-smiley mck-btn-text-panel"
        												title="Smiley">
        												<span class="mck-icon-smiley-blue"></span>
        											</button>
        										</div>
        									</div>
        									<div
        										class="mck-blk-2 mck-text-box-panel mck-mid-panel move-left">
        										<div id="mck-attachmenu-box" class="mck-attach-menu">
        											<div id="mck-btn-attach"
        												class="mck-dropdown-toggle mck-btn-attach mck-file-attach-label mck-btn mck-btn-text-panel"
        												data-toggle="mckdropdown" aria-expanded="true"
        												title="Attach File">
        												<span class="mck-icon-upload"></span>
        											</div>
        											<ul id="mck-upload-menu-list"
        												class="mck-dropup-menu mck-upload-menu-list mck-menu-right"
        												role="menu">
        												<li><a id="mck-file-up" href="#"
        													class="mck-file-upload menu-item" title="File &amp; Photos">
        														<img src="applozic/css/app/images/mck-icon-photo.png"
        														class="menu-icon" alt="File &amp; Photos"><span
        														id="mck-file-up-label">Files &amp; Photos</span>
        												</a></li>
        												<li><a id="mck-btn-loc" href="#"
        													class="menu-item mck-btn-loc" title="Share Location">
        														<div class="mck-menu-icon">
        															<span class="mck-icon-marker-blue"></span>
        														</div> <span id="mck-share-loc-label">Share Location</span>
        												</a></li>

        											</ul>
        										</div>
        										<div id="mck-attachfile-box" class="mck-blk-12 n-vis">
        											<button id="mck-file-up2" type="button"
        												class="mck-file-upload mck-file-attach-label mck-btn mck-btn-text-panel"
        												title="Attach File">
        												<span class="mck-icon-upload"></span>
        											</button>
        										</div>
        									</div>
        									<div id="mck-text-box" contenteditable="true"
        										class="mck-blk-8 mck-text-box mck-text required"></div>
        									<div class="mck-blk-2 mck-text-box-panel move-right">
        										<div class="mck-blk-12">
        											<button type="submit" id="mck-msg-sbmt"
        												class="mck-btn mck-btn-text-panel" title="Send Message">
        												<span class="mck-icon-send"></span>
        											</button>
        										</div>
        									</div>
        									<input id="mck-file-input" class="mck-file-input n-vis"
        										type="file" name="files[]">
        									<div id="mck-file-box" class="n-vis"></div>
        								</div>
        							</div>
        						</form>
        					</div>
        				</div>
        				<div id="mck-contacts-content"
        					class="mck-contacts-content mck-text-center">
        					<button type="button" id="mck-msg-new"
        						class="mck-contact-search mck-btn mck-btn-blue" title="Start New">
        						<span>Start New</span>
        					</button>
        				</div>
        			</div>
        			<div class="mck-running-on n-vis">
        				<a href="https://www.applozic.com" target="_blank"><span
        					class="n-vis">Applozic Chat SDK</span><strong>Powered by
        						Applozic</strong></a>
        			</div>
        		</div>
        		<div id="mck-sidebox-search"
        			class="mck-sidebox-search mck-sidebox-content mck-box-content n-vis">
        			<div class="mck-box-top">
        				<div class="mck-tab-link blk-lg-4">
        					<a href="#" role="link" class="mck-conversation-tab-link"><span
        						class="mck-icon-backward"></span></a>
        				</div>
        				<div class="blk-lg-5">
        					<div class="mck-box-title mck-truncate" title="Start New">Start
        						New</div>
        				</div>
        				<div
        					class="blk-lg-3 move-right mck-start-new-menu-item mck-tab-menu-box">
        					<div class="mck-dropdown-toggle" data-toggle="mckdropdown"
        						aria-expanded="true">
        						<img src="applozic/css/app/images/icon-menu.png"
        							alt="Tab Menu">
        					</div>
        					<ul id="mck-start-new-menu-list"
        						class="mck-dropdown-menu  menu-right" role="menu">
        						<li><a href="#" id="mck-new-group"
        							class="mck-new-group-button menu-item" title="Create Group">Create
        								Group</a></li>
        					</ul>
        				</div>
        			</div>
        			<div id="mck-search-tab-box" class="mck-search-tab-box mck-row">
        				<div class="blk-lg-12">
        					<ul class="mck-nav mck-nav-panel">
        						<li class="mck-nav-item mck-nav-divider"><a
        							id="mck-contact-search-tab"
        							class="mck-nav-link mck-contact-search active" href="#"><strong>Contacts</strong></a></li>
        						<li class="mck-nav-item"><a id="mck-group-search-tab"
        							class="mck-nav-link mck-group-search" href="#"><strong>Groups</strong></a>
        						</li>
        					</ul>
        				</div>
        			</div>
        			<div class="mck-box-top mck-search-box-top">
        				<div id="mck-contact-search-input-box"
        					class="mck-input-group blk-lg-12">
        					<input id="mck-contact-search-input" type="text"
        						data-provide="typeahead" placeholder="Search..." autofocus /> <span
        						class="mck-search-icon"><a href="#" role="link"
        						class="mck-contact-search-link"><span class="mck-icon-search"></span></a></span>
        				</div>
        				<div id="mck-group-search-input-box"
        					class="mck-input-group blk-lg-12 n-vis">
        					<input id="mck-group-search-input" type="text"
        						data-provide="typeahead" placeholder="Search..." autofocus /> <span
        						class="mck-search-icon"><a href="#" role="link"
        						class="mck-group-search-link"><span class="mck-icon-search"></span></a></span>
        				</div>
        			</div>
        			<div class="mck-box-body">

        				<div id="mck-search-cell" class="mck-tab-cell">
        					<div class="mck-message-inner">
        						<ul id="mck-contact-search-list"
        							class="mck-contact-search-list mck-contact-list mck-nav mck-nav-tabs mck-nav-stacked"></ul>
        						<ul id="mck-group-search-list"
        							class="mck-contact-list mck-group-search-list mck-nav mck-nav-tabs mck-nav-stacked n-vis"></ul>
        						<div id="mck-no-search-groups"
        							class="mck-no-data-text mck-text-muted n-vis">No groups
        							yet!</div>
        						<div id="mck-no-search-contacts"
        							class="mck-no-data-text mck-text-mutedn n-vis">No contacts
        							yet!</div>
        						<div id="mck-search-loading" class="mck-loading n-vis">
        							<img src="applozic/css/app/images/ring.gif"
        								alt="Loading" />
        						</div>
        					</div>
        				</div>
        			</div>
        		</div>
        		<div id="mck-group-create-tab"
        			class="mck-group-create-tab mck-sidebox-content mck-box-content n-vis">
        			<div class="mck-box-top">
        				<div class="mck-tab-link blk-lg-4">
        					<a id="mck-search-tab-link" href="#" role="link"
        						class="mck-contact-search"><span class="mck-icon-backward"></span>
        					</a>
        				</div>
        				<div class="blk-lg-8">
        					<div class="mck-box-title mck-truncate" title="Create Group">Create
        						Group</div>
        				</div>
        			</div>
        			<div class="mck-box-body">
        				<div class="mck-tab-cell">
        					<div id="mck-group-create-panel"
        						class="mck-tab-panel mck-message-inner mck-group-create-inner">
        						<div class="mck-group-sub-sec">
        							<div id="mck-group-create-icon-box"
        								class="mck-group-create-icon-box mck-group-icon-box mck-hover-on">
        								<div class="mck-group-icon"></div>
        								<span class="mck-overlay-box">
        									<div class="mck-overlay">
        										<span class="mck-camera-icon"></span> <span
        											id="mck-gc-overlay-label" class="mck-overlay-label">Add
        											Group Icon</span>
        									</div>
        									<div id="mck-group-create-icon-loading"
        										class="mck-loading n-vis">
        										<img
        											src="applozic/css/app/images/mck-loading.gif"
        											alt="Loading" />
        									</div> <input id="mck-group-icon-upload"
        									class="mck-group-icon-upload n-vis" type="file" name="files[]">
        								</span>
        							</div>
        						</div>
        						<div id="mck-group-create-name-sec" class="mck-group-sub-sec">
        							<div id="mck-group-create-name-box"
        								class="mck-row mck-group-name-box">
        								<div class="blk-lg-12">
        									<div id="mck-gc-title-label" class="mck-label">Group
        										Title</div>
        								</div>
        								<div class="blk-lg-12">
        									<div id="mck-group-create-title"
        										class="mck-group-create-title mck-group-title"
        										contenteditable="true">Group title</div>
        								</div>
        							</div>
        						</div>
        						<div id="mck-group-create-type-sec" class="mck-group-sub-sec">
        							<div id="mck-group-create-type-box"
        								class="mck-row mck-group-type-box">
        								<div class="blk-lg-12">
        									<div id="mck-gc-type-label" class="mck-label">Group Type</div>
        								</div>
        								<div class="blk-lg-12">
        									<select id="mck-group-create-type" class="mck-select">
        										<option value="2" selected>Public</option>
        										<option value="1">Private</option>
        										<option value="6">Open</option>
        									</select>
        								</div>
        							</div>
        						</div>
        						<div id="mck-group-create-btn-sec" class="mck-group-sub-sec">
        							<button type="button" id="mck-btn-group-create"
        								class="mck-btn mck-btn-green mck-btn-group-create"
        								title="Create Group">Create Group</button>
        						</div>
        					</div>
        				</div>
        			</div>
        		</div>
        		<div id="mck-group-info-tab"
        			class="mck-group-info-tab mck-sidebox-content mck-box-content">
        			<div class="mck-box-top">
        				<div class="mck-tab-link blk-lg-4">
        					<a id="mck-group-back-link" href="#" role="link"
        						class="mck-group-back-link"> <span class="mck-icon-backward"></span>
        					</a>
        				</div>
        				<div class="blk-lg-8">
        					<div class="mck-box-title mck-truncate" title="Group Info">Group
        						Info</div>
        				</div>
        			</div>
        			<div id="mck-group-info-panel"
        				class="mck-tab-panel mck-group-info-panel">
        				<div class="mck-group-icon-sec">
        					<div id="mck-group-info-icon-box"
        						class="mck-group-icon-box mck-group-info-icon-box mck-hover-on">
        						<div class="mck-group-icon"></div>
        						<span class="mck-overlay-box n-vis">
        							<div class="mck-overlay">
        								<span class="mck-camera-icon"></span> <span
        									id="mck-gi-overlay-label" class="mck-overlay-label">Change
        									Group Icon</span>
        							</div>
        							<div id="mck-group-info-icon-loading" class="mck-loading vis">
        								<img src="applozic/css/app/images/mck-loading.gif"
        									alt="Loading" />
        							</div> <input id="mck-group-icon-change"
        							class="mck-group-icon-change n-vis" type="file" name="file[]" />
        						</span>
        					</div>
        					<div class="mck-text-center">
        						<a id="mck-btn-group-icon-save" href="#" role="link"
        							class="mck-btn-group-icon-save n-vis" title="Save">
        							<img src="applozic/css/app/images/mck-icon-save.png"
        							alt="Save">
        						</a>
        					</div>
        				</div>
        				<div id="mck-group-name-sec" class="mck-group-name-sec">
        					<div id="mck-group-name-box" class="mck-row mck-group-name-box">
        						<div class="blk-lg-9">
        							<div id="mck-group-title" class="mck-group-title"
        								contenteditable="false">Group title</div>
        						</div>
        						<div class="blk-lg-3 mck-group-name-edit-icon">
        							<a id="mck-group-name-edit" href="#" role="link"
        								class="mck-group-name-edit vis" title="Edit"> <img
        								src="applozic/css/app/images/mck-icon-write.png"
        								alt="Edit"></a> <a id="mck-group-name-save" href="#"
        								role="link" class="mck-group-name-save n-vis"
        								title="Save"> <img
        								src="applozic/css/app/images/mck-icon-save.png"
        								alt="Save"></a>
        						</div>
        					</div>
        				</div>
        			</div>
        			<div id="mck-group-member-panel"
        				class="mck-tab-panel mck-group-member-panel vis">
        				<div class="mck-group-md-sec">
        					<div id="mck-group-member-title"
        						class="mck-row mck-group-member-text">Members</div>
        					<div id="mck-group-add-member-box"
        						class="mck-row mck-group-admin-options mck-group-add-member-box n-vis">
        						<a id="mck-group-add-member" class="mck-group-add-member" href="#">
        							<div class="blk-lg-3">
        								<img
        									src="applozic/css/app/images/mck-icon-add-member.png"
        									alt="Add Member">
        							</div>
        							<div class="blk-lg-9">Add Member</div>
        						</a>
        					</div>
        				</div>
        			</div>
        			<div class="mck-box-body">
        				<div class="mck-tab-cell">
        					<div class="mck-group-member-inner">
        						<ul id="mck-group-member-list"
        							class="mck-group-member-list mck-contact-list mck-nav mck-nav-tabs mck-nav-stacked">
        						</ul>
        					</div>
        				</div>
        			</div>
        			<div id="mck-group-update-panel"
        				class="mck-tab-panel mck-group-update-panel n-vis">
        				<div class="mck-group-bottom-sec">
        					<div class="mck-row mck-group-update-sec">
        						<button type="button" id="mck-btn-group-update"
        							class="mck-btn mck-btn-green mck-btn-group-update" title="Update">Update</button>
        					</div>
        				</div>
        			</div>
        			<div id="mck-group-info-ft" class="mck-group-info-ft">
        				<button type="button" id="mck-btn-group-exit"
        					class="mck-btn mck-btn-blue mck-btn-group-exit" title="Exit Group">Exit
        					Group</button>
        			</div>
        		</div>
        	</div>
        </div>
        <div id="mck-loc-box" class="mck-box mck-loc-box fade"
        	aria-hidden="false">
        	<div class="mck-box-dialog mck-box-md">
        		<div class="mck-box-content">
        			<div class="mck-box-top mck-row">
        				<div class="blk-lg-10">
        					<h4 class="mck-box-title">Share Location</h4>
        				</div>
        				<div class="blk-lg-2">
        					<button type="button" class="mck-box-close" data-dismiss="mckbox"
        						aria-label="Close">
        						<span aria-hidden="true">&times;</span>
        					</button>
        				</div>
        			</div>
        			<div class="mck-box-body">
        				<div class="mck-form-group">
        					<div class="blk-lg-12">
        						<input id="mck-loc-address" type="text" class="mck-form-control"
        							placeholder="Enter a location" autocomplete="off">
        					</div>
        				</div>
        				<div id="mck-map-content" class="mck-loc-content"></div>
        				<div class="n-vis">
        					<label class="blk-sm-2 mck-control-label">Lat.:</label>
        					<div class="blk-sm-3">
        						<input type="text" id="mck-loc-lat" class="mck-form-control">
        					</div>
        					<label class="blk-sm-2 mck-control-label">Long.:</label>
        					<div class="blk-sm-3">
        						<input type="text" id="mck-loc-lon" class="mck-form-control">
        					</div>
        				</div>
        			</div>
        			<div class="mck-box-footer">
        				<button id="mck-my-loc" type="button"
        					class="mck-my-loc mck-btn mck-btn-green">My Location</button>
        				<button id="mck-loc-submit" type="button"
        					class="mck-btn mck-btn-blue mck-loc-submit move-right">Send</button>
        				<button id="mck-btn-close-loc-box" type="button"
        					class="mck-btn mck-btn-default move-right" data-dismiss="mckbox">Close</button>
        			</div>
        		</div>
        	</div>
        </div>
        <div id="mck-gm-search-box" class="mck-box mck-gm-search-box fade"
        	aria-hidden="false">
        	<div class="mck-box-dialog mck-box-sm">
        		<div class="mck-box-content">
        			<div class="mck-box-top mck-row">
        				<div class="blk-lg-3">
        					<img
        						src="applozic/css/app/images/mck-icon-add-member.png"
        						alt="Add Member">
        				</div>
        				<div class="blk-lg-7">
        					<h4 class="mck-box-title">Add Member</h4>
        				</div>
        				<div class="blk-lg-2">
        					<button type="button" class="mck-box-close" data-dismiss="mckbox"
        						aria-label="Close">
        						<span aria-hidden="true">&times;</span>
        					</button>
        				</div>
        			</div>
        			<div class="mck-box-body">
        				<div class="mck-form-group">
        					<div class="mck-input-group blk-lg-12">
        						<input id="mck-group-member-search" type="text"
        							data-provide="typeahead" placeholder="Search..." autofocus /> <span
        							class="mck-search-icon"><a href="#" role="link"
        							class="mck-group-member-search-link"><span
        								class="mck-icon-search"></span></a></span>
        					</div>
        				</div>
        				<div class="mck-tab-cell">
        					<div class="mck-message-inner">
        						<ul id="mck-group-member-search-list"
        							class=" mck-contact-list mck-group-member-search-list mck-nav mck-nav-tabs mck-nav-stacked"></ul>
        						<div id="mck-no-gsm-text"
        							class="mck-no-data-text mck-text-muted n-vis">No contacts
        							yet!</div>
        					</div>
        					<div id="mck-gms-loading" class="mck-loading n-vis">
        						<img src="applozic/css/app/images/ring.gif"
        							alt="Loading" />
        					</div>
        				</div>
        			</div>
        		</div>
        	</div>
        </div>
 ```
  
#### Step 4: Scripts
  
```  
      	<script type="text/javascript" src="applozic/js/mck-ui-plugins.min.js"></script>
      	<script type="text/javascript" src="applozic/js/mck-ui-widget.min.js"></script>
      	<script type="text/javascript" src="applozic/js/mck-emojis.min.js"></script>
      	<script type="text/javascript" src="applozic/js/mck-socket.min.js"></script>
      	<script type="text/javascript"
      		src="https://maps.google.com/maps/api/js?key=AIzaSyDKfWHzu9X7Z2hByeW4RRFJrD9SizOzZt4&libraries=places"></script>
      	<script type="text/javascript" src="applozic/js/locationpicker.jquery.min.js"></script>
      	<script type="text/javascript" src="applozic/js/app/mck-common-1.0.js"></script>
      	<script type="text/javascript" src="applozic/js/app/mck-sidebox-1.0.js"></script>
      	<script type="text/javascript">
      		var oModal = "";
      		if (typeof $original !== 'undefined') {
      			$ = $original;
      			jQuery = $original;
      			if (typeof $.fn.modal === 'function') {
      				oModal = $.fn.modal.noConflict();
      			}
      		} else {
      			$ = $applozic;
      			jQuery = $applozic;
      			if (typeof $applozic.fn.modal === 'function') {
      				oModal = $applozic.fn.modal.noConflict();
      			}
      		}
      	</script>

```

#### Step 5: User Login/Register

```
//Function to initialize chat plugin

    $applozic.fn.applozic({
          userId: 'USER_ID', // Replace USER_ID with the user's unique identifier
          userName: 'DISPLAY_NAME', // Replace DISPLAY_NAME with the user's name
          appId: 'APPLICATION_KEY',  // Replace APPLICATION_KEY with the Application key received after Signup from https://www.applozic.com/signup.html
	  ojq: $original,
	  maxAttachmentSize: 25, //max attachment size in MB
	  desktopNotification: true,
	  locShare: false,
	  googleApiKey: "AIzaSyDKfWHzu9X7Z2hByeW4RRFJrD9SizOzZt4",
	  onInit: function() {  
  		         $applozic.fn.applozic('loadTab', ''); 
  		         //Todo: Register your push notification here. registerPushNotifications();
	           }
	   });
```

#### Step 6: Push notification Setup

```
    var userPxy = {
		    'applicationId': 'APPLICATION_KEY', // Replace APPLICATION_KEY with the Application key received after Signup from https://www.applozic.com/signup.html
		    'userId': 'USER_ID', // Replace USER_ID with the user's unique identifier
		    'registrationId': 'GCM_REGISTRATION_ID', //Replace GCM_REGISTRATION_ID with GCM registration id
		    'pushNotificationFormat' : '1',
		    'deviceType': '1',       //1 for Android, 4 for iOS
		    'deviceApnsType' : '1', //1 for Distribution and 0 for Development APNS Certificate
		    'appVersionCode': '108' 
		  };
		
		$.ajax({
	      url: "https://apps.applozic.com/rest/ws/register/client",
				type: 'post',
				data: w.JSON.stringify(userPxy),
				contentType: 'application/json',
				headers: {'Application-Key': 'APPLICATION_KEY'}, // Replace APPLICATION_KEY with the Application key received after Signup from https://www.applozic.com/signup.html
				    success: function (result) {
				        //console.log(result);
				    }
		});
```

 
#### Step 7: Events subscription

Using events callback, you can subscribe to the following events.

```
var apzEvents =  {onConnect: function () {
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
                  }, onUserBlocked: function (obj) {
                       console.log('onUserBlocked: ' + obj);
                  }, onUserUnblocked: function (obj) {
                       console.log('onUserUnblocked: ' + obj);
                  }, onUserActivated: function () {
                       console.log('user activated by admin');
                  }, onUserDeactivated: function () {
                       console.log('user deactivated by admin');
                  }
                };
```

#### Events description:

1) onConnect: Triggered when user subscribed successfully. 


2) onConnectFailed: Triggered when user failed to subscribe. 


3) onMessageDelivered: Triggered when message is delivered. 

{'messageKey': 'delivered-message-key'} 


4) onMessageRead: Triggered when delivered message is read on other end. 

Response object - 

{'messageKey': 'delivered-message-key'}


5) onMessageReceived: Triggered when new message received. 

Response object - {'message': message} 


6) onMessageSentUpdate: Triggered when message sent successfully to server. 

Response object- {'messageKey': 'sent-message-key'} 


7) onUserConnect: Triggered when some other user comes online.

Response object - {'userID': 'connected-user-Id'} 


8) onUserDisconnect: Triggered when some other user goes offline. 

Response object - {'userId': 'disconnected-user-id', 'lastSeenAtTime' : 'time in millsec'}


9) onUserBlocked : Triggered when user is blocked or current user blocked other user from different source 

Response object - {'status': 'BLOCKED_TO or BLOCKED_BY', 'userId': userId}


10) onUserUnblocked : Triggered when user is unblocked or current user unblocked other user from different source 

Response object - {'status': 'UNBLOCKED_TO or UNBLOCKED_BY', 'userId': userId}


11) onUserActivated : Triggered when user is activated by app admin 


12) onUserDeactivated : Triggered when user is deactivated by app admin



#### Javascript to subscribe to events

```
 $applozic.fn.applozic('subscribeToEvents', apzEvents);  // object containing event definations 
 ``` 

 
 
###Documentation:
For advanced options and customization, visit [Applozic PhoneGap Chat & Messaging Plugin Documentation](https://www.applozic.com/docs/phonegap-chat-plugin.html?utm_source=github&utm_medium=readme&utm_campaign=phonegap)

 

##Demo page

Demo chat code: https://github.com/AppLozic/Applozic-PhoneGap-Chat-Plugin/blob/master/www/index.html


##Help

We provide support over at [StackOverflow] (http://stackoverflow.com/questions/tagged/applozic) when you tag using applozic, ask us anything.

Applozic is the best ios chat sdk for instant messaging, still not convinced? Write to us at github@applozic.com and we will be happy to schedule a demo for you.

###Free PhoneGap Chat Plugin
Special plans for startup and open source contributors, write to us at github@applozic.com 

##Github projects

Android Chat SDK https://github.com/AppLozic/Applozic-Android-SDK

Web Chat Plugin https://github.com/AppLozic/Applozic-Web-Plugin

iOS Chat SDK https://github.com/AppLozic/Applozic-iOS-SDK
