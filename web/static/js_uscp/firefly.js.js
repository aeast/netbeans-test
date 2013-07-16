// Analytics pulled.
// File taken from http://g22.dev.gmti.com/
// Sometimes we may not need the full "power" (?) of GEL so this allows a fake instance of GEL to exist. Some portions of the object below may not function correctly without GEL.
if(typeof GEL == 'undefined') GEL = {};
// Setup the firefly object.
if(typeof GEL.ody_firefly!='function'){
	if (!fireflyJQuery) {
		var fireflyJQuery = $.noConflict(true);
	}
	(function($){
	GEL.ody_firefly = function(options){
		var object = this;
		object.defaults = {
			cookieDomain: '',
			keepNclickOnLogin: false,
			limitOne: 2,
			limitTwo: 5,
			reg2payment: false,
			marketId: '',
			relatedMarketIDs: '',
			pagerestricted: 0, // If this is >0 the person has hit their limit and should be locked out by a don't miss modal
			sitecode: '',
			ssoCheck: 5, // Number of minutes between checking the anonymous user's global logged in status
			ssoSiteToken: '',
			ssoTimeout: 3,
			suppressInit: false, // If you are using firefly but not all of its modals you may want this set to "true"
			FBKey: '',
			apiUrl: '',
			apiUrlGlobal: '',
			urlAfterRegistration: ''
		};
		object.events = $({});
		object.initted=false;
		object.lastModal = {
			id: '',
			height: '',
			width: ''
		};
		object.persist = {};
		object.sso = false;
		object.topBarInitted = false;
		object.options = new Object;
		for(key in object.defaults){
			object.options[key] = (typeof options == 'undefined' || !options[key]) ? object.defaults[key] : options[key];
		}
		if(object.options.marketId == ''){
			object.options.marketId = object.options.sitecode;
		}
	}
	GEL.ody_firefly.prototype = {
		preInit: function(options){
			var object=this;
			if(typeof options == 'undefined') options={};
			object.initAtyponAPI();
			object.preInitFireflyTopBar();
			if(object.getParameterByName('screen')!='iconRedirect'){
				object.events.bind('topBarInitted', function(e, o) { o.topBarInitted = true; o.ssoBuildIframe(e, o); });
				object.initFireflyTopBar();
			}
			object.initLoginRegPages();
			object.initCountdownSlider();
			object.overrideReturnUrl();
		},
		init: function(options){
			var object = this;
			if(typeof options == 'undefined') options={};
			
			// Initialize Tracking - Would like this initialized earlier, but legacy crap interferes.
			if(typeof object.options.suppressInit == 'undefined' || !object.options.suppressInit){
				object.initTracking();
				$(document).trigger('firefly',['tracking.ready',{}]);
			}
			
			// an optional modal to show when we first init.  used in one place so far.
			if (object.onInitShowModal) {
				object.showModal(object.onInitShowModal);
				object.onInitShowModal = null;
			}

			// Show the Don't Miss modals
			if(object.options.pagerestricted>0){
				if(GEL.thepage.pageinfo.type=='Video'){
					$('.mainvideostage').empty();
				}

				$('#persistNotif').hide();

				// for the moment, always show dontmiss.  see COMO-431 for more info. -dcm
				if (object.options.pagerestricted == 1 || object.options.pagerestricted == 2)
					object.showModal('firefly-dontmiss');
				//else if (object.options.pagerestricted == 2)
				//	object.showModal('firefly-subscribers-only');
			}

			if(typeof object.options.suppressInit == 'undefined' || !object.options.suppressInit){
				// FB Init moved to ody_facebook_init
				
				object.setup(this.options); // Run setup unless it has been suppressed

				/* disabling autofill for now:  https://gannett.jira.com/browse/COMO-599
				try {
					FB.getLoginStatus(function(r){object.facebookInitialGetLoginResponse(r,object)});
				} catch (e) {}
				*/
			}
			object.initted=true;
		},
		setup: function(options){
			var object = this;
			if(typeof options == 'undefined') options={};
			
			if(typeof fireflyRefreshMils=='number'){
				$(document).ready(function(){
					setTimeout(object.refreshPage, fireflyRefreshMils);
				});
			}
			
			// Initialize webshims
			object.initWebshims();

			// Initialize Atypon API
			object.initAtyponAPI();
			
			// Initialize Newsletter API
			object.initNewsletterAPI();
			
			// Initialize gd-select and its fallback
			object.initGDSelect();
			
			// Store the current page.
			object.storeLastPage();
			
			// Setup link tracking on subscribe button in nav
			$('#comoNav ul li.subscribe a').click(function(e){
				var link = $(this);
				$(document).trigger('firefly',['goto.subscribe',{
					'location': 'nav-top',
					'link': link
				}]);
			});
			$('#persistSubscribe .subscribeLink').click(function(e){
				var link = $(this);
				$(document).trigger('firefly',['goto.subscribe',{
					'location': 'persistent-slider',
					'link': link
				}]);
			});
			$('#firefly-dontmiss .primary').click(function(e){
				var link = $(this);
				$(document).trigger('firefly',['goto.subscribe',{
					'location': 'dont-miss',
					'link': link
				}]);
			});
			
			// define these outside of the handler so that the RegExp only gets created once
			var domainPatternRegexp = /^[a-zA-Z0-9]+\\[^"\\\[\]:;|=,+*?<>]+$/;
			function emailDomainSwitcheroo(e) {
				var field = $(e.target);
				
				// if there's no @ sign and it looks like a domain account, treat it as text field
				if (field.val().indexOf('@') < 0 && domainPatternRegexp.test(field.val())) {
					if (field.attr('type') != 'text') {
						var form = field.closest('form');
						var textField = form.find('input[type=text][name=account]');
						field.prop('disabled', true);		// don't let the current field be changed any more, and make sure it won't get submitted with the form
						textField.off('change');			// make sure existing change handler is gone for now
						textField.val(field.val());			// copy input field text from old to new input
						textField.prop('disabled', false);	// make sure the new field isn't disabled any more
						field.closest('label').hide();		// hide the old field
						textField.closest('label').show();	// show the new field
						textField.change();					// cause validation check on new field
						textField.on('change', emailDomainSwitcheroo);			// add change handler to new field
						field.val('');						// clear out the old one
						form.find('.gnp.forgot').css('visibility', 'hidden');	// LDAP/domain accounts cannot reset passwords
						$('.firefly .bottom-buttons label input[type="checkbox"]').attr('checked', false);// LDAP/domain accounts cannot be allowed to have their accounts automatically logged in. The remember me check box should be unchecked.
						$('.firefly .bottom-buttons label input[type="checkbox"]').attr("disabled", true);	// LDAP/domain accounts cannot be allowed to have their accounts automatically logged in. The remember me check box should be disabled.

						
					}
				} else if (field.attr('type') != 'email') {
					var form = field.closest('form');
					var emailField = form.find('input[type=email][name=email]');
					field.prop('disabled', true);
					emailField.off('change');
					emailField.val(field.val());
					emailField.prop('disabled', false);
					field.closest('label').hide();
					emailField.closest('label').show();
					emailField.change();
					emailField.on('change', emailDomainSwitcheroo);
					field.val('');
					form.find('.gnp.forgot').css('visibility', 'visible');
					$('.firefly .bottom-buttons label input[type="checkbox"]').attr('checked', true);
					$('.firefly .bottom-buttons label input[type="checkbox"]').attr("disabled", false);

				}
			};
			$('#firefly-login :input[type=email]').on('change', emailDomainSwitcheroo);
			
			// Do stuff if this is the full-page login (Don't Miss + Login)
			var loginPage = $('#firefly-dontmiss-login');
			if (loginPage.length>0) {
				// display errors
				var status = object.getParameterByName('status'); // ignore for now, but if necessary do a lookup table
				var message = object.getParameterByName('message');
				if (message || (status && status != 0)) {
					var pageError = '';
					if (message) pageError = message;
					if (pageError) pageError += ' ';
					if (status && status != 0) pageError += '[Error ' + status + ']';
					
					loginPage.children('.message').html('<div class="message-body">' + pageError + '</div>').addClass(status == 0 ? 'success' : 'error').show();
				}
				
				// don't show the login form if they're already, you know, logged in
				if (object.atyponAPI.is('loggedIn')) {
					loginPage.addClass('logged-in');
				}
			}
			
			var subscriptionOptionsPage = $('#subscription-options-page-options');
			if (subscriptionOptionsPage) {
				if (object.getParameterByName('iconError')) {
					object.showModalMsg('subscription-options-page-options', object.atyponAPI.unexpectedError, false, 'error');
				}
			}
			
			var registrationPage = $('#firefly-register.page');
			if (registrationPage) {
				if (object.getParameterByName('redirectURL')) {
					registrationPage.find('a[href*="/como?screen=login"]').each(function(i, e) {
						e = $(e);
						e.attr('href', e.attr('href') + '&redirectURL=' + object.getParameterByName('redirectURL')/*.replace(/ /g, '+')*/);
					});
				}
			}
			
			// Enable the Special Offer FOD buttons.
			$('.fod-submit').each(function(i,e){
				// Get the counter.
				var counter = $(e).attr('id').split('-');
				counter = counter[1];

				// Update the href.
				var fodHREF;
				var param = {};
				if (object.atyponAPI.is('loggedIn') && object.atyponAPI.data.user && object.atyponAPI.data.user.email) {
					param.email = object.atyponAPI.data.user.email;
					param.firstName = object.atyponAPI.data.user.firstName;
					param.lastName = object.atyponAPI.data.user.lastName;
					param.zipCode = object.atyponAPI.data.user.zipCode;
					
					fodHREF = object.buildIconUrl($('#fod-'+counter+'-submit-href').val(), param);
				} else {
					fodHREF = '/section/como?screen=register&redirectURL=' + encodeURIComponent(object.buildIconUrl($('#fod-'+counter+'-submit-href').val(), param));
				}
				$(e).attr('href',object.buildIconUrl(fodHREF,param));
			});
			
			// this is almost generic enough to not be specific to the pubchooser, but not quite
			$('.firefly#subscription-options-page-newssource input[type=radio]').change(function(e) {	
				var input = $(e.target);

				if (input.prop('checked')) {
					input.closest('form').find('button[type=submit]').prop('disabled', false);
					$('input[name="' + input.attr('name') + '"]:not(:checked)').removeClass('form-ui-checked');
					$('input[name="' + input.attr('name') + '"]:not(:checked)').parent().find('.checkmark').hide();
					$('input[name="' + input.attr('name') + '"]:not(:checked)').parent().find('.button').show();
					input.parent().find('.checkmark').show();
					input.addClass('form-ui-checked');
				} else {
					input.removeClass('form-ui-checked');
					input.parent().find('.checkmark').show();
					$('input[name="' + input.attr('name') + '"]:not(:checked)').removeClass('form-ui-checked');
					$('input[name="' + input.attr('name') + '"]:not(:checked)').parent().find('.checkmark').hide();
					$('input[name="' + input.attr('name') + '"]:not(:checked)').parent().find('.button').show();
				}
			});
			// WebKit and IE won't remember that the submit button was enabled when loading from cache, so make sure the change handler gets called on load
			$('.firefly#subscription-options-page-newssource input[type=radio]').change();

			// Enable the full digital access get started button.
			if($('#options-digital-button').length>0&&$('#options-digital-button-href').length>0){
				var iconURL = $('#options-digital-button-href').val();
				var iconParams={
					// This is the digital only info.
					type: 'digital',
					primaryPub: $('#fod-digital-primaryPub').val(),
					rateCode: $('#fod-digital-rateCode').val(),
					webAccessPubId: $('#fod-digital-webAccessPubId').val()
				};
				
				var digitalHREF;
				
				if (object.atyponAPI.is('loggedIn')) {
					if(object.atyponAPI.data.user && object.atyponAPI.data.user.email){
						iconParams.email = object.atyponAPI.data.user.email;
						iconParams.firstName = object.atyponAPI.data.user.firstName;
						iconParams.lastName = object.atyponAPI.data.user.lastName;
						iconParams.zipCode = object.atyponAPI.data.user.zipCode;
						digitalHREF = object.buildIconUrl(iconURL, iconParams);
						$('#options-digital-button').attr('href', digitalHREF).removeClass('disabled');
					}else{
						object.atyponAPI.getUser({
							params:{'sessionKey': object.atyponAPI.getSessionKey()},
							success:function(message,user){
								iconParams.email = user.email;
								iconParams.firstName = user.firstName;
								iconParams.lastName = user.lastName;
								iconParams.zipCode = user.zipCode;
								digitalHREF = object.buildIconUrl(iconURL, iconParams);
								$('#options-digital-button').attr('href', digitalHREF).removeClass('disabled');
							},
							failure:function(message,user){
								digitalHREF = '/section/como?screen=register&redirectURL=' + encodeURIComponent(object.buildIconUrl(iconURL, iconParams));
								$('#options-digital-button').attr('href', digitalHREF).removeClass('disabled');
							}
						});
					}
				} else {
					digitalHREF = '/section/como?screen=register&redirectURL=' + encodeURIComponent(object.buildIconUrl(iconURL, iconParams));
				}
				
				$('#options-digital-button').attr('href', digitalHREF);
				$('#options-digital-button').removeClass('disabled');
			}

			// generic non-slide modal close (X)
			$('.firefly.modal button.close, .firefly.modal button.cancel, .firefly.modal button.continue').click(function(e) {
				var close = $(e.target);
				var modal = close.closest('.firefly.modal');
				
				// Reset blue subscribe button on login modal.
				if(modal.attr('id')=='firefly-login'){
					$('#firefly-login .current-subscriber-link').show();
					object.apiLoginFailurePasswordResetToggle('forgot');
				}
				
				// reset any forms
				modal.find('form').each(function(i, e) { e.reset(); });

				// actually close the modal
				object.closeModal(modal.attr('id'));
				
				return false;
			});
			
			// this block of code is for the chat application links
			var chatHelp = $('#chatLinkImgHelp');
			var animateLeft = Math.round($(document).width()/2-(chatHelp.width()/2+$('div.nav').width()/2+chatHelp.width()/2+20));
			chatHelp.appendTo('body');
			chatHelp.css({'left': chatHelp.width()*(-1),'position':'absolute','top':'200px','display': 'none'});
			setTimeout(function(){chatHelp.fadeIn().animate({'left': animateLeft+'px'});}, 4000);
			
			Date.prototype.stdTimezoneOffset = function(){ // return two months of comparable standard times for dst checks
				var jan = new Date(this.getFullYear(), 0, 1);
				var jul = new Date(this.getFullYear(), 6, 1);
				return Math.max(jan.getTimezoneOffset(), 
					   jul.getTimezoneOffset());
			}
			Date.prototype.dst = function(){
				return this.getTimezoneOffset() < this.stdTimezoneOffset(); //return boolean for if daylight savings time
			}
			Date.adjusted = function(integer){ // for testing, add a integer as a parameter to adjust the time for chaning timezones
				var now=new Date(),
					hour = (integer != null) ? now.getHours()+integer : now.getHours(),
					hour_orig = hour, // for testing only
					real_time = now.getHours(), // for testing only
					eastern_offset = 0,
					current_offset = 0,
					diff = 0,
					adj_h = 0;
				if(now.dst()){
					eastern_offset = -4; // Eastern time offset when using dst
				}else{
					eastern_offset = -5; // Eastern time offset when not dst
				}
				if(hour-now.getUTCHours() > 0){
					current_offset = hour-24-now.getUTCHours();
					if(current_offset < -12){
						current_offset += 24;
					}
				}else{
					current_offset = hour-now.getUTCHours(); 
				}
				if(current_offset != eastern_offset){
					if(current_offset < eastern_offset){
						diff = eastern_offset+Math.abs(current_offset);
					}else{
						diff = Math.abs(eastern_offset)+current_offset;
					}
				}
				if(current_offset >= eastern_offset){
					hour-=diff;
				}else{
					hour+=diff;
				}
				adj_h = (hour>23) ? hour-24 : hour;
				adj_h = (hour<0) ? hour+24 : hour;
				
				// testing
				console.log('eastern gmt: '+ eastern_offset+' vs current gmt: '+ current_offset);
				console.log('difference in time: '+diff);
				console.log('current hour: '+hour_orig+' vs adjusted hour: '+ adj_h);
				console.log('your actual time: '+real_time);
				
				return adj_h;
			}
			
			var adjusted_hour = Date.adjusted(6);
			
			if((adjusted_hour>=GEL.thepage.pageinfo.chatApp.starttime)&&(adjusted_hour<=GEL.thepage.pageinfo.chatApp.endtime)){  // add variables for these times
				$('.bizHoursYN').show();
			}else{
				$('.bizHoursYN').hide();
			}
			// add a dummy URL to chat links
			$('a.chatLink').attr('href', GEL.thepage.pageinfo.chatApp.url);
			$('a.chatLink').attr('target', 'chat'+GEL.thepage.pageinfo.chatApp.pubid);
			// prepare a link to open the chat app window
			$('.chatLink').click(function(e){
				e.preventDefault();
				var chatURL = GEL.thepage.pageinfo.chatApp.url+'?PublicationHostname='+
					encodeURIComponent(GEL.thepage.pageinfo.url.hostname)+'&PublicationId='+
					encodeURIComponent(GEL.thepage.pageinfo.chatApp.pubid)+'&PublicationName='+
					encodeURIComponent(GEL.thepage.pageinfo.chatApp.pubname);
				window.open(chatURL, 'chat'+GEL.thepage.pageinfo.chatApp.pubid,'width=500,height=500');
			});
			$('.closeChatHelp').click(function(){
				$('#chatLinkImgHelp').remove();
				return false;  // stop event propogation
			});
			
			// reset account lookup form
			$('#firefly-account-lookup-form').bind('reset', function(e) { object.lookupAccountReset(e, object); });
			// reset account lookup form top modal
			$('#firefly-account-lookup-form-top').bind('reset', function(e) { object.lookupAccountReset(e, object); });
			
			// reset the password retrieval modal.
			$('#firefly-password-reset-form').bind('reset', function(e) { object.passwordResetReset(e, object); });
			
			// enable help buttons
			$('.firefly.modal button.help').click(function() { object.showModal('firefly-help'); });
			
			// enable resetting of validation on every form
			$('.firefly form').bind('reset', function(e){ setTimeout(function(){ object.validationFormReset(e); }, 1); });
			
			// Enable close and continue buttons for Thank You Modals
			$('#firefly-thank-you button.continue').click(function(){
				$('#persistNotif').hide();
				GEL.thepage.pageinfo.firefly.modal.hideModal();
			});
			$('#firefly-thank-you button.close').click(function(){
				$('#persistNotif').hide();
			});
			// Set up return functions for password reset success.
			$('#firefly-password-reset-success button.primary').click(function(){
				object.closeModal('firefly-login');
				// Show children and hide success.
				var success=$('#firefly-password-reset-success');
				$(this).closest('.firefly-modal-slide').children().show();
				success.hide();
			});
			$('#firefly-password-reset-success button.close').click(function(){
				object.closeModal('firefly-login');
				// Show children and hide success.
				var success=$('#firefly-password-reset-success');
				$(this).closest('.firefly-modal-slide').children().show();
				success.hide();
			});
			$('#firefly-new-password-div form').submit(function(e){
				/**
				 * Build and show error messages from a failed password reset.
				 */
				function failedPWchange(msg, object){
					if(typeof object == 'undefined') var object = this;
					var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
					// now see if we can be more specific than the Unexpected Error
					switch (msg.code) {
						case 110:	// Required parameter not provided
							userMsg = 'You must enter a new password.';
							break;
						case 120: // Invalid or missing reset password token.
						case 140:
							userMsg = 'Invalid token. Please use the link from the temporary password to change your password.';
							break;
						case 310:	// Invalid password
							userMsg = 'Invalid password.  It must be different from your old password and needs to be 5-30 characters, no spaces.  Letters and numbers only.';
							break;
						case 330:	// Old password does not match
							userMsg = 'Incorrect <label for="firefly-old-password" class="a-link">Old Password</label>.';
							break;
						// These are all very bad cases.  Listing explicitly the ones we know are awful before the default case for clarity.
						case 210:	// eRightsException
						case 200:	// RemoteException
						default: 	// if we didn't match anything, something bad is going on
							break;
					}
					object.loadingModal.hide();
					object.showModalMsg('firefly-new-password-form', userMsg, false, 'error');
				}

				var form = $(e.target);
				var modal = form.closest('.firefly.modal');

				object.loadingModal.show(modal, ''); // TODO: come up with a message
			
				var email = form.find(':input[name=email]').val();
				var resetToken = object.getParameterByName('resetToken');
				var passwordField1 = $('#firefly-new-password').val();
				var passwordField2 = $('#firefly-new-password-confirm').val();
				var flow = form.find(':input[name=flow]').val();
				if (flow == 'temporary') {
					object.atyponAPI.changeUserPassword({
						'params': {
							'email': email,
							'newPassword': passwordField1,
							'resetToken': resetToken
						},
						'success': function(msg){
							// The password has been changed and the resetPassword flag is false. Log the user in.
							var redirectUrl='http://'+GEL.thepage.pageinfo.url.hostname+'/apps/pbcs.dll/frontpage';
							object.atyponAPI.login({
								'params': {
									'username': email,
									'password': passwordField1,
									'marketId': object.getMarketId()
								},
								'success': function(msg, user, data) { object.apiLoginSuccessful(msg, user, data, redirectUrl, object); },
								'failure': function(msg, data) { object.apiLoginFailure(msg, data, object); },
								'redirect': redirectUrl
							});		
						},
						'failure': function(msg){ 
							failedPWchange(msg, object); 
						}
					});
				} else{
					if(resetToken&&passwordField1==passwordField2&&passwordField1!=''&&passwordField2!=''){
						object.atyponAPI.changePassword({
							'params': {
								'resetToken': resetToken,
								'newPassword': passwordField1,
								'authenticateUserInd': true
							},
							'success': function(msg){ 
							}, // TODO: delay redirect so this can fire more consistently
							'failure': function(msg){ 
								failedPWchange(msg, object); 
							}
						});
					}
				}
				return false;
			});
			$('#firefly-temporary-password form').submit(function(e) {
				// Get form values.
				var form = $(e.target);
				var email=form.find(':input[name=email]').val();
				var passwordTemp=form.find(':input[name=password-temp]').val();
				// Attempt to log the user in.
				object.atyponAPI.login({
					'params': {
						'username': email,
						'password': passwordTemp,
						'marketId': object.getMarketId()
					},
					'success': function(msg, user, data) {
						object.apiLoginSuccessful(msg, user, data, 'http://'+GEL.thepage.pageinfo.url.hostname+'/apps/pbcs.dll/frontpage', object);
					},
					'failure': function(msg, data) {
						// Capture the 303 reset password required error and forward user to the reset page.
						if (data.meta.status == 303) {
							window.location.href='http://'+GEL.thepage.pageinfo.url.hostname+'/section/como?screen=password_reset_temporary&email='+email+'&resetToken='+data.response.resetToken;
						} else {
							object.apiLoginFailure(msg, data, object, 'firefly-temporary-password');
						}
					}
				});
				return false;
			});
			$('#firefly-register form').submit(function(e) {
				var form = $(e.target);
				var modal = form.closest('.firefly');

				// Form values
				var firstName=form.find(':input[name=first_name]').val();
				var lastName=form.find(':input[name=last_name]').val();
				var gender=form.find(':input[name=gender]').val();
				var birthYear=form.find(':input[name=birth_year]').val();
				var zipCode=form.find(':input[name=zip_code]').val();
				var email=form.find(':input[name=email]').val();
				var password=form.find(':input[name=password]').val();
				var socialId=form.find(':input[name=socialId]').val();
				var socialToken=form.find(':input[name=socialToken]').val();
				var keepSignedIn=form.find(':input[name=keep_signed_in]').is(':checked');
				var claimCode=form.find(':input[name=claimCode]').val();
				var acceptedEmail = (email != form.find(':input[name=claimEmail]').val()) ? email : '';
				//[JZ:COMO-1325] Unsure about this
				var promoCode=form.find(':input[name=promoCode]').val();
				var daysFree=form.find(':input[name=daysFree]').val();
				// Hidden inputs used for links
				var linkAccount_unitNumber = form.find(':input[type=hidden][name=linkAccount_unitNumber]').val();
				var linkAccount_publicationCode = form.find(':input[type=hidden][name=linkAccount_publicationCode]').val();
				var linkAccount_accountNumber = form.find(':input[type=hidden][name=linkAccount_accountNumber]').val();

				var redirectUrl = "";
				if(object.atyponAPI.cors==false){
					if($('.firefly.page').length > 0){
						window.location.href='/section/como?screen=flashRequired';
					}else{
						object.showModal('firefly-flash-required');
					}
					return false;
				}
				var params = {
					'firstName': firstName,
					'lastName': lastName,
					'gender': gender,
					'birthYear': birthYear,
					'zipCode': zipCode,
					'email': email,
					'isAutoLogin': keepSignedIn,
					'authenticateUserInd': true,
					'marketId': object.getMarketId()
				};
				// handle authentication credentials
				if (socialId) {
					params.socialId = socialId;
					params.socialToken = socialToken; // currently not being used by loginFromSocial but needed for linkSuccess
					params.credentialType = 'Facebook';
				} else {
					params.password = password;
				}
				
				//[JZ:COMO-1325]I believe it needs to be passed as a param and not its own part of the object.
				if(promoCode){
					params.promoCode = promoCode;
				}
				
				// after successful login send the user here
				if (claimCode != "" && claimCode != undefined){
					redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=shared-access' + '&email=' + email;
				}else if(promoCode !== '' && typeof promoCode !== 'undefined'){
					//[JZ:COMO-1325]There needs to be another value regarding the promotion length I think.
					redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=promotion' + '&daysFree=' + daysFree;
				}else{
					if (form.find(':input[name=registerBonus]').val() == '1') {
						redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=registrationBonus';
					} else {
						if($('.firefly.page').length > 0){
							var redirectUrlParam = object.getParameterByName('redirectUrl');
							redirectUrl = (redirectUrlParam != null) ? redirectUrlParam : 'http://'+GEL.thepage.pageinfo.url.hostname+'/';
						}else{
							redirectUrl = object.registrationRedirectUrl(email, claimCode, modal.attr('id'), object, zipCode, firstName, lastName);
						}
					}
				}
				object.loadingModal.show(modal, 'Processing Registration');
				//User isn't in UA but has Home Delivery
				if(linkAccount_unitNumber && linkAccount_publicationCode && linkAccount_accountNumber){
					 // don't log them in until after the accounts are linked
					params.authenticateUserInd = false;
					// Change redirectUrl to send the licensed user to their last article.
					if (claimCode != "" && claimCode != undefined){
						redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=shared-access' + '&email=' + email;
					}else{
						redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=linked-access' + '&email=' + email;
					}
					object.atyponAPI.createUser({
						'params': params,
						'success': function(msg, user, data) {apiLinkAccounts(object, params, linkAccount_unitNumber, linkAccount_publicationCode, linkAccount_accountNumber, redirectUrl);},
						'failure': function(msg) {apiRegFailure(msg, params, modal, redirectUrl, object);},
						'claimCode': claimCode,
						'acceptedEmail': acceptedEmail
					});
				}else{//Generic Registration Path
					object.atyponAPI.createUser({
						'params': params,
						'success': function(msg, data) {apiRegSuccess(msg, data, redirectUrl, object);},
						'redirect': object.atyponAPI.unprotectUrl(redirectUrl),
						'failure': function(msg) {apiRegFailure(msg, params, modal, redirectUrl, object);},
						'claimCode': claimCode,
						'acceptedEmail': acceptedEmail
					});
				}

				function apiRegSuccess(msg, data, redirectUrl, object){
					if (!redirectUrl) {  // don't bother doing anything as long as a redirect is going to happen anyway.
					if(typeof object == 'undefined') var object = this;

					object.loadingModal.hide();
					object.showModalMsg('firefly-register', 'Your registration was successfully processed', false, 'success');
					}
				}
				
				function apiRegFailure(msg, params, modal, redirectUrl, object){
					if(typeof object == 'undefined') var object = this;
					
					var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
					
					// now see if we can be more specific than the Unexpected Error
					switch (msg.code) {
						
						case 110:	// Required parameter not provided
							userMsg = 'All fields are required.';
//							console.log(msg);
							break;
						
						case 310:	// Invalid password
							userMsg = 'Invalid password.  It needs to be 5-30 characters, no spaces.  Letters and numbers only.';
//							console.log(msg);
							break;
						
						case 500:	// Email already exists
						case 530:	// Email already exists in UserAuth
							// Check for claim code and pass to login page.
							var href='#firefly-login-register';
							if ($('.firefly.page').length > 0) {
								var registerForm=$('#firefly-register form');
								var claimCode=registerForm.find(':input[name=claimCode]').val();
								var promoCode=registerForm.find(':input[name=promoCode]').val();
								var email=registerForm.find(':input[name=email]').val();
								href='/section/como?screen=login';
								if (claimCode != '' && claimCode != undefined) {
									var claimEmail=registerForm.find(':input[name=claimEmail]').val();
									var acceptedEmail=registerForm.find(':input[name=email]').val();
									href+='&email='+acceptedEmail+'&claimCode='+claimCode+'&claimEmail='+claimEmail;
								} else if (promoCode !== '' && typeof promoCode !== 'undefined'){
									var acceptedEmail=registerForm.find(':input[name=email]').val();
									var daysFree=registerForm.find(':input[daysFree]').val();
									href+='&email='+acceptedEmail+'&promoCode='+promoCode;
									if(daysFree!==''&&daysFree!==null && daysFree !== 'undefined' && typeof daysFree !== 'undefined'){
										href+='&daysFree'+daysFree;
									}
								} else if (email) { // pre-populate email address if not already done by the above 2 cases
									href+='&email='+email;
								}
								
							var linkAccount_unitNumber = $(':input[type=hidden][name=linkAccount_unitNumber]').val();
							var linkAccount_publicationCode = $(':input[type=hidden][name=linkAccount_publicationCode]').val();
							var linkAccount_accountNumber = $(':input[type=hidden][name=linkAccount_accountNumber]').val();
							if (linkAccount_unitNumber && linkAccount_publicationCode && linkAccount_accountNumber)
								href += '&linkAccount_unitNumber='+linkAccount_unitNumber + '&linkAccount_publicationCode='+linkAccount_publicationCode + '&linkAccount_accountNumber='+linkAccount_accountNumber;
							
							}
							userMsg = 'Email address already registered.  Please <a class="return-to-login" href="'+href+'">log in</a> to continue or choose a new email address.';
//							console.log(msg);
							break;
						
						case 540:	// Facebook already associated with account
							// this case should never happen because of other functionality, but I implemented this and tested for COMO-610 before realizing it could be done better
							userMsg = 'Your Facebook account is already associated with an account.  Please log in to continue, or proceed with non-Facebook registration.';

							// go ahead and log them in with Facebook
							object.loadingModal.show(modal, 'Logging in with Facebook');
							object.atyponAPI.loginFromSocial({
								'params': {
									'socialProvider': params.credentialType,
									'socialId': params.socialId,
									'socialToken': params.socialToken,
									'marketId': params.marketId
								},
								'success': function(a, b, c) { object.apiLoginSuccessful(a, b, c, redirectUrl, object); },
								'failure': function(msg) {
									// if this gives any error at all, we've got an issue
									var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
									
									object.loadingModal.hide();
									object.showModalMsg('firefly-register', userMsg, false, 'error');
								},
								// When running from a modal, send back to the current page. Otherwise, send to the front page.
								'redirect': redirectUrl
							});
							return;
//							console.log(msg);
							break;

						case 550:	// Age is younger than 14
							userMsg = "We're sorry. We cannot accept your registration at this time. Please review our <a href=\"/terms\">terms of service</a>.";
							break;
							
						// TODO: I don't know how to handle these right now, so default to the unknown case:
						case 510:	// Username already exists
						case 520:	// Screenname already exists
						// These are all very bad cases.  Listing explicitly the ones we know are awful before the default case for clarity.
						case 320: 	// Accounts were merged. [This shouldn't happen here because it should follow the success route instead, so if it makes it here something is very wrong.]
						case 210:	// eRightsException
						case 200:	// RemoteException
						default: 	// if we didn't match anything, something bad is going on
							// console.warn(msg);
							break;
					}

					object.loadingModal.hide();
					object.showModalMsg('firefly-register', userMsg, false, 'error');
				}
				
				function apiLinkAccounts(object, createUserParams, linkAccount_unitNumber, linkAccount_publicationCode, linkAccount_accountNumber, redirectUrl){
					if(typeof object == 'undefined') var object = this;
					object.atyponAPI.linkAccount({
						'params': {
							'email': createUserParams.email,
							'unitNumber': linkAccount_unitNumber,
							'publicationCode': linkAccount_publicationCode,
							'accountNumber': linkAccount_accountNumber
						},
						'success': function(msg,response) {linkSuccess(msg, response, object, createUserParams, redirectUrl);},
						'failure': function(msg) {linkFailure(msg, object);}
					});
				}
				function linkSuccess(msg, response, object, createUserParams, redirectUrl){
					if (response.response.linkResponses.length > 0 ){
						redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=linked-access&firstName=' + createUserParams.firstName + '&email=' + createUserParams.email;
						if (createUserParams.credentialType == "Facebook") {
							object.atyponAPI.loginFromSocial({
								'params': {
									'socialId': createUserParams.socialId,
									'socialProvider': createUserParams.credentialType,
									'socialToken': createUserParams.socialToken,
									'marketId': object.getMarketId()
								},
								'success': function() { linkLoginSuccess(object); },
								'failure': function(msg) { object.apiLoginFailureFB(msg, object, params, 'firefly-register'); },
								// When running from a modal, send back to the current page. Otherwise, send to the front page.
								'redirect': redirectUrl,
								'sendWelcome': true
							});			
						} else {
							object.atyponAPI.login({
								'params': {
									'username': createUserParams.email,
									'password': createUserParams.password,
									'marketId': object.getMarketId()
								},
								'success': function(msg, user, data) { linkLoginSuccess(object); },
								'failure': function(msg, data) { object.apiLoginFailure(msg, data, object, 'firefly-register'); },
								'redirect': redirectUrl,
								'sendWelcome': true
							});
						}
					}else{
						msg.code = 720;
						msg.message = "Could not link account. Please call customer service for assistance.";//"License for linked account belongs to locked user";
						linkFailure(msg, object);
					}
				}
				function linkLoginSuccess(object){
					// Do nothing else because there's going to be a redirect.
					//object.loadingModal.hide();
					//object.showModal('firefly-thank-you');
				}
				function linkFailure(msg, object){
					if(typeof object == 'undefined') var object = this;
					
					var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
					
					// now see if we can be more specific than the Unexpected Error
					switch (msg.code) {
						// These are all very bad cases.  Listing explicitly the ones we know are awful before the default case for clarity.
						case 720:	// License for linked account belongs to locked user
							userMsg = "Could not link account. Please call customer service for assistance.";
							break;
						case 721:	// License can't be linked for some reason - have to check the array of returned info
							userMsg = "Could not link one or more accounts. Please call customer service for assistance.";
							break;
						case 710:	// Product not found
						case 730:	// Subscription not active
						case 110:	// Required parameter not provided [all params are provided programatically, so there's a big issue]
						case 220:	// ObjectNotFoundException [Basically "user not found"]
						case 320: 	// Accounts were merged. [This shouldn't happen here because it should follow the success route instead, so if it makes it here something is very wrong.]
						case 210:	// eRightsException
						case 200:	// RemoteException
						default: 	// if we didn't match anything, something bad is going on
							// console.warn(msg);
							break;
					}

					object.loadingModal.hide();
					object.showModalMsg('firefly-register', userMsg, false, 'error');
				}
				
				return false;
			}).bind('reset', function(e) {object.registerFormReset(e, object);});
			
			$('#firefly-login form').submit(function(e) {
				var form = $(e.target);
				var modal = form.closest('.firefly');
				var email = form.find(':input[name=email]').val() || form.find(':input[name=account]').val();
				object.loadingModal.show(modal, 'Processing your login.');
				var claimCode = form.find(':input[name=claimCode]').val();
				var acceptedEmail = (email != form.find(':input[name=claimEmail]').val()) ? email : '';
				var promoCode = form.find(':input[name=promoCode]').val();
				if(object.atyponAPI.cors==false){
					if($('.firefly.page').length > 0){
						window.location.href='/section/como?screen=flashRequired';
					}else{
						object.showModal('firefly-flash-required');
					}
					return false;
				}
				
				var linkAccount_unitNumber = $(':input[type=hidden][name=linkAccount_unitNumber]').val();
				var linkAccount_publicationCode = $(':input[type=hidden][name=linkAccount_publicationCode]').val();
				var linkAccount_accountNumber = $(':input[type=hidden][name=linkAccount_accountNumber]').val();

				// Build the redirect URL, making sure to excise pagerestriction when present.
				if (claimCode != "" && claimCode != undefined){
					redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=shared-access' + '&email=' + email;
				} else if (promoCode!= "" && promoCode != undefined){
					redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=promotion&email=' + email;
				} else if (linkAccount_unitNumber && linkAccount_publicationCode && linkAccount_accountNumber) {
					redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=linked-access&email=' + email;
				} else {
					var redirectUrl = form.find(':input[name=redirectURL]').val() || window.location.href.replace(window.location.hash, ''); // strip off fragment IDs (which could be #firefly-login, etc)
					if(typeof GEL.thepage.pageinfo.firefly.modal=='undefined'){
						redirectUrl='http://'+GEL.thepage.pageinfo.url.hostname+'/apps/pbcs.dll/frontpage';
					}else if(object.getParameterByName('pagerestricted')!=null){
						// Remove pagerestricted.
						redirectUrl=object.removeParameter(redirectUrl,'pagerestricted');
					}
					redirectUrl = object.atyponAPI.unprotectUrl(redirectUrl);
				}

				object.atyponAPI.login({
					'params': {
						'username': email,
						'password': form.find(':input[name=password]').val(),
						'marketId': object.getMarketId()
					},
					'isAutoLogin': form.find(':input[name=keep_signed_in]').is(':checked'), // perhaps this can be moved to the login() method and therefore the above 'params' object?
					'success': function(msg, user, data) { object.apiLoginSuccessful(msg, user, data, redirectUrl, object); },
					'failure': function(msg, data) { object.apiLoginFailure(msg, data, object); },
					'redirect': redirectUrl,
					'claimCode': claimCode,
					'acceptedEmail': acceptedEmail,
					'linkAccount_unitNumber': linkAccount_unitNumber,
					'linkAccount_publicationCode': linkAccount_publicationCode,
					'linkAccount_accountNumber': linkAccount_accountNumber,
					'promoCode': promoCode
				});
				return false;
			});
			// This is the login form called from the registration modal.
			$('#firefly-login-register form').submit(function(e) {
				var form = $(e.target);
				var modal = form.closest('.firefly');
				var claimCode = form.find(':input[name=claimCode]').val();
				var promoCode = form.find(':input[name=promoCode]').val();
				object.loadingModal.show(modal, 'Processing your login.');
				if(object.atyponAPI.cors==false){
					if($('.firefly.page').length > 0){
						window.location.href='/section/como?screen=flashRequired';
					}else{
						object.showModal('firefly-flash-required');
					}
					return false;
				}
				// Build the redirect URL, making sure to excise pagerestriction when present.
				var email=form.find(':input[name=email]').val();
				var firstName=form.find(':input[name=first_name]').val();
				var lastName=form.find(':input[name=last_name]').val();
				var zipCode=form.find(':input[name=zip_code]').val();
				var redirectUrl;

				//var redirectUrl = object.options.urlAfterRegistration;
				if(form.find(':input[name=redirectURL]').val()) {
					redirectUrl = form.find(':input[name=redirectURL]').val();
				if ((/^http(|s)%3A%2F%2F/).test(redirectUrl)) // Detect if the url looks encoded.
						redirectUrl = decodeURIComponent(redirectUrl);
					redirectUrl = object.buildIconUrl(redirectUrl,{email: email});
				} else if($('#fod-primaryPub').length>0){
					// Print.
					redirectUrl=object.buildIconUrl($.data(document.body,'iconBaseHref'),{
						email: email,
						firstName: firstName, 
						lastName: lastName, 
						zipCode: zipCode, 
						primaryPub: $('#fod-primaryPub').val(),
						secondaryPub: $('#fod-secondaryPub').val(),
						rateCode: $('#fod-rateCode').val()
					});
				}else if($('#fod-digital-primaryPub').length>0&&$('#fod-digital-rateCode').length>0){
					// Digital.
					redirectUrl=object.buildIconUrl($.data(document.body,'iconBaseHref'),{
						type: 'digital',
						email: email,
						firstName: firstName, 
						lastName: lastName,
						zipCode: zipCode,
						primaryPub: $('#fod-digital-primaryPub').val(),
						webAccessPubId: $('#fod-digital-webAccessPubId').val(),
						rateCode: $('#fod-digital-rateCode').val()
					});
				}else{
					/* If we're here, the user has gotten here from account lookup.
					Example Flow: Slider -> Account Lookup -> Register -> Login
					Forward to link accounts.
					*/
					redirectUrl=GEL.firefly.options.apiUrl + '/account/#linkAccounts';
				}
				if (claimCode != "" && claimCode != undefined){
					redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=shared-access' + '&email=' + email;
				} else if (promoCode!= "" && promoCode != undefined){
					redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=promotion&email=' + email;
				} else{
					redirectUrl = object.atyponAPI.unprotectUrl(redirectUrl);
				}
				object.atyponAPI.login({
					'params': {
						'username': email,
						'password': form.find(':input[name=password]').val(),
						'marketId': object.getMarketId()
					},
					'isAutoLogin': form.find(':input[name=keep_signed_in]').is(':checked'), // perhaps this can be moved to the login() method and therefore the above 'params' object?
					'success': function(msg, user, data) { object.apiLoginSuccessful(msg, user, data, redirectUrl, object); },
					'failure': function(msg, data) { object.apiLoginFailure(msg, data, object, 'firefly-login-register'); },
					'redirect': redirectUrl,
					'claimCode': claimCode,
					'promoCode': promoCode
				});		
				return false;
			});

			// Form to check the promo code.
			$('.promoFormBox form').submit(function(e){
				var form = $(e.target);
				var modal = form.closest('.firefly');
				var promoCode = form.find(':input[name=promoCode]').val();
				object.atyponAPI.validateClaimTicket({
					'params': {
						'claimCode': promoCode
					},
					'success': function(msg, data) {
						// Get the promo code.
						object.atyponAPI.getClaimTicket({
							'params': {
								'claimCode': promoCode
							},
							'success': function(msg, promo, data) {
								if (object.atyponAPI.is('loggedIn')) {
									// Apply promo to logged in user.
									object.atyponAPI.redeemPromoCode({
										'params': {
											'claimCode': promoCode,
											'userId': object.atyponAPI.data.user.userId
										},
										'success': function(msg, data) {
											object.promoCodeSuccess(promo, object.atyponAPI.data.user, object);
										},
										'failure': function(msg) {
											object.promoCodeFailure(msg, object, 'promoForm');
										}
									});
								} else {
									// Send user to registration page with promoCode and daysFree.
									window.location.href = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/como?screen=register&promoCode=' + promoCode + '&daysFree=' + promo.daysFree;
								}
							},
							'failure': function(msg) {
								object.promoCodeFailure(msg, object, 'promoForm');
							}
						});
					},
					'failure': function(msg) {
						object.promoCodeFailure(msg, object, 'promoForm');
					}
				});
				return false;
			});

			// Used for Account Retrieval
			function getAccounts(zipCode, phoneNumber, modalID){
				// Show loading modal.
				var modal = $('#' + modalID);
				object.loadingModal.show(modal, 'Retrieving account information');

				// Look up the information.
				object.atyponAPI.lookupAccount({
					'params': {
						'zip': zipCode,
						'phoneNumber': phoneNumber
					},
					'success': function(msg, accounts) { apiSuccess(msg, accounts, modalID, zipCode, phoneNumber, object); },
					'failure': function(msg, accounts) { apiLookupFailure(msg, accounts, modalID, zipCode, phoneNumber, object); }
				});


				function apiLookupFailure(msg,accounts,modalID,zipCode,phoneNumber,object){
					if(typeof object == 'undefined') var object = this;
					var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
					object.loadingModal.hide();
					// If errors, remove the loading modal and show the error.
					switch (msg.code) {
						case 110:	// Required parameter not provided
							userMsg= 'Please ensure that all required fields have been populated and try again.';
							// console.log(msg);
							break;
						case 305:	// User is in feed with a different marketId
						case 220:	// Required parameter not provided
							userMsg= 'No accounts were found with the information provided. Please try again or contact customer service for assistance.';
							// console.log(msg);
							break;
						case 304:   // User is in feed with a marketId
							var linkAccount_unitNumber = $(':input[type=hidden][name=linkAccount_unitNumber]').val();
							var linkAccount_publicationCode = $(':input[type=hidden][name=linkAccount_publicationCode]').val();
							var linkAccount_accountNumber = $(':input[type=hidden][name=linkAccount_accountNumber]').val();
							var params = '';
							if (linkAccount_unitNumber && linkAccount_publicationCode && linkAccount_accountNumber)
								params = '&linkAccount_unitNumber='+linkAccount_unitNumber + '&linkAccount_publicationCode='+linkAccount_publicationCode + '&linkAccount_accountNumber='+linkAccount_accountNumber;

							var hrefLogin = $('.firefly.page').length > 0 ? '/section/como?screen=login'+params : '#firefly-login-register';
							var hrefReset = $('.firefly.page').length > 0 ? '/section/como?screen=password-reset' : '#firefly-password-reset';
							object.showModalMsg('firefly-login', message , true, 'success');
							var hasEmail = ""; 
							if (accounts.subscriberSearch['0'].email != "" && accounts.subscriberSearch['0'].email != "null" && accounts.subscriberSearch['0'].email != null){
								hasEmail = "&email=" + accounts.subscriberSearch['0'].email;
							}
							window.location = "/section/como?screen=login" + hasEmail + "&msg=forgottenEmail&firstName=" + accounts.subscriberSearch['0'].firstName + "&lastName=" + accounts.subscriberSearch['0'].lastName;
							return;
							break;
						default:// if we didn't match anything, something bad is going on
							// console.warn(msg);
							break;
				}

					var grow = ( modalID.search('firefly-login')!=-1 );
					object.showModalMsg(modalID, userMsg, grow, 'error');
				}
				function apiSuccess(msg,accounts,modalID,zipCode,phoneNumber,object){//Account was found in Genesys
					var modal=$('#'+modalID);

					var email="";
					var firstName="";
					var lastName="";
					var accountsFound="";
					var numberOaccounts=accounts.subscriberSearch.length;
					var accountsWithEmail=0;
					var unitNumber;
					var publicationCode;
					var accountNumber;
					var currentEmail="";
					var publicationName = "";

					for (x=0;x<numberOaccounts;x=x+1)//Get the information associated with the account(s)
					{
						if (accounts.subscriberSearch[x].description != publicationName) {
							publicationName = accounts.subscriberSearch[x].description;
							
							if (accountsFound != "")
								accountsFound += "</fieldset>";
							
							accountsFound += "<fieldset><legend>" + publicationName + "</legend>\n";
						}
						
						currentEmail = (accounts.subscriberSearch[x].email && accounts.subscriberSearch[x].email.toLowerCase()) || currentEmail;
						firstName = firstName || accounts.subscriberSearch[x].firstName;
						lastName = lastName || accounts.subscriberSearch[x].lastName;

						if(email=="" && accounts.subscriberSearch[x].email != "" && accounts.subscriberSearch[x].email != null){
							email=currentEmail;
							accountsWithEmail=accountsWithEmail+1;
						}else if(email!="" && accounts.subscriberSearch[x].email!="" && accounts.subscriberSearch[x].email!=null && currentEmail!=email)
						{
							accountsWithEmail=accountsWithEmail+1;
						}
						if(typeof(unitNumber) != "number"){
							unitNumber=accounts.subscriberSearch[x].unitNumber;
						}
						if(typeof(publicationCode) != "string"){
							publicationCode=accounts.subscriberSearch[x].publicationCode;
						}
						if(typeof(accountNumber) != "number"){
							accountNumber=accounts.subscriberSearch[x].accountNumber;
						}
						// IE7 doesn't work with implicit labels so make it explicit
						var accountFormId = accounts.subscriberSearch[x].accountNumber + '-' + accounts.subscriberSearch[x].publicationCode + '-' + accounts.subscriberSearch[x].unitNumber;
						accountsFound += '<input type="hidden" id="firstName-'+accountFormId+'" name="firstName-'+accountFormId+'" value="'+accounts.subscriberSearch[x].firstName+'">';
						accountsFound += '<input type="hidden" id="lastName-'+accountFormId+'" name="lastName-'+accountFormId+'" value="'+accounts.subscriberSearch[x].lastName+'">';
						accountsFound += '<input type="hidden" id="email-'+accountFormId+'" name="email-'+accountFormId+'" value="'+accounts.subscriberSearch[x].email+'">';
						accountsFound += '  <label class="account contain-floats" for="linkAccounts-'+accountFormId+'">';
						accountsFound += '<div class="fancy-checkbox"><input name="linkAccounts" id="linkAccounts-'+accountFormId+'" type="checkbox"'+(numberOaccounts==1 ? ' checked' : '')+' value="' + accounts.subscriberSearch[x].accountNumber + ',' + accounts.subscriberSearch[x].publicationCode + ',' + accounts.subscriberSearch[x].unitNumber + '">';
						accountsFound += '<span class="button primary account-select">Select</span>';
						accountsFound += '<img alt="Selected" src="/odygci/firefly/checkmark-big.png"></div>';
						accountsFound += '<div class="name">'+accounts.subscriberSearch[x].firstName+' '+accounts.subscriberSearch[x].lastName+'</div><div class="account-number">Account number: '+accounts.subscriberSearch[x].accountNumber+'</div>' + "</label>\n";
					}
					
					if (accountsFound != "") {
						accountsFound += "</fieldset>";
						accountsFound = '<input type="hidden" name="screen" value="register">' + accountsFound;
						accountsFound = '<div id="retrieved-account-selector">' + accountsFound + '</div>';
						accountsFound += '<input type="hidden" name="firstName" value="' + firstName + '">';
						accountsFound += '<input type="hidden" name="lastName" value="' + lastName + '">';
						accountsFound += '<input type="hidden" name="email" value="' + email + '">';
						accountsFound += '<input type="hidden" name="zip" value="' + zipCode + '">';
						accountsFound += '<input type="hidden" name="phoneNumber" value="' + phoneNumber + '">';
						accountsFound += '<input type="hidden" name="linkAccount_unitNumber">';
						accountsFound += '<input type="hidden" name="linkAccount_publicationCode">';
						accountsFound += '<input type="hidden" name="linkAccount_accountNumber">';
					}
					
					if (numberOaccounts > 1) {
						accountsFound = '<p>We found multiple accounts for the subscription information you provided.  Please select the accounts that belong to you.  <a href="">Not you?</a></p>' + accountsFound;

						// add the select/deselect all buttons
						modal.find('h2').append(' <span><button type="button" class="select-all">select all</button> | <button type="button" class="deselect-all">deselect all</button></span>');
						
						// add handlers for select/deselect all buttons
						modal.find('button.select-all,button.deselect-all').click(function(e){var target = $(e.target); target.closest('.firefly').find('input[name=linkAccounts][type=checkbox]').attr('checked', target.hasClass('select-all')).change()});
					} else {
						accountsFound = '<p>We found the following account for the subscription information you provided.  <a href="">(Not you?)</a></p>' + accountsFound;
					}
					
					if(firstName==null){firstName='';}
					firstName=firstName.replace(/^\w/, function($0) { return $0.toUpperCase(); });
					if(lastName==null){lastName='';}
					lastName=lastName.replace(/^\w/, function($0) { return $0.toUpperCase(); });

					modal.find('form').attr('action', '/section/como?screen=register');
					modal.find('a.button.cancel').attr('href', '');

					if(numberOaccounts > 0 && typeof(accountNumber) == "number" && typeof(unitNumber) == "number" && typeof(publicationCode) == "string" )//If 1 email address is associated across multiple accounts or no email address is found, we need to look in Atypon so we place a getAccount API call
					{
						object.atyponAPI.getAccount({
							'params': {
								'accountNumber': accountNumber,
								'publicationCode': publicationCode,
								'unitNumber': unitNumber
							},
							'success': function(msg, users) {apiGASuccess(msg, users, modalID);},
							'failure': function(msg, users) {apiGAFailure(msg, users, modalID, zipCode, phoneNumber, firstName, lastName, accountsFound, numberOaccounts);}
						});
					}else
					{
						var message='An error occured while retrieving the account(s) for <b>' + firstName + ' ' + lastName + '</b>, call customer service.';
						object.showModalMsg(modalID, message , false, 'error');
						object.loadingModal.hide();
					}
				}
				function apiGASuccess(msg,users,modalID){//The user is in both Genesys and Atypon, we will get the Atypon account information here. This covers the case where the user needs to find the email address for their account.
					if(users.users.length>0&&users.users.length<=2){
						var userEmailA=users.users[0].email;
						var firstNameA=users.users[0].firstName;
						var lastNameA=users.users[0].lastName;
						var credentialTypeA=users.users[0].credentialType;
						var extraButtonClassA = "";
						if(credentialTypeA=="Facebook"){
							extraButtonClassA = " facebook";
						}
						var userEmailB="";
						var firstNameB="";
						var lastNameB="";
						var credentialTypeB="";
						var extraButtonClassB = "";
						if(users.users.length>1){
							userEmailB=users.users[1].email;
							firstNameB=users.users[1].firstName;
							lastNameB=users.users[1].lastName;
							credentialTypeB=users.users[1].credentialType;
							if(credentialTypeB=="Facebook"){
								extraButtonClassB = " facebook";
							}
						}
						object.loadingModal.hide();
						if($('#'+modalID +' h2').html().search('Account') != -1){
							var message='We have detected that you are already have an account. Please log in with the email address associated with your account.';
						}else{
							var message='Please select the email address associated with your login:<br>';
							}
						if(modalID.search('-page')==-1 | extraButtonClassA != ""){
							var useHrefA = "#firefly-login";
						}else{
							var useHrefA = "/section/como?screen=login&email="+userEmailA;
						}
						if(firstNameB!="" && lastNameB!="" && userEmailB!="" && firstNameA!="" && lastNameA!="" && userEmailA!=""){
							if(modalID.search('-page')==-1 | extraButtonClassB != ""){
								var useHrefB = "#firefly-login";
							}else{
								var useHrefB = "/section/como?screen=login&email="+userEmailB;
							}
							$('#'+modalID +' .bottom-buttons.second-level').hide();
							$('#'+modalID +' .bottom-buttons.second-level').after('<div class="bottom-buttons third-level"><p>'+message+'</p><a class="button primary' + extraButtonClassA + '" href="'+useHrefA+'" style="display:block;text-align: center;">'+userEmailA+'</a><br><a class="button primary' + extraButtonClassB + '" href="'+useHrefB+'" style="display:block;text-align: center;">'+userEmailB+'</a><button class="return-to">Cancel</button></div>');
						}else if(firstNameA!="" && lastNameA!="" && userEmailA!="")
						{//Need to automatically redirect to the login page when a single email address is found.
							var parentID = modalID;//$(this).closest('.firefly').attr('id');
							$('#'+modalID).find('.message.success.bulleted').removeClass('bulleted');
							$('#'+modalID).find('.message.success').removeClass('success');
							$('#fireflymodal_phone').val('');
							$('#fireflymodal_zip').val('');
							$('#'+modalID).find('.bottom-buttons.second-level').hide();
							object.hideModalMsg(modalID);
							$('#'+modalID).find('.bottom-buttons.third-level').remove();
							if(extraButtonClassA.search('fblogin')==-1 && extraButtonClassA.search('facebook')==-1 && credentialTypeA!=""){
								$('#'+modalID).find('.innerform').show();
								$('#'+modalID).find('.bottom-buttons.first-level').show();
								var message = "Hi, <strong>" + firstNameA + " " + lastNameA + "</strong>. It looks like you already have an account. Please log in below.";
								if(modalID.search('-page')==-1){
									var loginForm = $('#firefly-login form');
									$('#firefly-login .current-subscriber-link').hide();
									object.showModalMsg('firefly-login', message , false, 'success');
									loginForm[0].reset(); // in case filled in by something else like facebook					
									loginForm.find(':input[name="email"]').val(userEmailA);
									loginForm.find('a[title="Email retrieval"]').remove();
									if(modalID.search('firefly-register') == 0){
										object.showModal('firefly-login');
									}else{
										object.closeModal('firefly-login');
									}
								}else{
									window.location.href='http://' + GEL.thepage.pageinfo.url.hostname + '/section/como?screen=login&email=' + userEmailA + '&msg=forgottenEmail' + '&firstName=' + firstNameA + '&lastName=' + lastNameA;
								}
							}else if(credentialTypeA==""){
								function apiAutoResetSuccessful_path(msg){
									var loginForm = $('#firefly-login form');
									$('#firefly-login .current-subscriber-link').hide();
									object.hideModalMsg('firefly-login');
									var message = 'You must reset your password to activate your account. We have sent an email to <b>"'+userEmailA+'"</b> that you can use to reset your password.';
									object.showModalMsg('firefly-login', message , false, 'success');
									loginForm[0].reset(); // in case filled in by something else like facebook					
									loginForm.find(':input[name="email"]').val(userEmailA);
									loginForm.find('a[title="Email retrieval"]').remove();
									if(modalID.search('firefly-register') == 0){
										object.showModal('firefly-login');
									}else{
										object.closeModal('firefly-login');
									}
									
								}
								function apiAutoResetFailure_path(msg){
									//var object = this;
									var message = 'You must reset your password to activate your account. Please contact customer servic to reset your password.';
									var loginForm = $('#firefly-login form');
									$('#firefly-login .current-subscriber-link').hide();
									object.hideModalMsg('firefly-login');
									var message = 'You must reset your password to activate your account. We have sent an email to <b>"'+userEmailA+'"</b> that you can use to reset your password.';
									object.showModalMsg('firefly-login', message , false, 'success');
									loginForm[0].reset(); // in case filled in by something else like facebook					
									loginForm.find(':input[name="email"]').val(userEmailA);
									loginForm.find('a[title="Email retrieval"]').remove();
									if(modalID.search('firefly-register') == 0){
										object.showModal('firefly-login');
									}else{
										object.closeModal('firefly-login');
									}
								}
								//var pwrForm = $('#ff_pw_rs_frm form');
								//pwrForm.find(':input[name="email"]').val(userEmailA);
								//object.showModal('firefly-password-reset');
								object.atyponAPI.resetPassword({
									'form': this.form,
									'params': {
										'email': userEmailA,
										'marketId': object.getMarketId()
									},
									'success': apiAutoResetSuccessful_path,
									'failure': function(msg) {apiAutoResetFailure_path(msg);}
								});
								
								//"We have found your account, but you will need to reset your password to activate your account."
							}else{
								$('#'+parentID).find('.goto-facebook.hidden').removeClass('hidden');
							}
						}
						
					}else{
						if(users.users.length>2){
							//The user has multiple accounts and more than 1 of those accounts has been shared to different email addresses. For now when this happens they should be notified that too many accounts were detected and to call the customer service line.
							var message="We have detected that you have more than two users associated with this account information. Please contact customer service for assistance.";
							object.showModalMsg(modalID, message , false, 'error');
						}else{
							//unknown error has occurred and no user infomation was found in Atypon but an email is associated with this user in Genesys
							var message="We were unable to locate an email address associated with the account information provided. Please contact customer service for assistance.";
							object.showModalMsg(modalID, message , false, 'error');
					}
				}
				}
				function apiGAFailure(msg,users,modalID,zipCode,phoneNumber,firstName, lastName, accountsFound, numberOaccounts){//the getAccount API call has returned with no Atypon user data so the user needs to register with the account(s) found.
					var modal = $('#'+modalID);
					var form = modal.find('form').first();
					
					form.find('.innerform').replaceWith(accountsFound);
					// disable unless there's exactly 1 result
					form.find('button[type=submit]').prop('disabled', numberOaccounts != 1);
					
					form.find('input[name=linkAccounts]').change(function(e) {
						var button = $(e.target);
						var form = button.closest('form');
						var submit = form.find('button[type=submit]');
						var fancy = button.closest('.fancy-checkbox');	// hack to get around WebKit bug #54373
						
						// shortcut the common case, where selecting this will enable the button
						if (button.is(':checked')) {
							submit.prop('disabled', false);
							button.addClass('form-ui-checked');
							
							fancy.find('img').show();	// WebKit
							fancy.find('.button.primary').hide();	// IE<9 is really really slow at interpreting the CSS, so do it on the element.
						} else {
							submit.prop('disabled', form.find('input[name=linkAccounts]:checked').length < 1);
							button.removeClass('form-ui-checked');
							
							fancy.find('img').hide();	// WebKit
							fancy.find('.button.primary').show();	// IE<9 is really really slow at interpreting the CSS, so do it on the element.
						}
					});
					form.find('input[name=linkAccounts]').change();
					
					object.loadingModal.hide();
				}
			}
			$('.bottom-buttons.thankyou-page button.continue').click(function(){
				redirectUrl=object.atyponAPI.cookie.get('ERIGHTS_RETURN');
				if(redirectUrl!=null && redirectUrl!=''){
					try{
						redirectUrl=$.base64.decode(redirectUrl);
						var splitURL = redirectUrl.split('#');
						redirectUrl = splitURL[0];//Only use the URL content before any existing "#"
						if (redirectUrl != 'http://'+GEL.thepage.pageinfo.url.hostname && redirectUrl != 'http://'+GEL.thepage.pageinfo.url.hostname +'/' && redirectUrl.search('thankyou-page') == -1){
							redirectUrl+=(redirectUrl.match(/\?/)==null)?'?':'&';
						}else{
							redirectUrl='http://'+GEL.thepage.pageinfo.url.hostname+'/apps/pbcs.dll/frontpage?';
						}
					}catch(e){
						redirectUrl='http://'+GEL.thepage.pageinfo.url.hostname+'/apps/pbcs.dll/frontpage?';
					}
				}else{
					redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/apps/pbcs.dll/frontpage?';
				}
				window.location.href=redirectUrl;
				return false;
			});
			$('.bottom-buttons.second-level button.continue').click(function(){
				if(this.className.search('goto-login')==-1){
					$('#firefly-register .dangle').hide();
					$('#firefly-register a[title*="Account Retrieval"]').hide();
					object.showModal('firefly-register');
				}else{
					var close = $('#'+GEL.thepage.pageinfo.firefly.modal.innerId);
					var modal = close.closest('.firefly.modal');
					// reset any forms
					modal.find('form').each(function(i, e) { e.reset(); });
					// actually close the modal
					object.closeModal(modal.attr('id'), e);
				}
				return false;
			});
			$('#firefly-account-lookup-form-page .bottom-buttons.second-level button.continue').click(function(){
				$('#firefly-register .dangle').hide();
				$('#firefly-register a[title*="Account Retrieval"]').hide();
				object.showModal('firefly-register');
				return false;
			});
			$('#firefly-account-lookup-form-page').submit(function(e){
				var form = $(e.target);
				var modal = form.closest('.firefly');
				
				// make sure any error messages are cleared out
				object.hideModalMsg(modal.attr('id'));

				var linkAccounts = form.find('input[name=linkAccounts]');
				
				if (linkAccounts.length > 0) {
					var accountsToLink = linkAccounts.filter(':checked');
					
					// if they have selected any accounts, we'll go ahead and submit the form
					if (accountsToLink.length > 0) {
						// for now, separate out the 3 fields before submitting until we replace the param code with something
						// that can handle multiple fields with the same name
						var linkAccount_unitNumber = '',
							linkAccount_publicationCode = '',
							linkAccount_accountNumber = '',
							linkAccount_email = '',
							linkAccount_firstName = '',
							linkAccount_lastName = '';

						accountsToLink.each(function(index, account) {
							var pieces = $(account).val().split(',');
							var accountFormId = pieces.join('-');
							linkAccount_unitNumber += (index > 0 ? ',' : '') + pieces[2];
							linkAccount_publicationCode += (index > 0 ? ',' : '') + pieces[1];
							linkAccount_accountNumber += (index > 0 ? ',' : '') + pieces[0];
							// Update the hidden fields with selected account's info, but default to blank when multiple are selected.
							linkAccount_email = (index == 0 && linkAccount_email == '' || linkAccount_email == $('#email-'+accountFormId).val()) ? $('#email-'+accountFormId).val() : '';
							linkAccount_firstName = (index == 0 && linkAccount_firstName == '' || linkAccount_firstName == $('#firstName-'+accountFormId).val()) ? $('#firstName-'+accountFormId).val() : '';
							linkAccount_lastName = (index == 0 && linkAccount_lastName == '' || linkAccount_lastName == $('#lastName-'+accountFormId).val()) ? $('#lastName-'+accountFormId).val() : '';
						});

						$(':input[type=hidden][name=linkAccount_unitNumber]').val(linkAccount_unitNumber);
						$(':input[type=hidden][name=linkAccount_publicationCode]').val(linkAccount_publicationCode);
						$(':input[type=hidden][name=linkAccount_accountNumber]').val(linkAccount_accountNumber);
						$(':input[type=hidden][name=email]').val(linkAccount_email);
						$(':input[type=hidden][name=firstName]').val(linkAccount_firstName);
						$(':input[type=hidden][name=lastName]').val(linkAccount_lastName);

						return true;
					} else {
						// clear them out, just in case
						$(':input[type=hidden][name=linkAccount_unitNumber]').val('');
						$(':input[type=hidden][name=linkAccount_publicationCode]').val('');
						$(':input[type=hidden][name=linkAccount_accountNumber]').val('');
						$(':input[type=hidden][name=linkAccount_email]').val('');
						$(':input[type=hidden][name=linkAccount_firstName]').val('');
						$(':input[type=hidden][name=linkAccount_lastName]').val('');

						// this shouldn't happen because the continue button will be disabled, but just in case
						object.showModalMsg(modal.attr('id'), "Please select at least one account.", false, 'error');

						return false;
					}
				} else {
					// Retrieve user data from the form
					var zipCode=form.find(':input[name=zip]').val();
					var phoneNumber=form.find(':input[name=phone]').val();
					getAccounts(zipCode, phoneNumber, 'firefly-account-lookup-page');
					return false;
				}
			});
			$('button.return-to').live('click', function(e){
				var parentID = $(this).closest('.firefly').attr('id');
				if(parentID.search('-page')==-1){
					var returnToButton = $(e.target);
					var body = returnToButton.closest('.body');
					var form = body.find('form').first();
					
					body.find('.message.success.bulleted').removeClass('bulleted');
					body.find('.message.success').removeClass('success');
					
					form[0].reset();

					body.find('.innerform').show();
					body.find('.bottom-buttons.second-level').hide();
					body.find('.bottom-buttons.first-level').show();
					object.hideModalMsg( GEL.thepage.pageinfo.firefly.modal.innerId + ' .firefly-modal-slide');
				}else{
					window.location.href='/section/como?screen=login';
				}
				
			});
			// Reset password.
			$('#firefly-password-reset-form').submit(function(){
				object.loadingModal.show($(this).closest('.firefly-modal-slide'), 'Retrieving account information');
				this.form=$('#ff_pw_rs_frm');
				this.success=$('#firefly-password-reset-success');
				// Hide error.
				object.hideModalMsg('ff_pw_rs_frm');
				if(object.atyponAPI.cors==false){
					if($('.firefly.page').length > 0){
						window.location.href='/section/como?screen=flashRequired';
					}else{
						object.showModal('firefly-flash-required');
					}
					return false;
				}
				// Validate fields. Validation methods should be explored in the future.
				var email=$('#'+$(this).attr('id')+' [name=email]').val();
				object.atyponAPI.resetPassword({
					'form': this.form,
					'params': {
						'email': email,
						'marketId': object.getMarketId()
					},
					'success': apiSuccessful_path,
					'failure': function(msg) {apiFailure_path(msg, object);}
				});
				// Send the jQuery DOM object where the loading should appear and the message.
				function apiFailure_path(msg,object){
					if(typeof object == 'undefined') var object = this;
					var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
					object.loadingModal.hide();
					switch (msg.code) {
						case 110:	// Required parameter not provided
							userMsg = 'All fields are required.';
							// console.log(msg);
							break;
						
						case 220:	// ObjectNotFoundException [Basically "user not found"]
						case 400:	// Invalid email address
							userMsg = 'Email address not found.  Please verify the information and try again or subscribe.';
							break;

						case 410:	// Error sending email
							userMsg = 'We\'re unable to send email to that address.  Please verify the information and try again or subscribe.';
							break;

						case 350:	// Required parameter not provided
							userMsg = 'Your account is currently configured to log in using Facebook, so you must reset your password through Facebook.';
							// console.log(msg);
							break;

						// These are all very bad cases.  Listing explicitly the ones we know are awful before the default case for clarity.
						case 320: 	// Accounts were merged. [This shouldn't happen here because it should follow the success route instead, so if it makes it here something is very wrong.]
						case 210:	// eRightsException
						case 200:	// RemoteException
						default: 	// if we didn't match anything, something bad is going on
							// console.warn(msg);
							break;
						}
					object.showModalMsg('ff_pw_rs_frm', userMsg, false, 'error');
					//$(this).attr('action', '/fireflyResponses/resetPasswordError.html');
				}
				function apiSuccessful_path(msg){
					object.loadingModal.hide();
					object.showModalMsg('ff_pw_rs_frm', 'A link to reset your password has been sent to <b>"'+email+'"</b>. If you did not receive an email, you can resend below.', false, 'success');
					$('#firefly-password-reset-form .bottom-buttons.first-level').hide();
					$('#firefly-password-reset-form .bottom-buttons.second-level').show();
					$('#ff_pw_rs_frm label').hide();
					$('#ff_pw_rs_frm p').hide();
				}
				return false;
			});
			
			// password/etc confirm validation
			$('input.confirmation').each(function(index, element){
				var original = $( '#'+element.id.replace('-confirm', '') );
				
				// only need to set this up if there is another field to confirm against
				if (original) {
					// when the original changes, call the confirm's change event
					$(original).bind('change keyup', function(e){
							if (original.prop('validity') && original.prop('validity').valid) {
								if (e.type == 'keyup') {
									original.change();
									return false; // let the change function handle it
									}
								original.addClass('confirmed');
							} else
								original.removeClass('confirmed');
							
							var confirm = $('#' + e.target.id + '-confirm');
							if (confirm.val()) confirm.change();
						});
				
					$(element).change(function(e){
						var confirm = $(e.target);
						var original = $('#' + confirm.attr('id').replace('-confirm', ''));
						
						if (original && original.prop('validity') && original.prop('validity').valid) {
							// show as confirmed if the two values are equal and there are no other validation errors on either
							if (confirm.val() == original.val()) {
								confirm.setCustomValidity('');
								confirm.addClass('confirmed');
							} else {
							confirm.setCustomValidity(original.attr('title') ? 'This must match ' + original.attr('title') + '.' : 'Does not match.');
								confirm.removeClass('confirmed');
							}
						} else {
							confirm.removeClass('confirmed');	
							confirm.setCustomValidity('');
						}
						});
					
					// recheck validation status on each keypress, as long as it isn't tab (9)
					$(element).keyup(function(e){ if (e.keyCode != 9) $(e.target).change(); });
					}
			});
			
			// make sure registrants are old enough
			$('#firefly-register input[name=birth_year]').change(function(e){
				var birthYearInput = $(e.target);
				var container = birthYearInput.closest('.firefly');
				
				var birthYear = parseInt(birthYearInput.val());
				var thisYear = (new Date()).getFullYear();
				
				if (birthYear == NaN || birthYear < thisYear - 150 || birthYear > thisYear) {
					birthYearInput.setCustomValidity('Invalid birth year.');
					object.hideModalMsg(container.attr('id'));
				} else if (thisYear - birthYear < 14) {
					birthYearInput.setCustomValidity('Invalid birth year.'); // we can't explicitly say that they need to be at least 13
					object.showModalMsg(container.attr('id'),"We're sorry. We cannot accept your registration at this time. Please review our <a href=\"/terms\">terms of service</a>.",false,'error');
				} else {
					birthYearInput.setCustomValidity('');
					object.hideModalMsg(container.attr('id'));
				}
			});

			// strip leading and trailing whitespace from any text input not a password.
			$('.firefly form input[type=text], .firefly form input[type=email]').blur(function(e) {
				var input = $(e.target);
				input.val( input.val().trim() );
			});

			// Login modal.
			$('a[href*="/login"],a[href*="/como?screen=login"]').click(function(e){
				var link = $(e.target);
				var href = link.attr('href');

				// If they're already logged in or on a page, skip the login modal.
				if (object.atyponAPI.is('loggedIn')||$('.firefly.page').length>0||window.location.href.indexOf('como?screen=')>=0){
					// Follow that link!
					if(object.atyponAPI.cors==false){
						window.location.href='/section/como?screen=flashRequired';
						return false;
					}
					return true
				}else{
					if(object.atyponAPI.cors==false){
						object.showModal('firefly-flash-required');
						return false;
					}
				}
				if (link.hasClass('firefly-fblogin-learnmore')) {
					var parentID = 'firefly-login';
					var returnToButton = $(e.target);
					var body = returnToButton.closest('.firefly-modal-slide > .body');
					var form = body.find('form').first();
					body.find('.message.success.bulleted').removeClass('bulleted');
					body.find('.message.success').removeClass('success');
					form[0].reset();
					body.find('.innerform').show();
					body.find('.bottom-buttons.second-level').hide();
					body.find('.bottom-buttons.first-level').show();
					object.hideModalMsg( GEL.thepage.pageinfo.firefly.modal.innerId + ' .firefly-modal-slide');
					object.closeModal(parentID);
				}else{
					object.showModal('firefly-login');
				}
				return false; 
			});
			$('a[href*="/como?screen=account-lookup"]').live('click', function(e){
				var link = $(e.target);
				
				// Image check.
				if(link.attr('src')!=undefined && link.attr('src')!=''){
					link=link.parent();
				}

				// Make sure they (unfortunately) have Flash
					if(object.atyponAPI.cors==false){
						window.location.href='/section/como?screen=flashRequired';
						return false;
					}

				// If they're already logged in or on a page, skip the login modal.
				if(object.atyponAPI.is('loggedIn')){
					link.attr('href', GEL.firefly.options.apiUrl + '/account/#linkAccounts');
					}

				// Follow that link!
				return true; 
			});
			$('a[href*="/como?screen=register"]').live('click', function(e){
				var link = $(e.target);
				var href = link.attr('href');
				var aClass = link.attr('class');
				// If they're already logged in or on a page, go to the full-page version
				if ($('.firefly').hasClass('page')||window.location.href.indexOf('como?screen=')>=0){
					// Follow that link!
					if(object.atyponAPI.cors==false){
						window.location.href='/section/como?screen=flashRequired';
						return false;
					}
					return true
				}else{
					if(object.atyponAPI.cors==false){
						object.showModal('firefly-flash-required');
						return false;
					}
				}
				var params = {
					'mode': href.indexOf('mode=bonus') != -1 ? 'bonus' : '',
					'redirectURL': href.substr(href.indexOf('redirectURL=') + 'redirectURL='.length)
				};
				object.showModal('firefly-register', params);
				return false; 
			});
			// generic page/modal switching
			$('a[href*="#firefly-"]').live('click', function(e) {
				var link = $(e.target);
				var href = link.attr('href');
				var baseHref = href.replace(/#.*/, '');
				var className = link.attr('class');
				var modalName = href.substring(href.lastIndexOf('#firefly-')+1);

				if(object.atyponAPI.cors==false){
					if(modalName=='firefly-register'||modalName=='firefly-login'||modalName=='firefly-login-register'){
						object.showModal('firefly-flash-required');
						return false;
					}
				}
				if(baseHref != ''){
					if(typeof object.atyponAPI.data.user != 'undefined'){
						baseHref = object.buildIconUrl(baseHref,{'email':object.atyponAPI.data.user.email,'firstName':object.atyponAPI.data.user.firstName,'lastName':object.atyponAPI.data.user.lastName,'zipCode':object.atyponAPI.data.user.zipCode});
					}
					if(modalName!=''&&baseHref.indexOf('#')==-1){
						baseHref+='#'+modalName;
					}
					$.data(document.body,'iconBaseHref',baseHref);
				}
				
				// Disable when the link has a class of disabled.
				if(link.hasClass('disabled')){
					return false;
				}
				if (className=="firefly-fblogin-learnmore" && href=="#firefly-login") {
					var parentID = link.closest('.firefly.modal').attr('id');
					var returnToButton = $(e.target);
					var body = returnToButton.closest('.body');
					var form = body.find('form').first();
					
					body.find('.message.success.bulleted').removeClass('bulleted');
					body.find('.message.success').removeClass('success');
					
					form[0].reset();

					body.find('.innerform').show();
					body.find('.bottom-buttons.second-level').hide();
					body.find('.bottom-buttons.first-level').show();
					object.hideModalMsg( GEL.thepage.pageinfo.firefly.modal.innerId + ' .firefly-modal-slide');
					object.closeModal(parentID);
				} else if(href=="#firefly-password-reset"){
					var loginForm = $('#firefly-login form');
					var passwordRS = $(href);
					passwordRS.find(':input[name="email"]').val(loginForm.find(':input[name="email"]').val());
					object.showModal(modalName);
				}else {
					// If they're already logged in, skip the login or register link
					if (object.atyponAPI.is('loggedIn') && (modalName == 'firefly-login' || modalName == 'firefly-register') ) {
						link.attr('href', baseHref); // remove the modal name from the href
						// Append the required ICON information.
						if(modalName=='firefly-register' && ($('#fod-primaryPub').length>0 || link.attr('id')=='options-digital-button')){
							var iconParams={
								email: object.atyponAPI.data.user.email,
								firstName: object.atyponAPI.data.user.firstName,
								lastName: object.atyponAPI.data.user.lastName,
								zipCode: object.atyponAPI.data.user.zipCode
							};
							if(link.attr('id')=='options-digital-button'){
								// This is the digital only info.
								iconParams.type='digital';
								iconParams.primaryPub=$('#fod-digital-primaryPub').val();
								iconParams.rateCode=$('#fod-digital-rateCode').val();
								iconParams.webAccessPubId=$('#fod-digital-webAccessPubId').val();
							}else{
								iconParams.primaryPub=$('#fod-primaryPub').val();
								iconParams.secondaryPub=$('#fod-secondaryPub').val();
								iconParams.rateCode=$('#fod-rateCode').val();
							}
							link.attr('href', object.buildIconUrl(link.attr('href'),iconParams));
						}
						//
						return true; // follow the link!
					}else if(modalName=='firefly-register'&&($('#fod-primaryPub').length>0 || link.attr('id')=='options-digital-button' || link.hasClass('fod-submit'))){
						// Set flag to redirect to the payment page when the form is submitted.
						object.options.reg2payment=true;
					}
					
					if (modalName == 'firefly-login-register') {
						$('#firefly-login-register form :input[name="redirectURL"]').val( $('#firefly-register form :input[name="redirectURL"]').val() );
						$('#firefly-login-register form :input[name="linkAccount_unitNumber"]').val( $('#firefly-register form :input[name="linkAccount_unitNumber"]').val() );
						$('#firefly-login-register form :input[name="linkAccount_publicationCode"]').val( $('#firefly-register form :input[name="linkAccount_publicationCode"]').val() );
						$('#firefly-login-register form :input[name="linkAccount_accountNumber"]').val( $('#firefly-register form :input[name="linkAccount_accountNumber"]').val() );
						}
					
					object.showModal(modalName, {'redirectURL': baseHref}); 
				}
				return false; 
			});
			
			$('a[href*="#firefly-login"]').live('click', function(e){
				var loginto = $(e.target);
				var href = loginto.attr('href');
				var parentID = $(this).closest('.firefly').attr('id');
				var baseHref = href.replace(/#.*/, '');
				modalName = href.substring(href.lastIndexOf('#firefly-')+1);
				if(this.className.search('return-to-login')!=-1){
					$('#'+modalName).find(':input[name="email"]').val($('#'+parentID).find(':input[name="email"]').val());
					object.showModal(modalName, {'redirectURL': baseHref}); 
				}else{
					var email=(this.childNodes[0].textContent != 'log in') ? this.childNodes[0].textContent : '';
					$('#'+parentID).find('.message.success.bulleted').removeClass('bulleted');
					$('#'+parentID).find('.message.success').removeClass('success');
					$('#fireflymodal_phone').val('');
					$('#fireflymodal_zip').val('');
					$('#'+parentID).find('.bottom-buttons.second-level').hide();
					object.hideModalMsg(parentID);
					$('#'+parentID).find('.bottom-buttons.third-level').remove();
					if(this.className.search('fblogin')==-1 && this.className.search('facebook')==-1){
						$('#'+parentID).find('.innerform').show();
						$('#'+parentID).find('.bottom-buttons.first-level').show();
						if(parentID && parentID.search('-page')==-1){
							var loginForm = $('#firefly-login form');
							loginForm[0].reset(); // in case filled in by something else like facebook					
							loginForm.find(':input[name="email"]').val(email);
							object.closeModal(parentID);return false;
							if(parentID=='firefly-register'){
								object.showModal('firefly-login');
							}
						}
					}else if(this.className.search('fblogin')>-1){
						$('#'+parentID).find('.innerform').show();
						$('#'+parentID).find('.bottom-buttons.first-level').show();
						var loginForm = $('#firefly-login form');
						loginForm[0].reset(); // in case filled in by something else like facebook	
						$('#'+parentID).find('form .goto-facebook').addClass('hidden');
						object.closeModal(parentID);return false;
						if(parentID=='firefly-register'){
							object.showModal('firefly-login');
						}
					}else{
						//Show the login with facebook option and hide everything else.
						if(parentID.search('-page')==-1){
							var loginForm = $('#firefly-login form');
							loginForm[0].reset(); // in case filled in by something else like facebook	
							$('#'+parentID).find('form .goto-facebook.hidden').removeClass('hidden');
						}else{
							$('#'+parentID).find('.goto-facebook.hidden').removeClass('hidden');
						}
					}
				}
				return false; 
			});
			
			$('#firefly-hdlogin-email').change(function() { if (this.value) {$(this).addClass('has-note confirm');} else {$(this).removeClass('has-note confirm');} });
			
			// update displayed counts
			$('.firefly.modal span.firefly-readcount').html(object.atyponAPI.getCount() - 1); // -1 because they haven't seen this article yet
			$('.firefly.modal span.firefly-freelimit').html(object.atyponAPI.getCountRemainingFree() + 2); // +2 because this article will be one of them

			// Store the subscriptionThankYou QSP parameter's value (It's used multiple times in the below)
			var paramTY = parseInt(object.getParameterByName('subscriptionThankYou'));
			var paramAtyponID = parseInt(object.getParameterByName('uId'));
			var paramStartDate = object.getParameterByName('startDate');
			var isRedirectPage = (object.getParameterByName('screen') == 'iconRedirect') ? true : false;
			
			// show modal
			var authorized = object.atyponAPI.is('authorized');
			if(isRedirectPage){ // Include any cases where we never want a modal.
				// Do nuffin.
			} else if(paramTY==1){
				//console.log('Modal: Thank you 1');
				$('#firefly-thank-you .firefly-modal-wrapper.digital').removeClass('digital'); // Sets the view for a non digital thank you modal
				// Build date for future starts. Date in query string will be in getTime() format.
				object.showModal('firefly-thank-you');
			} else if(paramTY==2 ){
				//console.log('Modal: Thank you 2');
				object.showModal('firefly-thank-you');
			} else if(paramTY==3 && paramStartDate){
				$('#firefly-thank-you .firefly-modal-wrapper.digital').removeClass('digital'); // Sets the view for a non digital thank you modal
				object.showModal('firefly-thank-you');
			} else if(window.location.hash.match('#firefly')=='#firefly'){
				object.showModal(window.location.hash.substring(1));
			}
		},
	/**
	 * Set up the provided modal ID as a GEL modal.
	 */
	buildGelModal: function(modalId){
		var modal=$('#'+modalId);
		GEL.thepage.pageinfo.firefly.modal = new GEL.widget.modal({
			innerId:modalId,
			innerHeight:modal.height(),
			innerWidth:modal.width(),
			offsetHeight:modal.height(),
			offsetWidth:modal.width()
		});
		if(this.options.pagerestricted > 0) $('#modalouter').remove(); // #modalouter_dm is presistent in this scenario so we don't need another bg overlay.
	},
	/**
	 * Add the given slide jQuery object to the given GEL modal ID.
	 */
	buildSlide: function(slide, modalId){
		this.lastModal.id=GEL.thepage.pageinfo.firefly.modal.innerId;

		// Slide exists in the provided modal.
		var current=$('#'+GEL.thepage.pageinfo.firefly.modal.innerId);
		var wrapper=$('#'+GEL.thepage.pageinfo.firefly.modal.innerId+' .firefly-modal-wrapper');

		// Store needed modal info.
		this.lastModal.height=current.height();
		this.lastModal.width=current.width();
		this.lastModal.slideParent=modalId;

		// Set height of the current modal.
		current.height(this.lastModal.height);

		// Set height of slide to height of current modal.
		slide.height(current.height());

		// Move the slide modal to the current modal wrapper.
		slide.appendTo(wrapper);

		// Show the slide.
		slide.css('right','-400px');
		slide.show();

		// Animate the slide to slide into view on top of the modal.
		slide.animate({'right':'0'},'slow');
	},
	showModal: function(modalId, params) {
		var object=this;
		
		// if cookies aren't enabled, nothing else matters
		if ( !object.atyponAPI.cookie.isEnabled() ) {
			modalId = 'firefly-cookies';
		}
		
		var modal = $('#'+modalId);

		// if we're on the page version, don't try to show
		if (modal.hasClass('page'))
			return false;
		
		// just in case it is still showing in some case.
		GEL && GEL.firefly && GEL.firefly.loadingModal && GEL.firefly.loadingModal.hide();

		if (modalId === 'firefly-subscribers-only') { // this is the same as dontmiss just with different headline copy
			modalId = 'firefly-dontmiss';
			modal = $('#'+modalId);
			modal.find('h2').html('This content is exclusive to subscribers only.');
		} else if (modalId === 'firefly-login' || modalId === 'firefly-register') {
			var redirectURL = (params && params.redirectURL) ? params.redirectURL : '';
			modal.find(':input[name=redirectURL]').val(redirectURL.replace(/#.*/, ''));
			if (params && params.mode && params.mode == 'bonus') {
				modal.find(':input[name=registerBonus]').val('1');
			}
		}
		
		if (modal.length>0) {
			// styling based on whether the user is logged in or not.
			if (this.atyponAPI.is('loggedIn')) {
				modal.addClass('logged-in');
			} else {
				modal.removeClass('logged-in');
			}
		
			if(GEL.thepage.pageinfo.firefly.modal){
				if($('#'+GEL.thepage.pageinfo.firefly.modal.innerId).is(":hidden")||GEL.thepage.pageinfo.firefly.modal.innerId=='firefly-dontmiss'){
					if(GEL.thepage.pageinfo.firefly.modal.innerId=='firefly-dontmiss'){
						GEL.thepage.pageinfo.firefly.modal.hideModal();
					}
					delete GEL.thepage.pageinfo.firefly.modal;
				}
			}

			// Check for slide.
			var slide=$('#'+modalId+' .firefly-modal-slide');

			if(slide.length>0&&GEL.thepage.pageinfo.firefly.modal){
				// There's a slide and a visible modal.
				this.buildSlide(slide, modalId);
			}else if(slide.length>0&&!GEL.thepage.pageinfo.firefly.modal){
				// There's a slide, but no set firefly modal.
				// Set the default "parent" to the slide as the login modal.
				this.buildGelModal('firefly-login');
				GEL.thepage.pageinfo.firefly.modal.showModal();
				this.buildSlide(slide, modalId);
			}else if(slide.length<1&&GEL.thepage.pageinfo.firefly.modal){
				// There's no slide but a visible firefly modal.
				GEL.thepage.pageinfo.firefly.modal.hideModal();
				this.buildGelModal(modalId);
				GEL.thepage.pageinfo.firefly.modal.showModal();
			}else if(slide.length<1&&!GEL.thepage.pageinfo.firefly.modal){
				// There's no slide and no firefly modal.
				this.buildGelModal(modalId);
				GEL.thepage.pageinfo.firefly.modal.showModal();
			}
			
			// initialize the GD selects after the modal shows.
			if(typeof $.fn.gdselect=='function'){
				modal.find('select').gdselect();

				// hack to get around case where modal is shown after input invalidated
				modal.find('.fp-selectcontainer + .input-note').each(function (i, e) {
					
					var note = $(e);
					var sc = note.prev('.fp-selectcontainer');
					var select = sc.find('select');
					var button = sc.find('.fp-selectbutton');
					
					// move input note inside the container and right after the select
					select.after(note);
					
					if (select.hasClass('form-ui-invalid'))
						button.addClass('form-ui-invalid');
				});
			}
			
			if(typeof slide == 'object' && slide.length>0){
				$(document).trigger('firefly',['slideModal.open',{}]);
			}else{
				$(document).trigger('firefly',['modal.open',{}]);
			}
		} else {
			// REMOVED interferes with redirect page alert("Modal '" + modalId + "' not found.");
		}
	},
	closeModal: function(modalId) {
		var object = this;
		var modal = $('#'+modalId);

		if (modal.length>0) {
			// Check for slide.
			var slideSelector = modalId+' .firefly-modal-slide';
			var slide=$('#'+slideSelector);
			
			if(slide.length>0){
				// Slide exists in the provided modal.
				$(document).trigger('firefly',['slideModal.close',{}]);
				
				object.hideModalMsg(slideSelector);

				// Animate the slide out of view.
				slide.animate({'right':'-400'},'slow','swing',function(){
					// Move slide back to original location.
					object.resetSlide($(this),object.lastModal.slideParent);
					object.hideModalMsg($('#'+object.lastModal.slideParent+' form').id);
					// slide.remove();
					// unset fixed height
					$('#' + object.lastModal.id).height('auto');					
				});
			} else if (GEL.thepage.pageinfo.firefly.modal.innerId == modalId) {
				$(document).trigger('firefly',['modal.close',{}]);

				object.hideModalMsg(modalId);
				
				// hide the main modal if it is the one we're asking to close
				GEL.thepage.pageinfo.firefly.modal.hideModal();
				
				if (object.options.pagerestricted > 0) object.showModal(object.options.pagerestricted==2 ? 'firefly-subscribers-only' : 'firefly-dontmiss');
			}
		}	
	},
	resetSlide: function(slide, slideParentId){
		slide.hide();
		slide.css('right','0px');
		slide.appendTo($('#'+slideParentId));
	},
	loadingModal: {
		source: [],
		target: [],
		hide: function(skipChildren){
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			if (this.target.length < 1)
				return false;
			
			// Remove the loading div from the target.
			this.target.children('.loading').remove()
			// Show the target's children.
			if(typeof skipChildren=='undefined'||!skipChildren){
				this.target.children(':not(.firefly-modal-slide)').show();
			}
			// Reset source and target.
			this.source=[];
			this.target=[];
		},
		/**
		 * Show the loading modal by passing in the jQuery DOM object of the sliding modal that's the target and the message to display.
		 */
		show: function(modalObject, msg, cancelable){
			var lmObject = this;
			// Get the target object.
			this.target=modalObject;
			// Get the source object.
			this.source=$('#firefly-loading .loading');
			// Apply the source's height to the target.
			this.source.height(this.target.height());
			// Apply the source's width to the target.
			this.source.width(this.target.width());
			// Set the message.
			this.source.children('.message').html(msg);
			
			if (cancelable) {
				var cancelButton = $('<button onclick="GEL.firefly.loadingModal.hide()" class="secondary">Cancel</button>');
					
				this.source.children('.message').after(cancelButton);
			}
			
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.timeout = setTimeout(function() {lmObject.display(lmObject);}, 200); // Don't actually *show* the loading Modal unless it takes more than 200ms to execute.
		},
		display: function(lm){
			lm.timeout = null;
			// Hide target's children.
			lm.target.children().hide();
			// Move the loading modal to the modalObject.
			lm.source.clone().appendTo(lm.target);
		}
	},
	submitModalForm: function(formObject,callback){
		var url=formObject.attr('action');
		$.post(
			url,
			formObject.serialize(),
			function(data){
				callback($.parseJSON(data));
			}
		);
	},
	hideModalMsg: function(formObject){
		var pDiv=$('#'+formObject);//.closest('.firefly.modal');
		var msgBox=pDiv.find('.message').first();
		if(msgBox.is(":visible")){
			msgBox.slideUp(100);
			msgBox.removeClass('success').removeClass('error');
			msgBox.hide().html('');
		}
	},
	showModalMsg: function(formObject,msg,grow,type,title){
		var pDiv=$('#'+formObject);
		var origDivHeight=pDiv.height();
		var pDiv2=$('#'+formObject).closest('.firefly.modal');
		var msgBox=pDiv.find('.message').first();
		var origContents = msgBox.html();
		var htmlContents = '<div class="message-body">' + msg + '</div>';
		msgBox.removeClass('success').removeClass('error').addClass(type).html(htmlContents);
		if (title) {
			msgBox.prepend('<h5 class="message-header">' + title + '</h5>');
		}

		if (msgBox.is(":visible"))
			msgBox.slideUp(100);
			
		msgBox.delay(200).slideDown('fast',function(){
				if(grow){
					pDiv.css({'height':origDivHeight+msgBox.outerHeight()});
					pDiv2.css({'height':origDivHeight+msgBox.outerHeight()});
					}
				if (typeof(GEL.thepage.pageinfo.firefly.modal) == 'object')
					GEL.thepage.pageinfo.firefly.modal.onResize();
				});
	},
	/**
	 * Initializes our global webshim setup (if custom shim behaviors don't need to be applied globaly include them elsewhere)
	 */
	initWebshims: function(options){
		var object = this;

		if(typeof options == 'undefined') options = {};
		
		// shimmy time
		$.webshims.setOptions({
						basepath: '/odygel/lib/3rdparty/jquery/js-webshim/minified/shims/', // Define the path to the shims.
						forms: { overrideMessages: true }
					});
		
		$.webshims.polyfill('forms'); // Initiate the polyfill.
		
		// generic custom error messages
		$.webshims.validityMessages['en'] = {
				valueMissing: "Required.",
				typeMismatch: { defaultMessage: "Invalid format.", email: "Invalid email address." },
				patternMismatch: { defaultMessage: "Invalid format.", email: "Invalid email address.", password: "Doesn't meet requirements."},
				rangeUnderflow: { defaultMessage: "Too small." }, rangeOverflow: { defaultMessage: "Too big." } // not really using these but webshims requires them
			};
			
		$.webshims.ready('DOM forms', function(){
			// Location for custom shim behavior
			if(options.suppressValidation !== true){
				object.initWebshimsValidation();
			}
		});

	},
	initWebshimsValidation: function(){
		// webshim fancy error messages that match the mock
		$('.firefly form :input').bind('changedvaliditystate changedinvalid changedvalid', function(e) {
			var target = $(e.target);
			var validationMessage = target.prop('validationMessage');
			var note = target.next('.input-note')[0];
			
			// we only care about cases where either the validitystate changes or changedinvalid is called and there's no note already
			if (validationMessage && (e.type == 'changedvaliditystate' || !note)) {
				if (note) {
					$(note).find('span').html(validationMessage);
				} else {
					target.after('<div class="input-note"><span>' + validationMessage + '</span></div>');
				}
				target.addClass('has-note');
			} else {			
				target.removeClass('has-note');
				target.next('.input-note').remove();
			}
		}).bind('firstinvalid', function(e) {
			e.preventDefault();
			return false;
		});
	},
	
	/**
	 * Initializes our Atypon API helper.
	 */
	initAtyponAPI: function(){
		var object = this;
		
		// Life is good and it makes me so API I wanna smile.
		if(typeof object.atyponAPI == 'undefined'){
			object.atyponAPI = new GEL.atyponAPI({
				'cookieDomain': this.options.cookieDomain,
				'keepNclickOnLogin': this.options.keepNclickOnLogin,
				'limitOne': this.options.limitOne,
				'limitTwo': this.options.limitTwo,
				'api': {'domain': this.options.apiUrl, 'global': this.options.apiUrlGlobal},
				'marketId':object.getMarketId(),
				'relatedMarketIDs': this.options.relatedMarketIDs
			});
		}
	},
	initCountdownSlider: function() {
		var object = this;

		/**
		 * Countdown slider object that controls the slider.
		 */
		object.countdownSliderObject = function() { this.init(); };
		object.countdownSliderObject.prototype = {
			options: {
				display: false,
				state: ''
			},
			slider: '',
			init: function() {
				// Deactivate the next story slider.
				nextSlider=false;
				// Make sure the HTML object exists.
				var persistNotif = $('#persistNotif');
				if (persistNotif.length < 1) { return; }

				this.setDisplay();
				this.setState();
				this.buildHtml();
				if (this.options.display) {
					this.buildSlider();
				}
				object.atyponAPI.cookie.events.bind('EMETA_NCLICK.set', function() { object.countdownSlider.buildHtml(); });
			},
			buildHtml: function() {
				var persistDangle = $('#persistNotif .dangle');
				var persistSubscribe = $('#persistSubscribe');
				var loggedIn = object.atyponAPI.is('loggedIn');
				var limit = '', numberText = '', numberWrapClass = '';

				// Get the number left to view.
				var left = object.atyponAPI.getCountRemainingFree();
				if (object.options.limitOne != object.options.limitTwo) {
					// When there are two limits.
					// Set number text and the number wrap class.
					if (object.atyponAPI.is('loggedIn')) {
						limit = object.options.limitTwo;
						persistSubscribe.find('.registerLink').hide();
					} else {
						limit = object.options.limitOne;
						persistSubscribe.find('.subscribeLink').hide();
					}
					if (left > 0 && left == 1) {
						numberText = 'article left.';
					} else {
						numberText = 'articles left.';
					}
					switch (true){
						case left == limit - 1:
							numberWrapClass = 'noNumber';
							numberText = 'Enjoy a limited number of articles over the next ' + object.atyponAPI.options.nclickPeriod + ' days.';
						break;
						case left == 0:
							numberWrapClass = 'noNumber';
							numberText = 'This is your last article.';
						break;
					}
				} else {
					// When there is one limit.
					if (left > 0 && left == 1) {
						numberText = 'article left.';
					} else {
						numberText = 'articles left.';
					}
					switch (true){
						case left == object.options.limitTwo - 1:
							numberWrapClass = 'noNumber';
							numberText = 'Enjoy a limited number of articles over the next ' + object.atyponAPI.options.nclickPeriod + ' days.';
						break;
						case left == 0:
							numberWrapClass = 'noNumber';
							numberText = 'This is your last article.';
						break;
					}
					persistSubscribe.find('.registerLink').hide();
				}
				// Apply the number text and the number wrap class.
				$('.firefly-numberLeft').html(object.atyponAPI.getCountRemainingFree());
				if (numberWrapClass) {
					$('.firefly-numberLeftWrapper').addClass(numberWrapClass);
				} else {
					$('.firefly-numberLeftWrapper').removeClass('noNumber');
				}
				$('.firefly-numberLeftWrapper .firefly-numberText').html(numberText);
				if (loggedIn) {
					persistDangle.find('.account-lookup').attr('href', GEL.firefly.options.apiUrl + '/account/#linkAccounts');
				}
			},
			buildSlider: function() {
				this.slider = new GEL.widget.slider('Nav','persistNotif',{
					close: '<img src="//'+GEL.thepage.pageinfo.url.hostname+'/odygci/p1/icnSlider_close.png" alt="close" width="12" height="12" />',
					direction: 'left',
					handle: '<img src="//'+GEL.thepage.pageinfo.url.hostname+'/odygci/firefly/slider-open-left.png" alt="open" width="14" height="66" />',
					jQuery: $,
					offset: 'instant',
					state: this.options.state
				});
			},
			hide: function(hideHandle) {
				hideHandle = (typeof hideHandle != 'undefined' && hideHandle != true) ? false : hideHandle;
				this.slider.hide(hideHandle);
			},
			setDisplay: function() {
				this.options.display = false;
				var authorized = object.atyponAPI.is('authorized');
				var viewart = window.location.pathname.indexOf('/viewart/');
				var viewsto = window.location.pathname.indexOf('/viewstory/');
				var viewint = window.location.pathname.indexOf('/viewint/');
				var viewliv = window.location.pathname.indexOf('/viewliv/');
				var viewgal = window.location.pathname.indexOf('/viewgal/');
				var viewcom = window.location.pathname.indexOf('/comments/');
				if (viewart != 0 && viewart != 9 && 
					viewsto != 0 && viewsto != 9 && 
					viewint != 0 && viewint != 9 && 
					viewliv != 0 && viewliv != 9 && 
					viewgal != 0 && viewgal != 9 &&
					viewcom != 0 && viewcom != 9 &&	!authorized 
					&& GEL.thepage.pageinfo.categoryid!='SPECIALOFFER'
					&& GEL.thepage.pageinfo.categorymainid!='usatodayarticle'
					&& !object.options.pagerestricted
		//			&& object.atyponAPI.getCount() <= pnLimit
					&& (
						GEL.thepage.pageinfo.type=='article'
						|| GEL.thepage.pageinfo.type=='gallery'
						|| GEL.thepage.pageinfo.type=='Video'
						|| (
							typeof cobrandSliderEnable!='undefined'
							&& cobrandSliderEnable==true
							&& !authorized
						)
					)
				) {
					this.options.display = true;
				}
			},
			setState: function() {
				// Set up slider state.
				this.options.state = '';
				var limit = '', remaining = object.atyponAPI.getCountRemainingFree(), viewed = object.atyponAPI.getCount();
				if (object.options.limitOne != object.options.limitTwo) {
					if (object.atyponAPI.is('loggedIn')) {
						limit = object.options.limitTwo;
					} else {
						limit = object.options.limitOne;
					}
				} else {
					limit = object.options.limitTwo;
				}
				remaining = limit - viewed;
				if (remaining < 0){
					remaining = 0;
				}
				// Set the slider's state to 'handle' (closed) on load when remaining does not equal 0, 1, 2, or limitTwo - 1.
				if (remaining > 1 && remaining < limit - 1) {
					this.options.state = 'handle';
				}
			},
			show: function() {
				if (typeof this.slider != 'object') {
					this.buildSlider();
				}
				this.slider.show();
			}
		};

		$.getScript('//'+GEL.thepage.pageinfo.url.hostname+'/odygel/lib/widgets/articletools/slider.js', function(){ object.countdownSlider = new object.countdownSliderObject(); });
	},
	/**
	 * Initialized the ability to customize the visual of our <select> tags.
	 */
	initGDSelect: function(){
		var object = this;
		
		// Check for page.
		var page=$('.firefly.page');
		if(page.length>0 && typeof $.fn.gdselect=='function'){
			page.find('select').gdselect();
		}
/*	This may have been causing some problems, so disabling for now.
		// Handle placeholder styling for select boxes (without our fancy gd-select)
		// This is a fallback if gd-select isn't doing its job (it will not be in used if gd-select is doing it's job).
		$('.firefly select').change(function (e) {
			var select = $(e.target);

			if ($(e.target.options[e.target.selectedIndex]).hasClass('placeholder')) {
				select.addClass('placeholder');
				select.setCustomValidity('');
			} else {
				select.removeClass('placeholder');
				if (typeof select.data('removedPlaceholders') == 'undefined') {
					select.data('removedPlaceholders', select.find('option.placeholder').detach()); // a non-placeholder has been selected so remove all placeholder options
			}
			}
		});
		$('.firefly form').bind('reset', object.resetSelect);
	},
	resetSelect: function(e){
		var form = $(e.target);

		form.find('select').each(function(index, select) {
			$(select).prepend($(select).data('removedPlaceholders'));
			$(select).removeData('removedPlaceholders');
			setTimeout("$('#" + $(select).attr('id') + "').change()", 1); // just have to delay until after the event handler
		});
*/
	},
	/**
	 * This controls the population of the email, first name, and last name fields on login and register pages.
	 * This was moved client-side due to server-side limitations.
	 */
	initLoginRegPages: function(){
		var object = this;
		// Only run this on login and registration pages.
		if(GEL.thepage.pageinfo.key!='COMO'&&GEL.thepage.pageinfo.type!='section'){
			return false;
		}
		// Get query string parameters.
		var claimCode=object.getParameterByName('claimCode');
		var claimEmail=object.getParameterByName('claimEmail');
		var email=object.getParameterByName('email');
		var firstName=object.getParameterByName('firstName');
		var lastName=object.getParameterByName('lastName');
		var zipCode=object.getParameterByName('zip');
		var phoneNumber=object.getParameterByName('phoneNumber');

		//var linkAccounts=object.getParameterByName('linkAccounts');
		var linkAccount_unitNumber=object.getParameterByName('linkAccount_unitNumber');
		var linkAccount_publicationCode=object.getParameterByName('linkAccount_publicationCode');
		var linkAccount_accountNumber=object.getParameterByName('linkAccount_accountNumber');
		
		var promoCode=object.getParameterByName('promoCode');
		var daysFree=object.getParameterByName('daysFree');
		var mode=object.getParameterByName('mode');
		if(email!=''&&email!=null){
			$('#firefly-login-email,#firefly-register-email,#firefly-register-email-confirm,#firefly-temporary-password-email').val(email);
			if(claimCode!=''&&claimCode!=null){
				// Hide the account lookup box.
				$('.current-subscriber-link').hide();
				// Store the email in the hidden form field so the user can change their email.
				if (claimEmail != '' && claimEmail != undefined) {
					$('#firefly-register form').find(':input[name=claimEmail]').val(claimEmail);
					$('#firefly-login form').find(':input[name=claimEmail]').val(claimEmail);
				} else {
					$('#firefly-register form').find(':input[name=claimEmail]').val(email);
					$('#firefly-login form').find(':input[name=claimEmail]').val(email);
				}
			}
			// Populate the temporary password page.
			$('#firefly-temporary-password .msgEmail').html(email);
		}
		//if(linkAccounts!=''&&linkAccounts!=null){
		//	$(':input[type=hidden][name=link_accounts]').val(linkAccounts);
		//	}
		$(':input[type=hidden][name=linkAccount_unitNumber]').val(linkAccount_unitNumber);
		$(':input[type=hidden][name=linkAccount_publicationCode]').val(linkAccount_publicationCode);
		$(':input[type=hidden][name=linkAccount_accountNumber]').val(linkAccount_accountNumber);
		if(firstName!=''&&firstName!=null){
			$('#firefly-register-name-first').val(firstName);
		}
		if(lastName!=''&&lastName!=null){
			$('#firefly-register-name-last').val(lastName);
		}
		if(zipCode!='' && zipCode!=null){
			$('#firefly-register-zip').val(zipCode);
			if(phoneNumber!='' && zipCode!=null){
				$('#firefly-register .firefly-modal-wrapper .firefly-modal-noslide .current-subscriber-link').hide();
				$('#firefly-register .firefly-modal-wrapper .firefly-modal-noslide h2').html('Register to continue');
				$('#firefly-register .firefly-modal-wrapper .firefly-modal-noslide .body .gnp').first().html('Create an account to activate your full digital access.');
			}
		}
		if(promoCode!=='' && promoCode!==null){
			//Populate the promo code input
			$(':input[name=promoCode]').val(promoCode);
			$('#firefly-register .firefly-modal-wrapper .firefly-modal-noslide .current-subscriber-link').hide();
			//Add the promotional offer text above the header
			$('#firefly-register .firefly-modal-wrapper .firefly-modal-noslide h2').before('<div class="promoHeader">Promotional Offer</div>');
			//Modify the header
			if(daysFree !== '' && daysFree!==null && daysFree!=='undefined' && typeof daysFree !== 'undefined'){
				$(':input[name=daysFree]').val(daysFree);
				$('#firefly-register .firefly-modal-wrapper .firefly-modal-noslide h2').html('Register now for a free ' + daysFree + '-day trial*');
			} else {
				$('#firefly-register .firefly-modal-wrapper .firefly-modal-noslide h2').html('Register now for a free trial*');
			}
			//Modify the subtext below the header
			$('#firefly-register .firefly-modal-wrapper .firefly-modal-noslide .body p').first().html('Create an account to activate your full digital access.');
		}
		if (mode != '' && mode != null) {
			$(':input[name=registerBonus]').val('1');
		}
	},
	
	/**
	 */
	login_form_facebook_login: function(event, object)
	{
		if(typeof object == 'undefined') var object = this;
		
		var button = $(event.target);
		var container = button.closest('.firefly');
		
		// reset the non-Facebook form
		container.find('form').each(function (i, e) { e.reset(); });
		
		var modal = button.closest('.firefly.modal');

		// disabled for now: https://gannett.jira.com/browse/COMO-134?focusedCommentId=16414&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-16414
		// object.loadingModal.show(modal, 'Attempting to login with Facebook', true);
		
		try {
			FB.login(function(r){object.login_form_facebook_callback(r, object, modal)}, {scope: 'email,user_birthday'});
		} catch (e) {
			object.showModalMsg(container.attr('id'), 'Unable to log in using Facebook at this time.  Please try again later.', false, 'error');
		}
		return false;
	},
	/**
	 */
	login_form_facebook_callback: function(response, object, modal)
	{
		if(typeof object == 'undefined') var object = this;
		
		if (response.status === "connected") {
			// show loading modal while we wait for redirect (COMO-512)
			object.loadingModal.show(modal, 'Processing your login.');
			// Build params.
			var params = {
				'socialId': response.authResponse.userID,
				'socialProvider': 'Facebook',
				'socialToken': response.authResponse.signedRequest,
				'marketId': object.getMarketId()
			};
			
			var redirectUrl = typeof GEL.thepage.pageinfo.firefly.modal=='undefined'?'http://'+GEL.thepage.pageinfo.url.hostname:object.atyponAPI.unprotectUrl(window.location.href);
			
			var promoCode = $('input[name=promoCode]').val();
			if(typeof promoCode === 'undefined' || promoCode === null){
				promoCode = '';
			}
			
			var daysFree = $('input[name=daysFree]').val();
			if(typeof daysFree === 'undefined' || daysFree === null){
				daysFree = '';
			}
			
			if(promoCode !== ''){
				redirectUrl = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=promotion';
				if(daysFree !== ''){
					redirectUrl += '&daysFree=' + daysFree;
				}
			}
			
			if(object.atyponAPI.cors==false){
				if(window.location.href.indexOf('como?screen=')>=0){
					window.location.href='/section/como?screen=flashRequired';
				}else{
					object.showModal('firefly-flash-required');
				}
				return false;
			}
			// Try to get the email address from the Facebook account.
			try {
				FB.api('/me', function(meResponse){
					params.email=meResponse.email;
					object.atyponAPI.loginFromSocial({
						'params': params,
						'success': function(a, b, c) { object.apiLoginSuccessful(a, b, c, redirectUrl, object); },
						'failure': function(msg) { object.apiLoginFailureFB(msg, object, params); },
						// When running from a modal, send back to the current page. Otherwise, send to the front page.
						'redirect': redirectUrl,
						'claimCode': $(':input[name=claimCode]').val(),
						'acceptedSocialId': response.authResponse.userID,
						'promoCode': promoCode,
						'daysFree': daysFree
					});			
				});
			} catch (e) {
				object.loadingModal.hide();
			}
		} else {
			object.loadingModal.hide();
		}
	},
	
	registrationRedirectUrl: function(email, claimCode, modalId, object, zipCode, firstName, lastName)
	{
		// after successful login send the user here
		var redirectUrl=object.options.urlAfterRegistration;
		if(typeof claimCode!='undefined' && claimCode!=''){
			redirectUrl='http://'+GEL.thepage.pageinfo.url.hostname+'/';
		}else{
			// Append the required ICON information.
			if(object.options.reg2payment){
				if(modalId=='firefly-register'){
					var baseHref = $.data(document.body,'iconBaseHref');
					if($('#fod-primaryPub').length>0){
						// Print.
						var param = {
							email: email,
							firstName: firstName,
							lastName: lastName,
							zipCode: zipCode,
							primaryPub: $('#fod-primaryPub').val(),
							secondaryPub: $('#fod-secondaryPub').val()
						};
						if( $('#fod-rateCode').val() != '' ) param.rateCode =  $('#fod-rateCode').val();
						redirectUrl = object.buildIconUrl(baseHref,param);
					}else if($('#fod-digital-primaryPub').length>0){
						// Digital.
						var param = {
							type: 'digital',
							email: email,
							firstName: firstName,
							lastName: lastName,
							zipCode: zipCode,
							primaryPub: $('#fod-digital-primaryPub').val(),
							webAccessPubId: $('#fod-digital-webAccessPubId').val()
						};
						if( $('#fod-digital-rateCode').val() != '' ) param.rateCode =  $('#fod-digital-rateCode').val();
						redirectUrl = object.buildIconUrl(baseHref,param);
					}
				}
			}else{
			
				redirectUrl=$('#'+modalId).find(':input[name=redirectURL]').val();
				if ((/^http(|s)%3A%2F%2F/).test(redirectUrl)) // Detect if the url looks encoded.
					redirectUrl = decodeURIComponent(redirectUrl);
				if (email){
					var newParams = new Array();
					newParams.email = email;
					newParams.firstName = firstName;
					newParams.lastName = lastName;
					newParams.zipCode = zipCode;
					redirectUrl=object.buildIconUrl(redirectUrl,newParams);
				}
			}
		}
		return redirectUrl;
	},

	/**
	 * Doubles as a place to call things once FB.Init is finished.
	 */
	facebookInitialGetLoginResponse: function(response, object)
	{
		if(typeof object == 'undefined') var object = this;
		// FB.Event.subscribe('auth.statusChange', function(e){GEL.firefly.facebookStatusChange(e)});
		// console.log(this);
		// the above event won't fire until it changes again, so call it the first time now.
		object.facebookStatusChange(response,object);
	},
	
	
	/**
	 * 
	 */
	facebookStatusChange: function(response, object)
	{
		// console.log('facebookStatusChange');

		if(typeof object == 'undefined') var object = this;
		if (response.status == 'connected') {
			GEL.firefly.loadingModal.show($('#firefly-register'), 'Processing Facebook information');
			try {
				FB.api('/me', function(meResponse){object.facebookPopulateForms(meResponse, response, object.loadingModal.target, object);});
			} catch (e) {
				object.loadingModal.hide();
			}
		} else if (response.status == 'not_authorized') {
			object.registerFormFBNotAuthorized(object);
			object.loginFormFBNotAuthorized(object);
		}
	},
	
	/**
	 * 
	 */
	facebookPopulateForms: function(meResponse, authResponse, modal, object)
	{
		if(typeof object == 'undefined') var object = this;

		// Get the share access claim code.
		var claimCode=$('#firefly-register.page form input[name=claimCode]').val();
		if(claimCode==undefined){
			claimCode='';
		}

		// try logging them in.
		var socialParams = {
				'socialProvider': 'Facebook',
				'socialId': authResponse.authResponse.userID,
				'socialToken': authResponse.authResponse.signedRequest,
				'marketId': object.getMarketId()
			};

		// this first login is really only used to retrieve the email address they're registered with so we can populate the redirect URL.
		object.atyponAPI.loginFromSocial({
			'params': socialParams,
			'disableGo': true,
			'success': function(msg, user, data) {
				var redirectUrl = object.registrationRedirectUrl(user.email, claimCode, modal.attr('id'), object, user.zipCode, user.firstName, user.lastName);
			
				// success so this time actually log in now that we can do the redirect now that we have the registered email address
				object.atyponAPI.loginFromSocial({
					'params': socialParams,
					'success': function(a, b, c) {
						// success so this time actually log in now that we can do the redirect
						object.apiLoginSuccessful(a, b, c, redirectUrl, object);
					},
					'failure': function(msg) {
						// this is actually the common case - they're not already registered with the site
						object.registerFormFillFromFB(meResponse, authResponse, object);
						object.loadingModal.hide();
					},
					'redirect': redirectUrl,
					'claimCode': claimCode,
					'acceptedSocialId': authResponse.authResponse.userID
				});

			},
			'failure': function(msg) {
				// this is actually the common case - they're not already registered with the site
				object.registerFormFillFromFB(meResponse, authResponse, object);
				object.loadingModal.hide();
			}
		});
		
	},
	
	/**
	 * 
	 */
	facebookRegisterFormLogin: function(event, object)
	{
		if(typeof object == 'undefined') var object = this;
		var button = $(event.target);
		var container = button.closest('.firefly');

		try {
			FB.login(function(r){object.facebookRegisterFormCallback(r, object)}, {scope: 'email,user_birthday'});
		} catch (e) {
			object.showModalMsg(container.attr('id'), 'Unable to log in using Facebook at this time.  Please try again later.', false, 'error');
		}
		return false;
	},
	
	/**
	 * 
	 */
	facebookRegisterFormCallback: function(response, object)
	{
		if(typeof object == 'undefined') var object = this;
		object.facebookStatusChange(response);
	},
	
	/**
	 * 
	 */
	loginFormFBConnected: function(response, object)
	{
		if(typeof object == 'undefined') var object = this;
		if(!$('#firefly-login .message.error').is(':visible')){
			object.showModalMsg('firefly-login', response.first_name + ', you are connected to this site through Facebook.  Use the <label for="firefly-login-login-with-facebook" class="a-link">Login with Facebook</label> button below to log in.');
		}
	},

	/**
	 * 
	 */
	registerFormFBNotAuthorized: function(object)
	{
		if(typeof object == 'undefined') var object = this;
		object.showModalMsg('firefly-register', 'You are logged into Facebook.  If you want to register using Facebook, use the <label for="firefly-register-login-with-facebook" class="a-link">Login with Facebook</label> button below.');
	},

	/**
	 * 
	 */
	loginFormFBNotAuthorized: function(object)
	{
		if(typeof object == 'undefined') var object = this;
		var container = $('#firefly-login');
		var button = container.find('.body.separated').find('button.image');
		
		//button.hide();
		
//		GEL.firefly.showModalMsg('firefly-login', 'You are logged into Facebook, but not a subscriber.');
	},
	
	/**
	 * 
	 */
	registerFormFillFromFB: function(response, authResponse, object)
	{
		if(typeof object == 'undefined') var object = this;
		var container = $('#firefly-register');
		var form = container.find('form').first();

		// fill in fields that we can
		form.find(':input[name=first_name]').val(response.first_name).change();
		form.find(':input[name=last_name]').val(response.last_name).change();
		form.find(':input[name=email]').val(response.email).change();
		form.find('#' + form.find(':input[name=email]').prop('id') + '-confirm').val(response.email).change();
		form.find(':input[name=gender]').val(response.gender.charAt(0).toUpperCase() + response.gender.slice(1)).change();
		form.find(':input[name=birth_year]').val(response.birthday.split('/')[2]).change();
		
		// Facebook social ID
		form.find(':input[name=socialId]').val(response.id);
		form.find(':input[name=socialToken]').val(authResponse.authResponse.signedRequest);

		// hide password fields and disable them so validation passes
		form.find('fieldset.password').prop('disabled', true).hide();
		form.find('fieldset.password :input').prop('disabled', true);
		
		// hide keep me signed in if using facebook. let auto-login handle
		form.find('.bottom-buttons label').prop('disabled', true).hide();
		
		// reconfigure form
		container.find('.body.separated').hide();
		
		// go ahead and try to submit the form to cause validation errors on everything that's needed.
		// using button.click instead of form.submit because .submit seems to skip validation
		form.find('button[type=submit]').first().click();
		var fbMessage = $('<div class="message filled-from-facebook">' +
								'<h5 class="message-header"><span class="fb-message">Information below provided by your Facebook account.</span></h5>' +
								'<div class="message-body"><p>Please fill in the highlighted fields.</p><button class="a-link" onclick="$(\'#firefly-register form\')[0].reset();">I don\'t want to use Facebook to register.</button></div>' +
								'</div>'
								);
		container.find('.message').first().after(fbMessage);
		fbMessage.show();
	},
	
	registerFormReset: function(e,object)
	{
		if(typeof object == 'undefined') var object = this;
		var form = $(e.target);
		var container = form.closest('.firefly');

		// enable all fields
		form.find(':input').prop('disabled', false);

		// gdselect
		form.find(':input[name=gender]').change();
		
		// show and re-enable hidden fields and elements
		form.find('fieldset.password :input').prop('disabled', false);
		form.find('fieldset.password').prop('disabled', false).show();
		
		// show keep me signed in if not using facebook
		form.find('.bottom-buttons label').prop('disabled', false).show();
		
		// switch the message back to original
		container.find('.body.separated').show();
		object.hideModalMsg('firefly-register');
		container.find('.message.filled-from-facebook').remove();

		// Facebook social ID
		form.find(':input[name=socialId]').val('');
		form.find(':input[name=socialToken]').val('');
	},
	lookupAccountReset: function(e,object)
	{
		var pDiv = $(e.target);
		object.hideModalMsg(pDiv.closest('.firefly').attr('id') + ' .firefly-modal-slide');
		pDiv.find('.bottom-buttons.third-level').remove();
		pDiv.find('.bottom-buttons.second-level').hide();
		pDiv.find('.bottom-buttons.first-level').show();
		pDiv.find(':input[type=hidden][name=linkAccount_unitNumber]').val('');
		pDiv.find(':input[type=hidden][name=linkAccount_publicationCode]').val('');
		pDiv.find(':input[type=hidden][name=linkAccount_accountNumber]').val('');
		pDiv.find('.innerform').show();
	},
	passwordResetReset: function(e,object)
	{
		var pDiv = $(e.target);
		object.hideModalMsg(pDiv.closest('.firefly').attr('id') + ' .firefly-modal-slide');
		pDiv.find('.bottom-buttons.second-level').hide();
		pDiv.find('.bottom-buttons.first-level').show();
		pDiv.find('#fireflymodal_email').val('');
		pDiv.find('label').show();
	},
	// "reset" validation on form reset
	validationFormReset: function(e)
	{
		var form = $(e.target);
		var container = form.closest('.firefly');

		/*  // failed^H^H^H^H^H in-progress attempt to restore default validation status
		form.find(':input:invalid').each(function(i, e) {
			var field = $(e);
			console.log('invalid: ' + field.attr('name'));
			field.removeAttr('required');
			field.removeAttr('pattern');
			field.change();
			// doesn't work field.bind('invalid', function(e) { debugger; return false; });
			field.prop('disabled', true);
			field.attr('required', true);
			field.prop('disabled', false);
			});
		*/
		
		form.find(':input.form-ui-invalid').each(function(i, e) {
			var field = $(e);
			field.removeClass('has-note');
			field.removeClass('form-ui-invalid');
			field.next('.input-note').remove();
			});
	},
	
	/**
	 * Gets a query string parameter via regex on the window.location
	 */
	initFireflyFods: function(){
		var object = this;
		var hash = window.location.hash.replace(/^#fod/,'');
		$.data(document.body,'iconBaseHref',$('#fod-submit-href').val());
		
		$(window).bind('hashchange', function(){
			//Update Coooooooookie
			object.storeLastPage();
		});
		
		if(typeof object.atyponAPI!='object'){
			// Initialize Atypon API
			object.initAtyponAPI();
		}

		// Attach an onclick event to the FOD select buttons.
		if (!object.topBarInitted) {
			object.events.bind('topBarInitted', function(e, o) {
				o.initFireflyFodsButtons(o);
				o.fodsHashUpdate(hash);
			});
		} else {
			object.initFireflyFodsButtons(object);
			object.fodsHashUpdate(hash);
		}
	},
	initFireflyFodsButtons: function(object) {
		$('.fod-select').click(function(e){
			// Get the FOD ID for ICON.
			var button=$(this);
			var counter=button.val();
			
			// Get current FOD row.
			var fod=button.closest('tr');

			// Set the promo input value to the button's ID.
			$('#fod-rateCode').val($('#fod-'+counter+'-rateCode').val());
			$('#fod-primaryPub').val($('#fod-'+counter+'-primaryPub').val());
			$('#fod-secondaryPub').val($('#fod-'+counter+'-secondaryPub').val());
	
			// Update the next URL.
			var param = {
				'primaryPub': $('#fod-primaryPub').val(),
				'secondaryPub': $('#fod-secondaryPub').val(),
				'rateCode':  $('#fod-rateCode').val()
			};
			var fodHREF;
			if (object.atyponAPI.is('loggedIn') && object.atyponAPI.data.user && object.atyponAPI.data.user.email) {
				param.email = object.atyponAPI.data.user.email;
				param.firstName = object.atyponAPI.data.user.firstName;
				param.lastName = object.atyponAPI.data.user.lastName;
				param.zipCode = object.atyponAPI.data.user.zipCode;
				fodHREF = object.buildIconUrl($.data(document.body,'iconBaseHref'), param);
			} else {
				fodHREF = '/section/como?screen=register&redirectURL=' + encodeURIComponent(object.buildIconUrl($.data(document.body,'iconBaseHref'), param));
			}
			window.location.hash = 'fod'+$(this).closest('tr').index();

			$('#fod-submit').attr('href',object.buildIconUrl(fodHREF,param));

			// Get price and update the total.		
			$('#total').html('$'+parseFloat(Number(fod.find('.price').html().replace(/[^0-9\.]+/g,""))).toFixed(2));
	
			// Hide the clicked button.
			button.hide();
	
			// Show the green checkmark.
			fod.find('.select-wrap img').removeClass('hide');

			// Remove opacity reduction and apply to correct row.
			$('table.fod tr').each(function(i,v){
				var curFod=$(v);
				if(curFod.hasClass('short')){
					return;
				}
				curFod.children('.canfade').stop().animate({opacity:1},'fast');
				if (fod.attr('id') != curFod.attr('id')) {
					curFod.find('.select-wrap img').addClass('hide');
					curFod.find('.select-wrap button').show();
				}
				// Apply opacity reduction table datas with candfade class.
				if(curFod.attr('id')!=''&&curFod.attr('id')!=fod.attr('id')){
					curFod.children('.canfade').stop().animate({opacity:.25},'fast');
				}
			});

			// Activate the next button.
			var s=$('#fod-submit');
			s.removeAttr('disabled').removeClass('disabled').addClass('primary');
		});
		$('.fod-select').removeAttr('disabled').removeClass('disabled');
	},
	fodsHashUpdate: function(hash){
		$('form .fod tr:eq('+(hash)+') .fod-select').click(); 
	},
	/**
	 * Our very own little Newsletter API
	 * Currently can get a users current subscription info and subscribe them to more.
	 */
	initNewsletterAPI: function(){
		GEL.newsletterAPI=function(options){
			if(typeof options.domain == 'undefined') options.domain = ''; // By default we use a relative path. setSubscribe will not work if the domains don't match.
			this.options = options; // Options.
			this.emailB64 = $.base64.encode(this.options.email); // Base64 encoded email address
		}
		GEL.newsletterAPI.prototype={
			/*
			 * Get the user's current subscription info
			 */
			getSubscriptions: function(callback){
				var object = this;
				var d = new Date;
				var url = object.options.domain+'/apps/pbcs.dll/section?category=nletteroptions&email='+object.emailB64+'&format=JSON&time='+d.getTime(); // Build the URL
				$.getScript(url,function(){ // The response should be JS so we use getScript. Cross-Origin safe.
					if(typeof NletterObj != 'undefined' && typeof NletterObj.newsletters != 'undefined'){ // If the returned structure seems sound
						object.newsletters = NletterObj.newsletters.newsletter; // Save the newsletter info to this object.
						if(typeof callback == 'function') callback(); // Fire off the callback.
					}
				});
			},
			/*
			 * Overwrites old subscription options with a new one.
			 */
			setSubscriptions: function(options,callback){
				if(typeof options == 'undefined') var options = {};
				if(typeof options.add == 'undefined') options.add = [];  // Default to not adding any new subscriptions
				if(typeof options.remove == 'undefined') options.remove = []; // Default to not removing any subscriptions
				var object = this;
				var subscriptionArray = [];
				var receiveHTML = '1'; // We assume that user does want emails in HTML format
				for(var i in object.newsletters){ // Loop through all the subscriptions available
					var newSubscribed = object.newsletters[i].Subscribed;
					if(object.newsletters[i].Subscribed == '1' && object.newsletters[i].ReceiveHTML == '0') receiveHTML = '0';  // Check to see if they appear to prefer plain text emails.
					for(var j in options.add){  // Loop through to see if we're adding this newsletter
						if(options.add[j] == object.newsletters[i].CategoryID) newSubscribed = '1';
						break;
					}
					for(var j in options.remove){ // Loop through to see if we're removing this newsletter
						if(options.remove[j] == object.newsletters[i].CategoryID) newSubscribed = '0';
						break;
					}
					var arrayEntry = object.newsletters[i].CategoryID+';'+newSubscribed+';{HTML_OR_PLAINTEXT}'; // Format it for the QSP
					subscriptionArray.push(arrayEntry);
				}
				var subscriptionString = subscriptionArray.join('|').replace(/{HTML_OR_PLAINTEXT}/g, receiveHTML);  // Join all the subscription options with a "|" for the QSP. Also assign all the newsletters to either prefer Plain-Text (0) or HTML(1).
				var url = object.options.domain+'/apps/pbcs.dll/section?category=nlettersignup&email='+object.emailB64+'&xml='+subscriptionString; // Build the URL
				$.get(url,function(){ // Make the call. NOT Cross-Origin safe!
					if(typeof callback == 'function') callback();
				});
			}
		};
	},
		
	apiLoginFailure: function(msg, data, object, modalId) {
		if(typeof object == 'undefined') var object = this;
		if(typeof modalId == 'undefined') var modalId = 'firefly-login';
		
		var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
		
		// now see if we can be more specific than the Unexpected Error
		switch (msg.code) {
			case 110:	// Required parameter not provided
				userMsg = 'Username and password are both required.';
				break;
			
			// I believe all these cases are effectively "bad username or password".
			case 220:	// ObjectNotFoundException [Basically "user not found"]
				userMsg = 'Sorry, either your email or password is incorrect. Would you like to <a href="/section/subscription-options">subscribe</a>?';
				$('#firefly-login-email,#firefly-login-account,#firefly-login-password').addClass('form-ui-invalid');
				break;

			case 303:	// User has resetPassword set to true and must reset password.
				var email=$('#firefly-login-email').val();
				
				//since we will not have the resetToken available on the reset your password page, we have to supply the email in order to process the reset.
				window.location.href = '/section/como?screen=password_reset&flow=temporary&email=' + email + '&resetToken=' + data.response.resetToken;
				
				return false;
				break;
			case 300:	// Invalid username/password combination
			case 310:	// Invalid password [Shouldn't actually be thrown by login, but just in case]
				var href = $('.firefly.page').length > 0 ? '/section/como?screen=password-reset' : '#firefly-password-reset';
				
				userMsg = 'Sorry, your email or password is incorrect. Would you like to <a href="'+href+'">reset your password</a>?';
				$('#firefly-login-email,#firefly-login-account,#firefly-login-password').addClass('form-ui-invalid');
				
				$('#firefly-login .current-subscriber-link').hide();
				break;
			case 301: // User has UA account, but not Atypon.
				userMsg = 'Your email is associated with a registered account, but our sites now offer full access to paying subscribers only. Would you like to <a href="/section/subscription-options">subscribe now</a>?';
				$('#firefly-login-email,#firefly-login-password').addClass('form-ui-invalid');
				break;
			case 302: // User has ICON account, but not Atypon.
				userMsg = 'We\'ve detected that the email you\'ve provided matches an active subscriber. To continue, please <a href="/section/como?screen=account-lookup">activate your digital access</a>.';
				$('#firefly-login-email,#firefly-login-password').addClass('form-ui-invalid');
				break;
			case 380: // A Facebook user attempted to log in using standard credentials.
				userMsg = 'This account has been registered with Facebook. <a href="#" onclick="GEL.firefly.login_form_facebook_login(event)">Log in with Facebook</a>?';
				$('#firefly-login-email,#firefly-login-password').addClass('form-ui-invalid');
				break;
			case 720:	// License for linked account belongs to locked user
				userMsg = "Could not link account. Please call customer service for assistance.";
				break;
			case 721:	// License can't be linked for some reason - have to check the array of returned info
				userMsg = "Could not link one or more accounts. Please call customer service for assistance.";
				break;
			case 770:	// Claim ticket has already been claimed
				userMsg = 'This account has already been claimed. Log in to continue.'; // https://gannett.jira.com/browse/COMOACCT-249?focusedCommentId=21033&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-21033
				// console.log(msg);
				break;
				
			// These are all very bad cases.  Listing explicitly the ones we know are awful before the default case for clarity.
			case 320: 	// Accounts were merged. [This shouldn't happen here because it should follow the success route instead, so if it makes it here something is very wrong.]
			case 210:	// eRightsException
			case 200:	// RemoteException
			default: 	// if we didn't match anything, something bad is going on
				// console.warn(msg);
				break;
		}
		object.apiLoginFailurePasswordResetToggle('reset');

		object.loadingModal.hide();
		object.showModalMsg(modalId, userMsg, false, 'error');
	},
	apiLoginFailureFB: function(msg, object, params, modalId) {
		if(typeof object == 'undefined') var object = this;
		if(typeof modalId == 'undefined') var modalId = 'firefly-login';
		
		var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
		
		// now see if we can be more specific than the Unexpected Error
		switch (msg.code) {
			case 380: // A standard credential user user attempted to log in using Facebook.
				userMsg = 'Your account is not connected to Facebook.  Please login with your email address and password.';
				$('#firefly-login-email').focus();
			break;
			case 390:	// Invalid username/password combination
				// Any site where these two don't match allow registration without subscription
				if (object.options.limitOne != object.options.limitTwo && object.options.limitOne != 0) {
					try {
						FB.getLoginStatus(function(authResponse) {
							if (response.status === 'connected') {
								FB.api('/me', function(meResponse){
									object.showModal('firefly-register');
									object.registerFormFillFromFB(meResponse, authResponse, object);
									object.showModalMsg('firefly-register', "We couldn't find an account matching your Facebook account.  Please register below.");
								});
							}
						});
						
						// skip the rest of this
						return;
					} catch (e) {}
				}else{
					// A non-Facebook user attempted to log in using Facebook.
					userMsg = 'This account was not registered with Facebook.<br>Please log in below.';//This needs to be verified before committing.
					$('#firefly-login-email,#firefly-login-password').addClass('form-ui-invalid');
					if(typeof params.email=='string'){
						$('#firefly-login-email').val(params.email);
					}
					$('#firefly-login .current-subscriber-link').hide();
				}		
				break;
			
			case 390:	// Invalid username/password combination
				// Any site where these two don't match allow registration without subscription
				if (object.options.limitOne != object.options.limitTwo && object.options.limitOne != 0) {
					try {
						FB.getLoginStatus(function(authResponse) {
							if (response.status === 'connected') {
								FB.api('/me', function(meResponse){
									object.showModal('firefly-register');
									object.registerFormFillFromFB(meResponse, authResponse, object);
									object.showModalMsg('firefly-register', "We couldn't find an account matching your Facebook account.  Please register below.");
								});
							}
						});
						
						// skip the rest of this
						return;
					} catch (e) {}
				}else{
					userMsg = '<p>Sorry, we could not find your Facebook account. Would you like to <a href="/section/subscription-options">subscribe</a>?</p>';//This needs to be verified before committing.
				}
			
				break;
			
			case 301: // User has UA account, but not Atypon.
				userMsg = 'Your email is associated with a registered account, but our sites now offer full access to paying subscribers only. Would you like to <a href="/section/subscription-options">subscribe now</a>?';
				break;
			case 302: // User has ICON account, but not Atypon.
				userMsg = 'We\'ve detected that the email you\'ve provided matches an active subscriber. To continue, please <a href="/section/como?screen=account-lookup">activate your digital access</a>.';
				break;
			
			// I believe all these cases are effectively "bad username or password".
			case 220:	// ObjectNotFoundException [Basically "user not found"]
			case 300:	// Invalid username/password combination
			case 310:	// Invalid password [Shouldn't actually be thrown by loginFromSocial, but just in case]
			case 360:	// Invalid Facebook token
				userMsg = '<p>Unable to log in with Facebook.  If you are a subscriber use the form below to log in.</p><p>Not a subscriber?  <a href="/section/subscription-options">View subscription options</a>.</p>'; break; 
				// console.log(msg);
				break;
				
			// These are all very bad cases.  Listing explicitly the ones we know are awful before the default case for clarity.
			case 110:	// Required parameter not provided
			case 320: 	// Accounts were merged. [This shouldn't happen here because it should follow the success route instead, so if it makes it here something is very wrong.]
			case 210:	// eRightsException
			case 200:	// RemoteException
			default: 	// if we didn't match anything, something bad is going on
				// console.warn(msg);
				break;
		}
		object.apiLoginFailurePasswordResetToggle('reset');

		object.loadingModal.hide();
		object.showModalMsg(modalId, userMsg, false, 'error');
	},
	apiLoginFailurePasswordResetToggle: function(error) {
		var object = this;
		var html = error=='forgot' ? 'Forgot' : 'Reset';
		$('#firefly-login .forgot .verb').html(html);
	},
	apiLoginSuccessful: function(msg, user, data, redirectUrl, object) {
		// Build top bar object.
		object.topBar.buildOptions();
		object.topBar.updateCookie();
		object.topBar.updateTopBar();

		if (!redirectUrl) {  // don't bother doing anything as long as a redirect is going to happen anyway.
			if(typeof object == 'undefined') var object = this;

			object.loadingModal.hide();
			object.showModalMsg('firefly-login', user.fullName + ' logged in.', false, 'success');
		}
	},
	/**
	 * Function to validate a share token and send user to login or registration when valid.
	 */
	retrieveAccounts:function(){
		var object = this;
		var phoneNumber=object.getParameterByName('phone');
		var zipCode=object.getParameterByName('zip');
		object.atyponAPI.lookupAccount({
			'params': {
				'zip': zipCode,
				'phoneNumber': phoneNumber
			},
			'success': function(msg, accounts) {
				var firstName = accounts.subscriberSearch[0].firstName;
				var lastName = accounts.subscriberSearch[0].lastName;
				var redirectUrl = '/section/como?screen=register&firstName='+firstName+'&lastName='+lastName+'&zip='+zipCode+'&phoneNumber='+phoneNumber;
				var redirectUrlParam=object.getParameterByName('redirectUrl');
				if (redirectUrlParam != null) {
					redirectUrl += '&redirectUrl=' + redirectUrlParam;
				}
				window.location.href=redirectUrl;
			},//apiSuccess,
			'failure': function(msg, accounts) {
				var userMsg="We're sorry. There was an error retrieving your account.";
				switch (msg.code) {
					case 110:	// Required parameter not provided
						userMsg = 'Please ensure that all required fields have been populated and try again.';
						break;
					case 305:	// User is in feed with a different marketId
					case 220:	// Required parameter not provided
						userMsg = 'No accounts were found with the information provided. Please try again or contact customer service for assistance.';
						break;
					case 304:   // User is in feed with a marketId
						var hrefLogin = $('.firefly.page').length > 0 ? '/section/como?screen=login' : '#firefly-login-register';
						var hrefReset = $('.firefly.page').length > 0 ? '/section/como?screen=password-reset' : '#firefly-password-reset';
						userMsg = 'This subscription is already associated with an account. Please <a href="' + hrefLogin + '">log in</a> or use <a href="' + hrefReset + '">forgot password</a>.';
						break;
				}

				var msg=$('#firefly-loading .message');
				$('#firefly-loading .loading').css({'background-image':'none', 'width':'500px', 'padding-bottom':'5px'});
				msg.css({'background-image':'none', 'width':'500px', 'padding-bottom':'5px'});
				$('#firefly-loading').css('width','500px');
				msg.addClass('error');
				msg.html(userMsg);
				$('#firefly-loading .loading .footer').show();
			}//apiLookupFailure
		});
	},
	
		acquireSlot:function(){
		var object = this;
		//alert("In firefly.acquireSlot");

		var url=window.location.href;
		
					// Check login status.
					if (object.atyponAPI.is('loggedIn')) {
							// request a slot to be taken (API will not double-charge slots)
							//alert("calling api.aqcquireSlot");
							object.atyponAPI.acquireSlot({
								'params': {'url': url},
								'success': function(msg, response, data){
							
								},
								'failure': function(msg) {

				/*if(msg.code == 770){
					messageDiv.html('The claim ticket has already been claimed.');
				}else{
					messageDiv.html('There was an error with your token.');
				}*/
								}
							});
					} // end if logged in 
	}, // end acquireSlot


	
	
	
	addClaimTicket:function(){
		var object = this;

		// Get claim ticket token.
		var token=object.getParameterByName('token');

		// Get the claim ticket from the API.
		var url='http://'+GEL.thepage.pageinfo.url.hostname+'/section/como?';
		var qsp={};
		object.atyponAPI.getClaimTicketWithToken({
			'params': {'claimTicketToken': token},
			'success': function(msg, ticket, data){
				// Check to see if the user exists in Atypon.
				if (parseInt(ticket.currentGifteeUserId) > 0) {
					// Check login status.
					if (object.atyponAPI.is('loggedIn')) {
						// Compare emails to make sure that the claim code corresponds to the logged in user.
						if(object.atyponAPI.data.user.email.toLowerCase()==ticket.gifteeEmail.toLowerCase()){
							// Apply the shared subscription.
							object.atyponAPI.updateClaimTicket({
								'params': {
									'claimCode': ticket.claimCode
								},
								'success': function(msg, response, data){
									// Send to home page.
									window.location.href='http://'+GEL.thepage.pageinfo.url.hostname+'/';
								},
								'failure': function(msg) {
									// Provide error message.
									var msg=$('#firefly-loading .message');
									$('#firefly-loading .loading').css('background-image','none');
									msg.addClass('error');
									msg.html('There was an error accepting your token.');
								}
							});
						}else{
							// Provide error message.
							var msg=$('#firefly-loading .message');
							$('#firefly-loading .loading').css('background-image','none');
							msg.addClass('error');
							msg.html('The user you are logged in with cannot accept this token.');
						}
					}else{
						// User found. Redirect to login page.
						qsp={
							'screen':'login',
							'email':ticket.gifteeEmail,
							'claimCode':ticket.claimCode
						};
						window.location.href=url+$.param(qsp);
					}
				} else {
					// User not found. Redirect to register page.
					qsp={
						'screen':'register',
						'email':ticket.gifteeEmail,
						'firstName':ticket.gifteeFirstName,
						'lastName':ticket.gifteeLastName,
						'claimCode':ticket.claimCode
					};
					window.location.href=url+$.param(qsp);
				}
			},
			'failure': function(msg) {
				var messageDiv=$('#firefly-loading .message');
				$('#firefly-loading .loading').css('background-image','none');
				messageDiv.addClass('error');
				if(msg.code == 770){
					messageDiv.html('The claim ticket has already been claimed.');
				}else{
					messageDiv.html('There was an error with your token.');
				}
			}
		});

	},
	/**
	 * Function to return the site code. This is done to support non-GEL versions of the Firefly object.
	 */
	getMarketId: function(){
		var object = this;
		if(object.options.marketId!=''){
			return object.options.marketId;
		}else{
			return GEL.thepage.pageinfo.sitecode.toUpperCase();
		}
	},
	/**
	 * Gets a query string parameter via regex on the window.location
	 */
	getParameterByName: function(name){ // stupid jQuery not having a way to get QSP values.  this is from http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript/5158301#5158301
		var search = (arguments.length > 1) ? arguments[1] : window.location.search;
	    var match = RegExp('[?&]'+name+'=([^&]*)').exec(search);
	    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	},
	/**
	 * Removes the passed in query string parameter from the passed in url.
	 * Returns the new url.
	 */
	removeParameter:function(url, name){
		var urlparts= url.split('?');
		
		if (urlparts.length>=2){
			var urlBase=urlparts.shift(); //get first part, and remove from array
			var queryString=urlparts.join("?"); //join it back up
			var prefix = encodeURIComponent(name)+'=';
			var pars = queryString.split(/[&;]/g);
			for (var i= pars.length; i-->0;){//reverse iteration as may be destructive
				if (pars[i].lastIndexOf(prefix, 0)!==-1){//idiom for string.startsWith
					pars.splice(i, 1);
				}
			}
			url = pars.length>0?urlBase+'?'+pars.join('&'):urlBase;
		}
		return url;
	},
	/**
		Description:
			Builds the parameters needed by ICON.
		
		Usage: 
			object.buildIconUrl(url,{
				type: 'digital',
				email: object.atyponAPI.data.user.email
			})
	 */
	buildIconUrl: function(url,params){
		// Use webAccessPubId for digital.
		if(typeof params.type!='undefined'&&params.type=='digital'){
			if(typeof params.webAccessPubId!='undefined'&&params.webAccessPubId!=''){
				params.secondaryPub=params.webAccessPubId;
			}else{
				params.secondaryPub=params.primaryPub;
			}
		}

		// Use secondaryPub for print.
		if(typeof params.type=='undefined'||params.type=='print'){
			if(typeof params.primaryPub!='undefined'&&(typeof params.secondaryPub=='undefined'||params.secondaryPub=='')){
				params.secondaryPub=params.primaryPub;
			}
		}
		// TODO: Remove atypnid once ICON no longer requires it.
		var newUrl = url;
		if(params.email) newUrl = newUrl.replace('{EMAIL_ADDRESS}',encodeURIComponent(params.email));
		if(params.firstName) newUrl = newUrl.replace('{FIRST_NAME}',encodeURIComponent(params.firstName));
		if(params.lastName) newUrl = newUrl.replace('{LAST_NAME}',encodeURIComponent(params.lastName));
		if(params.zipCode) newUrl = newUrl.replace('{ZIP_CODE}',encodeURIComponent(params.zipCode));
		if(params.primaryPub) newUrl = newUrl.replace('{PRIMARY_CODE}',encodeURIComponent(params.primaryPub));
		if(params.secondaryPub) newUrl = newUrl.replace('{SECONDARY_CODE}',encodeURIComponent(params.secondaryPub));
		if(params.rateCode) newUrl = newUrl.replace('{RATE_CODE}',encodeURIComponent(params.rateCode));
		return newUrl;
	},
	promoCodeFailure: function(msg, object, messageId) {
		if(typeof object == 'undefined') var object = this;
		if(typeof messageId == 'undefined') var messageId = 'promoForm';

		// Set the default error message.
		var userMsg = object.atyponAPI.unexpectedError + ' <p class="message-details">[Error ' + msg.code + ': ' + msg.message + ']</p>';
		// Now see if we can be more specific than the Unexpected Error
		switch (msg.code) {
			case 770:	// Claim ticket already redeemed.
				userMsg = 'That code has already been redeemed.';
			break;
			case 780:	// Claim ticket not found.
				userMsg = 'The code you entered was not found.';
			break;
			case 797: // Can not claim ticket before effective date.
				userMsg = 'The code cannot be claimed outside of the effective date.';
			break;
			default:
				userMsg = 'The promotional code you entered is invalid.';
			break;
		}
		object.showModalMsg(messageId, userMsg, false, 'error');
	},
	promoCodeSuccess: function(promo, user, object) {
		if(typeof object == 'undefined') var object = this;
		// Forward the user to the thank you page.
		window.location.href = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/thankyou-page-newsletters?scenario=promotion&email=' + user.email + '&daysFree=' + promo.daysFree;
	},
	/**
	 * Stores the user's last page for when they go through the subscription process.
	 */
	storeLastPage: function(){
		var object=this;
			
		var category=GEL.thepage.pageinfo.categoryid.toLowerCase();
		
		if (category != 'como'){
			var url = object.atyponAPI.unprotectUrl(window.location.href);

			object.atyponAPI.cookie.set('ERIGHTS_BACK', $.base64.encode(url), 2, '/', object.atyponAPI.options.cookieDomain);
			if (category != 'subscription-options' 
				&& category != 'subscription-delivery' 
				&& category != 'thankyou-page'
				&& category != 'promocode'
			) {
				object.atyponAPI.cookie.set('ERIGHTS_RETURN', $.base64.encode(url), 2);
			}
		}
	},
	/**
	 * Reloads the current page when no firefly modal is visible.
	 */
	refreshPage: function (){
		// Check to see if any modals are visible before reloading.
		if(typeof GEL.thepage.pageinfo.firefly.modal!='object'||!$('#'+GEL.thepage.pageinfo.firefly.modal.innerId).is(":visible")){
			window.location.reload();
		}else{
			setTimeout(GEL.firefly.refreshPage, fireflyRefreshMils);
		}
	},
	/**
	 * Sets up the Firefly Top Bar with stored information from a cookie.
	 */
	preInitFireflyTopBar: function(){
		var object = this;

		// Init Atypon API.
		object.initAtyponAPI();

		object.topBarObject = function(source) { this.init(source); };
		/**
		 * Top Bar object that controls the bar's appearance.
		 */
		object.topBarObject.prototype = {
			defaultOptions:{
				loggedIn: false,
				name: '',
				saxotechUser: false,
				authorized: false,
				subscribed: false,
				accessRemoved: false, //This corresponds to paid access being removed.
				accessRevoked: false, //This corresponds to shared access being revoked.
				promoExpired: false, //This corresponds to access from a promotional code expiring.
				myAccountUrl: '',
				ssoLastChecked: 0
			},
			options:{},
			init: function(source) {
				var bar=this;
				bar.buildOptions(source);
				bar.updateTopBar();
			},
			updateCookie: function(){
				var bar=this;
				object.atyponAPI.cookie.set('ERIGHTS_TOPBAR', $.base64.encode(bar.buildObject(bar.options, 'json')));
			},
			buildObject: function(options, format) {
				var bar=this;
				var json = (typeof format=='undefined'||format!='json') ? false : true;
				var topBar=(json) ? '{' : {};
				for(key in bar.defaultOptions){
					if(json){
						topBar+='"'+key+'":';
						if(typeof bar.defaultOptions[key]=='boolean' || typeof bar.defaultOptions[key]=='number'){
							if(typeof options=='undefined'||typeof options[key]=='undefined'){
								topBar+=bar.defaultOptions[key]+',';
							}else{
								topBar+=options[key]+',';
							}
						}else{
							if(typeof options=='undefined'||typeof options[key]=='undefined'){
								topBar+='"'+bar.defaultOptions[key]+'",';
							}else{
								topBar+='"'+options[key]+'",';
							}
						}
					}else{
						topBar[key] = (typeof options == 'undefined' || typeof options[key] == 'undefined') ? bar.defaultOptions[key] : options[key];
					}
				}
				if(json){
					topBar=topBar.substring(0, topBar.length-1);
					topBar+='}';
				}
				return topBar;
			},
			buildOptions: function(source){
				var bar=this;
				source=(typeof source!='undefined'&&source!='cookie') ? '' : source;
				if(source=='cookie'){
					var cookie=object.atyponAPI.cookie.get('ERIGHTS_TOPBAR');
					if(cookie==null){
						bar.options=bar.buildObject({});
					}else{
						bar.options=$.parseJSON($.base64.decode(cookie));
					}
				}else{
					var value='';
					for(key in bar.defaultOptions){
						switch(key){
							case 'authorized':
							case 'loggedIn':
							case 'saxotechUser':
							case 'subscribed':
								value=object.atyponAPI.is(key);
							break;
							case 'name':
								var u = (typeof object.atyponAPI.data.user!='undefined') ? object.atyponAPI.data.user : {};
								if(typeof u.welcomeName!='undefined'&&u.welcomeName!=''){
									value=u.welcomeName;
								}else if(typeof u.firstName!='undefined'&&u.firstName!=''||u.firstName!=null){
									value=u.firstName;
								}else if(typeof u.email!='undefined'&&u.email!=''||u.email!=null){
									value=u.email;
								}else{
									value='';
								}
							break;
							case 'accessRemoved':
								value = false;
								var u = (typeof object.atyponAPI.data.user!='undefined') ? object.atyponAPI.data.user : {};
								if(typeof u.notifyPaidAccessRemoved!='undefined'&&u.notifyPaidAccessRemoved!=''){
									value=u.notifyPaidAccessRemoved;
								}
							break;
							case 'accessRevoked':
								value = false;
								var u = (typeof object.atyponAPI.data.user!='undefined') ? object.atyponAPI.data.user : {};
								if(typeof u.notifySharedAccessRemoved!='undefined'&&u.notifySharedAccessRemoved!=''){
									value=u.notifySharedAccessRemoved;
								}
							break;
							case 'promoExpired':
								value = false;
								var u = (typeof object.atyponAPI.data.user!='undefined') ? object.atyponAPI.data.user : {};
								if(typeof u.notifyPromoAccessExpired!='undefined'&&u.notifyPromoAccessExpired!=''){
									value=u.notifyPromoAccessExpired;
								}
							break;
							case 'myAccountUrl':
								value = false;
								var u = (typeof object.atyponAPI.data.user!='undefined') ? object.atyponAPI.data.user : {};
								if(typeof u.accountManagementUrl!='undefined'&&u.accountManagementUrl!=''){
									value=u.accountManagementUrl;
								}
							break;
							case 'ssoLastChecked':
								value = 0;
								if (typeof bar.options.ssoLastChecked == 'number') {
									value = bar.options.ssoLastChecked;
								}
							break;
						}
						bar.options[key]=value;
					}
				}
			},
			processData: function() {
				object.topBar.buildOptions();
				object.topBar.updateCookie();
				object.topBar.updateTopBar();
			},
			updateTopBar: function(){
				var bar=this;

				var loginLink		=$('#login-container .login');
				var logoutLink		=$('#login-container .logout');
				var subscribeLink	=$('#login-container .subscribe');
				var activateLink	=$('#login-container .activate');
				var persistNotif	=$('#persistNotif');
				var dontmissLogin	=$('#firefly-dontmiss .anonymous');
				var subscribeLogin	=$('.options-wrapper .login');
				var subscribePromos	=$('.subscribe_promo_wrapper');
				var myAccountLink 	=$('.accountLink');
				var newslettersLink	=logoutLink.find('.newsletters');

				if(bar.options.loggedIn){
					// Check for stand-alone account lookup page and redirect.
					if($('#firefly-account-lookup-page').length>0){
						window.location.href=GEL.firefly.options.apiUrl+'/account/#linkAccounts';
					}

					// Change the activate link to point to the accounts page.
					activateLink.find('a').attr('href', GEL.firefly.options.apiUrl+'/account/#linkAccounts');

					// Truncate long names so it doesn't break the nav
					if (bar.options.name.length > 10) {
						bar.options.name=bar.options.name.substr(0, 10) + "&hellip;";
					}
					logoutLink.find('.name').html(bar.options.name);

					// Hide newsletters.
					if(!bar.options.saxotechUser){
						newslettersLink.hide();
					}

					loginLink.removeClass('gel-hidden').hide();
					logoutLink.show().removeClass('gel-hidden');
					dontmissLogin.hide();

					// Hide the Subscribe and Activate links when the user is authorized.
					if(bar.options.authorized){
						if(bar.options.subscribed){
							subscribeLink.hide();
							subscribePromos.hide();
						}else{
							subscribeLink.show().removeClass('gel-hidden');
							subscribePromos.show().removeClass('gel-hidden');
						}
						activateLink.hide();
						persistNotif.hide();
					}else{
						subscribeLink.show().removeClass('gel-hidden');
						activateLink.show().removeClass('gel-hidden');
						persistNotif.show();
						subscribePromos.show().removeClass('gel-hidden');
					}
					
					// If myAccountUrl exists in the topbar, replace all links to my account with that url
					if(bar.options.myAccountUrl !== null && bar.options.myAccountUrl !== ''){
						myAccountLink.attr('href',bar.options.myAccountUrl);
						newslettersLink.find('a').attr('href',bar.options.myAccountUrl + "newsletters/index");
					}
				}else{
					// Change the activate link to point to the modal.
					activateLink.find('a').attr('href', 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/como?screen=account-lookup');
					logoutLink.hide().removeClass('gel-hidden');
					loginLink.show().removeClass('gel-hidden');
					dontmissLogin.show();
					subscribeLink.show().removeClass('gel-hidden');
					activateLink.show().removeClass('gel-hidden');
					subscribeLogin.show().removeClass('gel-hidden');
					subscribePromos.show().removeClass('gel-hidden');
					persistNotif.show();
				}
			}
		};
		object.topBar = new object.topBarObject('cookie');
		// Activate the logout links.
		$('#login-container .logout').find('.link a').click(function(e){
			// Get the logout link.
			var link=$(e.target);
			// Log the user out.
			object.atyponAPI.logout({
				params: {'sessionKey': object.atyponAPI.getSessionKey()},
				reload: false, // we're handling reload below now
				success: logoutCallback,
				failure: logoutCallback
			});
			return false;
			// This should happen on success or failure
			function logoutCallback(){
				// Set all the global cookies to "X" because it doesn't accept empty values.
				var goParams = {
					'at': 'X',
					'autologin': 'X',
					'gcionID': 'X',
					// Follow the logout's link.
					'redirectURL': link.attr('href'),
					'sessionID': 'X'
				};
				object.atyponAPI.go(goParams);
			}
		});
	},
	/**
	 * Sets up Firefly Top Bar with live data from the API.
	 */
	initFireflyTopBar: function(){
		var object = this;
	
		// When logged in, show the logout element and hide the log in.
		var authorized=false;

		var loggedIn=object.atyponAPI.is('loggedIn');
		if(loggedIn){
			//Has the user logged in and received the paid access removed flag?
			if(object.topBar.options.accessRemoved){
				object.onInitShowModal = 'firefly-account-inactive';
			}
			//Has the user logged in and received the shared access removed flag?
			if(object.topBar.options.accessRevoked){
				object.onInitShowModal = 'firefly-shared-revoked';
			}
			//Has the user logged in and their promotional code has expired?
			if(object.topBar.options.promoExpired){
				object.onInitShowModal = 'firefly-promo-expired';
			}
			// Get the user and update the top bar.
			object.atyponAPI.getUser({
				params:{'sessionKey': object.atyponAPI.getSessionKey()},
				success:function(m,u){
					var u = (typeof object.atyponAPI.data.user!='undefined') ? object.atyponAPI.data.user : {};
					if(typeof u.notifyPaidAccessRemoved!='undefined'&&u.notifyPaidAccessRemoved!=''&&u.notifyPaidAccessRemoved==true){
						object.onInitShowModal = 'firefly-account-inactive';
						u.notifyPaidAccessRemoved = false;
					}
					if(typeof u.notifySharedAccessRemoved!='undefined'&&u.notifySharedAccessRemoved!=''&&u.notifySharedAccessRemoved==true){
						object.onInitShowModal = 'firefly-shared-revoked';
						u.notifySharedAccessRemoved = false;
					}
					if(typeof u.notifyPromoAccessExpired!='undefined'&&u.notifyPromoAccessExpired!=''&&u.notifyPromoAccessExpired==true){
						object.onInitShowModal = 'firefly-promo-expired';
						u.notifyPromoAccessExpired = false;
					}
					object.topBar.processData();
					object.events.trigger('topBarInitted', object);
				},
				failure:function(m,u){
					console.log(m);
					// Don't delete the session key when the API can't be reached.
					if (m.code > 0) {
						// The session key is invalid, so delete it.
						object.atyponAPI.cookie.del('ERIGHTS');

						// getUser failed, so try autoLogin
						object.atyponAPI.autoLogin();

						object.topBar.processData();
					}
					object.events.trigger('topBarInitted', object);
				}
			});
		}else{
			object.topBar.processData();
			object.events.trigger('topBarInitted', object);
		}
	},
	initTracking: function (){
		var object = this;
		object.trackingObject = function(){ this.init(); };
		object.trackingObject.prototype = {
			'init': function(){
				var options = {
					'bubble': true // If TRUE bubble up the namespace for all matching cases below.
				};
				var tracking = this;
				var trackEvents = [ // All the events to listen for
					'firefly',
					'atypon'
				];
				$(document).on(trackEvents.join(' '),function(e,c,params){
					tracking.prepareData(e,c,params,options);
				});
			},
			/*
				Preparing event and prop data for a tracking call should occur here.
			*/
			'prepareData': function(e, c, params, options){
				var tracking = this;
				try{
					if(typeof c == 'undefined') var c = '';
					if(typeof params == 'undefined') var params = {};
					
					/*
						NOTE: We are not using jQuery's built in namespace because it only allows multiple bind namespaces to a single trigger namespace and we want the inverse.
					*/
					if(c != '') var namespace = e.type+'.'+c; // If a case was passes the namespace is the event name + the case
					else var namespace = e.type; // If there is no case passed the namespace is just the event name
					
					e.tracking = { // Rather than creating a new object we add a tracking object to the event object.
						'namespace': namespace,
						'props': {},
						'events': []
					}
					
					// Items to track for all
					var container = $('.firefly.page:visible:first, .firefly.modal:visible:first');
					var slider = $(container).find('.firefly-modal-slide:visible:first');
					if(container.length>0 && slider.length>0){
						e.tracking.props.eVar6 = e.tracking.props.prop66 = $(slider).find('h2:first').text().toLowerCase().replace(/\W/g,'-'); // Form name
						if($(slider).has('form')) e.tracking.props.prop65 = $(container).find('h2:first').text().toLowerCase().replace(/\W/g,'-')+' > '+$(slider).find('h2:first').text().toLowerCase().replace(/\W/g,'-');
					}else if(container.length>0){
						e.tracking.props.eVar6 = e.tracking.props.prop66 = $(container).find('h2:first').text().toLowerCase().replace(/\W/g,'-'); // Form name
						if($(container).has('form')) e.tracking.props.prop65 = $(container).find('h2:first').text().toLowerCase().replace(/\W/g,'-');
					}else{
						e.tracking.props.eVar6 = e.tracking.props.prop66 = e.tracking.props.prop65 = 'N/A';
					}
					// Grab the user stored in the API data object or if that hasn't been set yet see if a user object exits in the params being passed
					var user = (typeof object.atyponAPI.data.user != 'undefined')? object.atyponAPI.data.user :((typeof params.response != 'undefined' && typeof params.response.credentialType != 'undefined')? params.response : null );
					e.tracking.props.eVar64 = (user == null)? 'Not Logged In' : ((user.credentialType == 'Facebook')? 'Y' : 'N' ) ;
					
					// Namespaced specifics
					var track = true; // We assume we're tracking but... see default case.
					var nsA = (options.bubble) ? getNamespaceArray(c) : [c] ;
					for(var i=0; i<nsA.length; i++){ var ns = nsA[i]; switch(ns){
							case 'goto':
								e.tracking.props.prop41 = params.link.text();
								break;
							case 'goto.subscribe':
								switch(params.location){
									case 'nav-top':
										e.tracking.events.push('event29');
										break;
									case 'persistent-slider':
										e.tracking.events.push('event30');
										break;
									case 'dont-miss':
										e.tracking.events.push('event31');
										break;
								}
								break;
							case 'modal':
							case 'slideModal':
								// To keep from falling through to default
								break;
							case 'slideModal.open':
							case 'modal.open':
								e.tracking.events.push('event32'); // Show popup
								break;
							case 'slideModal.close':
							case 'modal.close':
								e.tracking.events.push('event33'); // Close popup
								break;
							case 'form.abandon':
								e.tracking.events.push('event14'); // Abandon form event
								break;
							case 'api':
								if(typeof params.description != 'undefined' && typeof params.method == 'string') e.tracking.props.eVar67 = params.method+': '+params.description; // For the most generic of messages.
								break;
							case 'api.error': // For catastrophic errors
								e.tracking.events.push('event16'); // API error
								break;
							case 'api.success':
								if(typeof params.data != 'undefined' && typeof params.data.meta != 'undefined' && typeof params.method == 'string') e.tracking.props.eVar67 = params.method+': '+params.data.meta.message;
								if(params.data.meta.status != 0){ // For errors successfully thrown by the API
									// API Failure
									e.tracking.events.push('event16');
								}else if(typeof params.method == 'string'){
									// API Success (Status 0)
									e.tracking.events.push('event15'); // Generic success

									switch(params.method){
										case 'loginFromSocial':
											e.tracking.events.push('event21'); // FB login
											e.tracking.events.push('event23'); // Any Login
											break;
										case 'login':
											e.tracking.props.eVar64='N'; // Is not Facebook
											e.tracking.events.push('event22'); // Generic login
											e.tracking.events.push('event23'); // Any Login
											break;
										case 'linkAccount':
											e.tracking.events.push('event37'); // Successful account link
											break;
										case 'logout':
										case 'createUser':
											// No custom tracking, but we do want to track.
											break;
										default:
											// Everything else, no tracking
											track = false;
											break;
									}
								}
								break;
							default:
								track = false; // If the item doesn't match any namespace. We don't track it.
								break;
					}}
					if(track) tracking.track(e);
				}catch(err){
					console.log('Tracking: data gathering failed');
				}finally{}
			},
			'track': function(e){
				try{
					GEL.thepage.viewTracker.trackDynamic(true, e.tracking.props, e.tracking.events);
				}catch(err){
					console.log('Tracking: call failed');
				}finally{}
			}
		};
		object.tracking = new object.trackingObject();
		
		/* Tracking helpers */
		
		// This will create an array of all namespaces that the provided namespace can access
		function getNamespaceArray(s){
			var	ar = [],
					nsA = s.split('.'),
					ns = '',
					del = ''; // Dude, you're getting... a delimeter!
			for(var i=0; i<nsA.length; i++){
				if(nsA[i]){
					ns = ns+del+nsA[i];
					ar.push(ns);
					del = '.';
				}
			}
			return ar;
		}
	},
	
	/**
	 * Sets up Firefly Top Bar with live data from the API.
	 */
	overrideReturnUrl: function(){
		var object = this;
		var newReturnUrl = object.getParameterByName('returnUrl');
			
		if(newReturnUrl !== null && newReturnUrl !== ''){
			object.atyponAPI.cookie.set('ERIGHTS_RETURN', $.base64.encode(newReturnUrl), 2);
		}
	},
	/**
	 * Builds the single-sign-on (SSO) iframe. On initial load, this calls the
	 * global get method to get the global session. It runs for both logged
	 * out users to see if the user has a global session--and logged in users--
	 * to make sure the local and global sessions are in sync.
	 */
	ssoBuildIframe: function(event, object) {
		// Before making the iframe, make sure the user is logged in. If they aren't logged in, check the cookie
		//   to make sure it's been 5 minutes since the last check.
		var ssoChecked = Math.round((new Date()).getTime() / 1000);
		if ($('#ssoFrame').length == 0) {
			if (object.atyponAPI.is('loggedIn') ||
				!object.atyponAPI.is('loggedIn') && object.topBar.options.ssoLastChecked + (object.options.ssoCheck * 60) < ssoChecked
			) {
				// Update top bar cookie.
				object.topBar.options.ssoLastChecked = ssoChecked;
				object.topBar.updateCookie();

				// Add the iframe.
				var ssoFrame = $('<iframe id="ssoFrame" name="ssoFrame" src="' + object.options.apiUrlGlobal + '/get?siteToken=' + object.options.ssoSiteToken + '" />');
				ssoFrame.css('display', 'none');
				object.ssoInterval = setInterval(function() {
					if (object.sso == false) {
						// The SSO iframe was not built. Run ssoNotLoggedIn.
						object.ssoNotLoggedIn();
					}
					clearInterval(object.ssoInterval);
				}, 1000 * object.options.ssoTimeout);
				$('body:first').append(ssoFrame);
				object.events.trigger('ssoIframeBuilt', object);
			} else if (!object.atyponAPI.is('loggedIn') && object.topBar.options.ssoLastChecked + (object.options.ssoCheck * 60) >= ssoChecked) {
				object.ssoNotLoggedIn();
			}
		}
	},
	/**
	 * Function the SSO iframe calls when the user has a global session.
	 * If the user isn't logged in locally, logs the user in. If the user
	 * is logged in locally, the two sessions are compared.
	 */
	ssoLogin: function(sessionKey) {
		var object = this;
		if (object.atyponAPI.is('loggedIn')) {
			// The user is logged in locally and globally. Compare the sessions.
			var localKey = object.atyponAPI.getSessionKey();
			if (localKey != sessionKey) {
				// The sessions don't match. Update the global session.
				// Build the parameters for go.
				var goParams = {
					'at': object.atyponAPI.cookie.get('at'),
					'autologin': object.atyponAPI.cookie.get('autologin'),
					'gcionID': object.atyponAPI.cookie.get('GCIONID'),
					'redirectURL': '',
					'sessionID': localKey
				};
				// Update the sso iframe.
				$('#ssoFrame').attr('src', object.atyponAPI.go(goParams, 'url'));
			}
			object.events.trigger('ssoComplete', object);
		} else {
			// The user is logged in globally. Log them in locally.
			object.atyponAPI.getUser({
				params:{'sessionKey': sessionKey},
				success:function(m,u){
					var data	= {
						'meta': m,
						'response': {
							'sessionKey': sessionKey,
							'user': u
						}
					};
					var options	= {
						'disableGo': true
					};
					object.atyponAPI.apiOnLogin(options, data, 'ssoLogin');
					object.topBar.processData();
					object.events.trigger('ssoComplete', object);
				},
				failure:function(){
					object.atyponAPI.autoLogin();
					object.events.trigger('ssoComplete', object);
				}
			});
		}
	},
	/**
	 * Function the SSO iframe calls when the user is not logged in.
	 */
	ssoNotLoggedIn: function() {
		var object = this;
		object.atyponAPI.autoLogin();
		object.events.trigger('ssoComplete', object);
	},
	
	/**
	* Function to handle long titles and shorten them/make font smaller
	*/
	handleOverflow: function(parent, child, fontsize) {
		
		var parent = $(parent);
		var child = $(child);
		var fontsize = fontsize
		var originalFontSize = child.css('font-size');
		var newFontSize = parseFloat(originalFontSize) * fontsize + "px";

		// If the parent is child element is larger in any way, handle it.
		if ((parent.width()+parent.position().left) - (child.width() + child.position().left) < 0 || (parent.height()+parent.position().top) - (child.height() + child.position().top) < 0) {
			child.css('font-size', newFontSize);
			parent.css('overflow', 'hidden');
		}else{ 
			//alert('no change necessary');
		}
	}
};
	"use strict";$.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}($));
	})(fireflyJQuery);
	if(typeof console == 'undefined') var console = {'log':function(m){}};// For the console-less browsers.
	if(!Date.now) { Date.now = function() { return new Date().valueOf(); }}// For IE8 and earlier versions.
}