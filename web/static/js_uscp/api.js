/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

// Sometimes we may not need the full "power" (?) of GEL so this creates a fake GEL object.
if(typeof GEL.atyponAPI!='function'){
if(typeof GEL == 'undefined') GEL = {};
GEL.atyponAPI = function(options){
	var o = this; // Since this can get lost we crate another pointer for it.
	o.init(options);
};
GEL.atyponAPI.prototype = {
	'init': function(options){
		var o = this; // Consistency is good.
		
		o.defaults = {
			'api': {
				'domain': '', // NOTE:  the "/CoMo" endpoint has gone away.  only use root from now on.
				'ext': '', // Method extension
				'global': '',
				'jsonp_cb' : 'callback',
				'timeout': 30000 // is ms
			},
			'cookieDomain': '',
			'keepNclickOnLogin': false,
			'limitOne': 2,
			'limitTwo': 5,
			'nclickPeriod': 30, // in days
			'marketId': '',
			'relatedMarketIDs': '',
			'methods': {},
			'autoPassSessionKey': true, // automatically pass in the session key on all 
			'autoPassMarketId': true, // automatically pass in the market ID on all 
			'messages': {'-1': 'Unable to contact API.', '-2': 'To continue using your current Web browser, Adobe Flash must be installed or upgraded.'} // Define default messages.
		};

		if(typeof options == 'undefined') var options = {}; // If no options were passed define options.
		o.options = fireflyJQuery.extend(true,{},o.defaults,options); // Merge defaults and options.
		
		o.log = []; // Define log
		o.tests = [];
		o.data = {};
		o.cors = o.corsCheck();
		o.cookie.events = fireflyJQuery({});
		
		// if there's an nclick cookie, we need to deal with expiring it properly
		if (o.cookie.get("EMETA_NCLICK")) {
			var nclick_epoch = parseInt(o.cookie.get('EMETA_NCLICK_EPOCH'), 10);

			if (!nclick_epoch // there was an nclick but not nclick_epoch so this is probably someone who last visited the site before this epoch code was added
				|| ((nclick_epoch + o.options.nclickPeriod * 24*60*60*1000) < Date.now())) // old cookie
			{
				o.cookie.set("EMETA_NCLICK_EPOCH", Date.now(), o.options.nclickPeriod);
				
				// if we're on a protected page, redirect to non-protected
				if (window.location.pathname.indexOf('/pro') == 0) {
					o.cookie.set("EMETA_NCLICK", 0, o.options.nclickPeriod);	// 0 because the reload will cause the appropriate increase to 1
					window.location.replace(o.unprotectUrl(window.location.href));
					return;
				} else {
					o.cookie.set("EMETA_NCLICK", 1, o.options.nclickPeriod);	// 1 because we're already on the page that should count as 1
				}
				
				o.cookie.del("EMETA_NCLICK_VISITED");
			}
			
			// keep track of stories already seen and decrement on repeat
			try {
				// we only want to decrement on content we know would have caused the adapter to increment the count
				var lowerloc = window.location.pathname.toLowerCase();
				var viewart = lowerloc.indexOf('/article/');
				var viewstory = lowerloc.indexOf('/story/');
				var viewint = lowerloc.indexOf('/interactive/');
				var viewliv = lowerloc.indexOf('/livestream/');
				var viewvid = lowerloc.indexOf('/videonetwork/');
				var viewgal = lowerloc.indexOf('/apps/pbcs.dll/gallery');
				var incremented = (viewart == 0 || viewstory == 0 || viewint == 0 || viewliv == 0 || viewvid == 0 || viewgal == 0);
				
				var pro = GEL.firefly.getParameterByName('pagerestricted') == 1;
				
				if (incremented || pro) {
					var nclick_visited = o.cookie.get('EMETA_NCLICK_VISITED') || "|";
					var key = GEL.thepage.pageinfo.key;
					
					// videos all share a single pageinfo.key, so we have to pull the video ID out of the URL
					if (key == 'VIDEONETWORK') {
						var videoIdRE = new RegExp('/VideoNetwork/([0-9]+)', 'i');
						
						var match = videoIdRE.exec(GEL.thepage.pageinfo.articleinturl);
						
						key = 'V' + match[1];
					}
					
					if (nclick_visited.indexOf("|" + key + "|") > -1) {
						// this page has already been seen so decrement the cookie which was just incremented (probably, unless the page was loaded from browser cache)
						var min_nclick = nclick_visited.match(/\|/g).length - 1; // never want to decrement if it would make the nclick cookie less than the number of articles we've already seen
						var nclick = o.cookie.get("EMETA_NCLICK");
						if (nclick > 1 && (nclick > min_nclick || pro && (nclick >= min_nclick))) {
							o.cookie.set("EMETA_NCLICK", nclick - 1, o.options.nclickPeriod);
							
							// record that this page was already visited and so the count has been adjusted.  used for foul ball referral correction.
							GEL.thepage.pageinfo.firefly.alreadyVisited = true;
						}
  
						if (pro) { // if we're on a restricted page but we've seen it already, redirect back to the non-restricted version.
							// remove this article from the visited list.  necessary to make the count work right following the redirect.
							o.cookie.set("EMETA_NCLICK_VISITED", nclick_visited.replace("|" + key + "|", "|"), o.options.nclickPeriod);

							window.location.replace(o.unprotectUrl(window.location.href));
							return;
						}
					} else if (!pro) {
						// this page hasn't been seen so record that we've seen it but leave the nclick count alone this first time
						o.cookie.set("EMETA_NCLICK_VISITED", nclick_visited + key + "|", o.options.nclickPeriod);
					}
				}
			} catch (e) {} // probably means this isn't a SAXOTECH page
		} else {
			// just for cleanliness, if there's no nclick cookie make sure there's no "when to expire nclick" cookie
			o.cookie.del("EMETA_NCLICK_EPOCH");

			// just for cleanliness, if there's no nclick cookie make sure there's no "visited articles" cookie
			o.cookie.del("EMETA_NCLICK_VISITED");
		}

	},
	'doMethod': function(name,params,callback,test){
		var o = this; // Consistency is good.
		var d = new Date;
		var url = o.options.api.domain+'/'+name+o.options.api.ext+'?t='+d.getTime(); // The url with a cache killer at the end.
		if(typeof params == 'undefined') var params = {};
		if(o.cors==false){
			var status = o.defaults.messages['-2'];
			o.log.push({
				'description': 'flash',
				'method': name,
				'url': '',
				'params': params,
				'status': status,
				'error': ''
			});
			if(typeof callback == 'function') callback({'meta': {'status': -2, 'message': status}})
		}else{
			// fill in the session key if not already defined and we're supposed to
			if (name!='login'&&o.options.autoPassSessionKey && typeof(params.sessionKey) == 'undefined' && o.getSessionKey())
				params.sessionKey = o.getSessionKey();
				
			// fill in the market ID if not already defined and we're supposed to
			if (o.options.autoPassMarketId && typeof(params.marketId) == 'undefined' && o.options.marketId)
				params.marketId = o.options.marketId;
			
			// API auditing info [COMO-1728]
			params.auditApplicationId = 'Saxotech';
			if (o.is('loggedIn') && o.data && o.data.user && o.data.user.userId)
				params.auditUserInfo = o.data.user.userId;

			o.log.push({
				'description': 'Posting to API',
				'method': name,
				'url': url,
				'params': params
			});
			o.corsPost({
				'type': 'POST',
				'url': url,
				'data': params,
				'dataType': 'text',
				'timeout': o.options.api.timeout,
				'error': function(xhr, status, error){
					var logData = {
						'description': (status=='timeout' ? 'Timeout trying to contact Atypon API' : 'Error trying to contact Atypon API'),
						'method': name,
						'url': url,
						'params': params,
						'status': status,
						'error': error,
						'source': xhr
					};
					o.log.push(logData);
					fireflyJQuery(document).trigger('atypon',['api.error',logData]); // Triggered on all successful calls

					// check to see if this is an flXHR minimum version of Flash error
					var flashProblem = false;
					try {
						flashProblem = (xhr.number == flensed.flXHR.PLAYER_VERSION_ERROR);
					} catch (e) {} // probably failing because this isn't flXHR
					
					if(typeof callback == 'function') callback({'meta': {'status': (flashProblem ? -2 : -1), 'message': status + ': ' + error}});
				},
				'success': function(response){
					var logData = {
						'description': 'Received from API',
						'method': name,
						'url': url,
						'params': params,
						'response': response
					};
					o.log.push(logData);
					var data = logData.data = fireflyJQuery.parseJSON(response);

					fireflyJQuery(document).trigger('atypon',['api.success',logData]); // Triggered on all successful calls
					if(typeof callback == 'function') callback(data);
				}
			});
		}
	},
	/*
		Check to make sure the API can be accessed.
	*/
	'corsCheck':function(){
		if(fireflyJQuery.support.cors /*||typeof XDomainRequest != 'undefined'*/){
			return true;
		}else{ // relying on flensed.flXHR, which has a minimum version requirement
			try {
				try {
					// sometimes the version check below was failing in IE if we didn't try loading first
					var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				} catch (ie) {} // we don't care
				
				// Both swfobject and flensed should be available by now, but check just in case...
				if (swfobject && flensed && flensed.flXHR) {
					// swfobject is available, so check the version of Flash installed
					return swfobject.hasFlashPlayerVersion(flensed.flXHR.MIN_PLAYER_VERSION);
				} else {
					// only test for existence of Flash
					try {
						var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
						if(fo) return true;
					}catch(e){
						if(navigator.mimeTypes ["application/x-shockwave-flash"] != undefined) return true;
					}
				}
			} catch(e) {} // fall through to false
		}
		return false;
	},
	/*
		CORS polyfill for the inadequate.
	*/
	'corsPost': function(options){
		var o = this; // Consistency is good.

		if(fireflyJQuery.support.cors){ // We've got CORS. Mmmm... Pure Rocky Mountain Spring Water..
			fireflyJQuery.ajax(options);
/*	Disabling right now because of problems with IE8 and IE8. -dcm
		}else if(typeof XDomainRequest != 'undefined'){ // We've got CORS' ugly MS twin.
			var xdr = new XDomainRequest();
			xdr.timeout = options.timeout;
			xdr.ontimeout = function(){ // on timeout
				options.error(xdr, "timeout", "XDR Timeout");
			};
			xdr.onerror = function(){  // on error
				options.error(xdr, "error", "XDR Error");
			};
			xdr.onload = function(){  // on success
				options.success(xdr.responseText);
			};
			// The onprogress event must be defined or the post will fail most of the time in IE9.
			xdr.onprogress = function(){};
			xdr.open('POST', options.url, true);
			xdr.send(prepParams(options.data));
*/
		}else{ // We've got nothing so let's give an SWF Pollyfill a chance to shine (via flXHR).
			var flproxy = new flensed.flXHR({
				autoUpdatePlayer: false,
				noCacheHeader: false, // TODO: change this back to true once crossdomain.xml is set up correctly
				instanceId: "flashProxy",
				sendTimeout: options.timeout,
				ontimeout: function(xfr){ // on timeout
					options.error(xfr, "timeout", "flXHR Timeout");
				},
				onerror: function(xfr){ // on error
					options.error(xfr, "error", xfr.toString());
				},
				onreadystatechange: function(xfr){  // on success
					if (xfr.readyState == 4) {
						options.success(xfr.responseText);
					}
				}
			});
			flproxy.open('POST', options.url);
			flproxy.send(prepParams(options.data));
		}

		function prepParams(params){
			var r = '';
			for (key in params) {
				r = r+'&'+key+'='+params[key];
			}
			return r;	
		}
	},
	/*
		Description:
			Finds the correct message to serve up based on the status code passed. If method is passed and the method has messages of it's own these will be used before the defaults are used.
			
		Usage:
			api.msgLookup(0,'getUser')
	*/
	'msgLookup': function(meta,method){
		var o = this; // Consistency is good.
		var msgso = (typeof method == 'undefined' || typeof o.options.methods[method] == 'undefined' || typeof o.options.methods[method].messages) ? {} : o.options.methods[method].messages ; // Prepare for next line's extend.
		var msgs = fireflyJQuery.extend({},msgso,o.options.messages); // Let method specific messages expand upon and/or overwrite the default messages.
		if(typeof meta == 'object' && typeof meta.status != 'undefined' && typeof msgs[meta.status] != 'undefined'){
			return {'code': meta.status, 'message': msgs[meta.status]} 
		}else if(typeof meta == 'object' && typeof meta.status != 'undefined' && typeof meta.message != 'undefined'){
			return {'code': meta.status, 'message': meta.message} 
		 }else{
			return false; // Check to make sure the message passed exists and return the message or a false.
		 }
	},
	'unexpectedError': 'An unexpected error has occurred. Please try again later or contact customer service.',
	/*
		Description:
			???

		Usage 1 (You are setting a password):
			api.createUser({
				'params': {
					'firstName': 'XXXXXXXXXXXXXXXXXX',
					'lastName': 'XXXXXXXXXXXXXXXXXX',
					'password': 'XXXXXXXXXXXXXXXXXX',
					'email': 'testguy@example.com',
					'marketId': 'AZ'
				},
				'success': function(msg,user){ console.log(msg,data) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'createUser': function(options){
		var o = this; // Consistency is good.
		var method = 'createUser';
		if(typeof options.params == 'undefined') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta && data.meta.status == 0){
				// if we're logging them in, have to do all the rest of the post-login functionality.
				if (options.params.authenticateUserInd === true) {
					o.apiOnLogin(options, data, method);
				} else {
					if(typeof options.success == 'function'){
						options.success(o.msgLookup(data.meta,method),data.response.user,data);
					}
					if(typeof(options.redirect) == 'string'){
						window.location.href = options.redirect;
					}
				}

				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Updates user's information. Doesn't return the user's information. But we make sure that we update the local data object on success.

		Usage 1 (You are setting a password):
			api.updateUser({
				'params': {
					'userId': 123,
					'firstName': 'XXXXXXXXXXXXXXXXXX',
					'lastName': 'XXXXXXXXXXXXXXXXXX',
					'email': 'testguy@example.com',
					'marketId': 'AZ'
				},
				'success': function(msg,data){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'updateUser': function(options){
		var o = this; // Consistency is good.
		var method = 'updateUser';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			var success;
			
			if(data.meta.status == 0){
				o.data.user = options.params;
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				success = true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				success = false;
			}

			// Calling this 'finally' instead of 'anycase' works but since it's a reserved word seems like a bad idea
			if(typeof options.anycase == 'function') options.anycase(o.msgLookup(data.meta,method),data);

			return success;
		});
	},
	/*
		Description:
			Gets the promotion associated with a promo code.
		
		Usage:
			api.getClaimTicket({
				'params': {'claimCode': 123},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'getClaimTicket': function(options){
		var o = this; // Consistency is good.
		var method = 'getClaimTicket';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data.response,data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data.response,data);
				return false;
			}
		});
	},	
	/*
		Description:
			Gets the share ticket associated with a token.
		
		Usage:
			api.getClaimTicketWithToken({
				'params': {'token': 123},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'getClaimTicketWithToken': function(options){
		var o = this; // Consistency is good.
		var method = 'getClaimTicketWithToken';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data.response,data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data.response,data);
				return false;
			}
		});
	},
	/*
		Description:
			Acquires a slot for consumption-based licenses (for use in the foulball code)
		
		Usage:
			api.acquireSlot({
				'params': {
					
					'url': 'url'
				},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'acquireSlot': 
	function(options){
		var o = this; // Consistency is good.
		var method = 'acquireSlot';
		if(typeof options.params !== 'object') options.params = {};
		options.params.marketId = o.options.marketId;
		//alert("In api.acquireSlot");
		
		if ((o.is('loggedIn') && o.data && o.data.user && o.data.user.userId) && (o.is('complimentary')))
		{
		//alert("in main IF");
			options.params.sessionKey = o.getSessionKey();			
			options.params.userId = o.data.user.userId;
		}
		else
		{
		  // alert("in else");
			return true; // if user is not logged in, should not be here
			} 
		//alert("about to run actual acquireslot method");
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
			//alert("success");
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data.response,data);
				return true;
			}else{
			//alert("failure:"+data.meta.status);
			//786 is slot already used, though also applies to free content
		//			if (data.meta.status == 786)
			//alert("slot already used: 786");
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	
	/*
		Description:
			Updates the share ticket and activates it for the sharee.
		
		Usage:
			api.updateClaimTicket({
				'params': {
					'claimCode': '17114001gG',
					'password': 'password'
				},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'updateClaimTicket': function(options){
		var o = this; // Consistency is good.
		var method = 'updateClaimTicket';
		if(typeof options.params !== 'object') options.params = {};
		options.params.marketId = o.options.marketId;
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data.response,data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Gets the users information.
		
		Usage:
			api.getUser({
				'params': {'userId': 123},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'getUser': function(options){
		var o = this; // Consistency is good.
		var method = 'getUser';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				o.data.user = data.response;
								
				// if authorized, remove the NCLICK* cookies
				if (o.is('authorized') && !o.options.keepNclickOnLogin) {
					o.cookie.del('EMETA_NCLICK');
					o.cookie.del('EMETA_NCLICK_EPOCH');
					o.cookie.del('EMETA_NCLICK_VISITED');
				}
				
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data.response,data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data.response,data);
				return false;
			}
		});
	},
	/*
		Description:
			Checks the current user and returns true or false depending on condition.
		
		Usage:
			api.is('loggedIn');
	*/
	'is': function(type){
		var o = this; // Consistency is good.
		switch(type){
			// Is the user authorized for this market?
			case 'authorized':
				return (typeof o.data.user == 'object' && o.data.user.hasMarketAccess || o.is('LDAP'));
			break;
			
			// Is user logged in?
			// Note: This only checks the cookie as the API currently does not have a way to validate the session key.
			case 'loggedIn':
				var sessionKey=o.getSessionKey();
				if(sessionKey!=''){
					return true;
				}
				return false;
			break;
			
			// Returns true when the user is a Saxotech user for this market.
			case 'saxotechUser':
				// Make sure user is logged in.
				if(!o.is('loggedIn')){
					return false;
				}
				// See if user has a license.
				if(o.is('authorized')){
					// User has license for this market, check the Saxotech variables.
					var lic=o.data.user.licenses;
					var len=lic.length;
					for(i=0;i<len;i++){
						if(lic[i].marketId==o.options.marketId){
							if(lic[i].saxotechUserCreatedDate!=null&&lic[i].saxotechUserCreatedDate!=null){
								return true;
							}
						}
					}		
				}
				// Fall back to the user's global hideNewslettersLink field.
				if(typeof o.data.user=='object'){
					if(o.data.user.hideNewslettersLink!=undefined&&o.data.user.hideNewslettersLink==false){
						return true;
					}
				}
				return false;
			break;
			
			// Is the user a subscriber?
			case 'subscribed':
				// A user is a subscriber when they are authorized and do not have a userLicenseType of 'paid_shared_subscriber'.
				return (o.is('authorized') && o.data.user.userLicenseType != 'paid_shared_subscriber');
			break;
				
			case 'complimentary':
			if(o.is('authorized')){
					// User has license for this market, check if there is a complimentary one 
					var lic=o.data.user.licenses;
					var len=lic.length;
					for(i=0;i<len;i++){
						if(lic[i].marketId==o.options.marketId){
							if(lic[i].licenseTypeName='Complimentary Subscriber')
							{
								return true;
							}
						}
					}		
				}
			
			// Is the user a Gannett Employee?
			case 'LDAP':
				// A user is a Gannett Employee so they should be authorized but do not have a userLicenceType
				
				if(typeof o.data.user=='object'){
					if( o.data.user.credentialType == "LDAP") {
					return true;
					}
				}
				return false;
			break;
			
			/* // Haven't matched anything, so log a warning
			default:
				console.warn('is(' + type + '): unrecognized type');
			break;
			*/
		}
	},
	/*
		Description:
			Handles functionality that's common between all methods that log the user in (login(), loginFromSocial(), createUser(), etc).
	*/
	'apiOnLogin': function(options, data, method){
		var o = this; // Consistency is good.

		o.data.user = data.response.user;
		o.data.firstLoginInd = (data.response.firstLoginInd == true); // explicit test because i want to make sure it is boolean true not just non-false
		o.data.user.notifyPaidAccessRemoved = (data.response.user.notifyPaidAccessRemoved == true);
		o.data.user.notifySharedAccessRemoved = (data.response.user.notifySharedAccessRemoved == true);
		o.data.user.notifyPromoAccessExpired = (data.response.user.notifyPromoAccessExpired == true);
		
		// if authorized, remove the NCLICK variable
		if (o.is('authorized') && !o.options.keepNclickOnLogin) {
			o.cookie.del('EMETA_NCLICK');
			o.cookie.del('EMETA_NCLICK_EPOCH');
			o.cookie.del('EMETA_NCLICK_VISITED');
		}

		//Store user ID and userLicenseType for tracking.
		o.cookie.set('atyponid', data.response.user.userId);
		o.cookie.set('userLicenseType', data.response.user.userLicenseType);
		
		// The data.response.user object contains preformatted cookies to set.
		if(typeof data.response.user.at!='undefined'){
			// The at cookie is set for the duration of the session.
			//name, value, expires, path, domain
			o.cookie.set('at', data.response.user.at);
		}
		if(typeof data.response.user.GCIONID!='undefined'){
			// The GCIONID cookie is set for 1 day.
			o.cookie.set('GCIONID', data.response.user.GCIONID, 1);
		}
		if(typeof data.response.sessionKey!='undefined'){
			// The ERIGHTS cookie is set to expire at end of session.
			o.cookie.set('ERIGHTS', data.response.sessionKey);
		}
		var goParams = {
			'at':typeof data.response.user.at!='undefined'?data.response.user.at:'',
			'gcionID':typeof data.response.user.GCIONID!='undefined'?data.response.user.GCIONID:'',
			'redirectURL':!options.redirect?window.location.href:options.redirect,
			'sessionID':typeof data.response.sessionKey!='undefined'?data.response.sessionKey:''
		};

		
		if(method == 'changePassword'){
			goParams.redirectURL = 'http://'+GEL.thepage.pageinfo.url.hostname+'/section/como?screen=password_reset_success';
		}

		// Check for share access claim code and update.
		if(options.claimCode!=''&&typeof options.claimCode!='undefined'){
			var updateClaimTicketParams = {
				'params': {
					'claimCode': options.claimCode,
					'password': options.params.password
				},
				'success': function(msg, response, data){
					o.apiOnLoginFinish(options, data, method, goParams);
				},
				'failure': function(msg,data) {
					if(typeof options.failure=='function'){ options.failure(msg,data); }
				}
			};
			if (options.acceptedEmail != '' && options.acceptedEmail != undefined) {
				updateClaimTicketParams.params.acceptedEmail = options.acceptedEmail;
			}
			if (options.acceptedSocialId != '' && options.acceptedSocialId != undefined) {
				updateClaimTicketParams.params.acceptedSocialId = options.acceptedSocialId;
			}
			o.updateClaimTicket(updateClaimTicketParams);
		} else if (options.promoCode!='' && typeof options.promoCode!='undefined') {
			var redeemPromoCodeParams = {
				'params': {
					'claimCode': options.promoCode,
					'email': data.response.user.email,
					'userId': data.response.user.userId,
					'marketId': options.params.marketId
				},
				'success':function(msg, data){
					o.apiOnLoginFinish(options, data, method, goParams);
				},
				'failure': function(msg,data) {
					if(typeof options.failure=='function'){ options.failure(msg,data); }
				}
			}
			o.redeemPromoCode(redeemPromoCodeParams);
		} else if (options.linkAccount_unitNumber && options.linkAccount_publicationCode && options.linkAccount_accountNumber) {
			var linkAccountParams = {
				'params': {
					'email': data.response.user.email,
					'unitNumber': options.linkAccount_unitNumber,
					'publicationCode': options.linkAccount_publicationCode,
					'accountNumber': options.linkAccount_accountNumber
				},
				'success': function(msg,response) { o.apiOnLoginFinish(options, data, method, goParams); },
				'failure': function(msg) { if(typeof options.failure=='function'){ options.failure(msg,data); } }
			};
			o.linkAccount(linkAccountParams);
		} else {
			o.apiOnLoginFinish(options, data, method, goParams);
		}
	},
	/*
		Description:
			Handles functionality that's common between login() and loginFromSocial(), after the isAutoLogin update (if necessary)
	*/
	'apiOnLoginFinish': function(options, data, method, goParams){
		var o = this; // Consistency is good.
		
		if(typeof options.success == 'function'){
			options.success(o.msgLookup(data.meta,method),data.response.user,data);
		}

		if (options.isAutoLogin) {
			o.cookie.set('autologin', data.response.autologin, 30);
			goParams.autologin = data.response.autologin;
		} else if (method == 'login' || method == 'register') {
			o.cookie.del('autologin', '/', o.options.cookieDomain);
		}

		// Decrement the click cookie for unauthorized users.
		if(!o.is('authorized')&&o.getCount()>0){
			o.cookie.set('EMETA_NCLICK', o.getCount()-1, o.options.nclickPeriod);
		}

		// Send welcome email when the option item is true. (True for linked accounts.)
		if(options.sendWelcome&&options.sendWelcome==true){
			// Send welcome email.
			o.sendWelcomeEmail({
				'params': {
					'email': o.data.user.email,
					'marketId': o.options.marketId,
					'sessionKey': o.data.user.sessionkey
				}
			});
		}

		// Get the current URL and redirect the browser to where the login can be completed.
		if(!options.disableGo||options.disableGo==false){
			// if there's a redirectURL param, override
			var overrideRedirect = GEL.firefly.getParameterByName('redirectURL');
			var iconURL = goParams.redirectURL;
			if (overrideRedirect) {
				goParams.redirectURL = overrideRedirect + '?' + fireflyJQuery.param(goParams);
				iconURL = overrideRedirect;
				}
			if(o.data.user && o.data.user.email && o.data.user.zipCode && o.data.user.firstName && o.data.user.lastName){
				var iconURLtest = GEL.firefly.buildIconUrl(iconURL, {'email':o.data.user.email,'firstName':o.data.user.firstName,'lastName':o.data.user.lastName,'zipCode':o.data.user.zipCode});
				goParams.redirectURL = iconURLtest;
				
			} else if (o.data.user && o.data.user.email) {
				var iconURLtest = GEL.firefly.buildIconUrl(iconURL,{'email':o.data.user.email});

				if (iconURLtest != iconURL) // if it changed, this is an ICON URL, so use it
					goParams.redirectURL = iconURL;
			}
				
			o.go(goParams);
		}
	},
	/*
		Description:
			Logs the user in.
		
		Usage:
			api.login({
				'params': {username=practiceuser4, password=password4, marketId=BG},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'login': function(options){
		var o = this; // Consistency is good.
		var method = 'login';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status==0 || data.meta.status==320){ /* 320 is the "Accounts were merged" warning */
				o.apiOnLogin(options, data, method);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Helper wrapper around loginAutomatically.
		
	*/
	'autoLogin': function(){
		var o = this; // Consistency is good.
		
		if ( !o.is('loggedIn') ) {
			var autoLogin = o.cookie.get('autologin');
			
			if (autoLogin) {
				// Build the redirect URL, making sure to excise pagerestriction when present.
				var redirectUrl = window.location.href.replace(window.location.hash, ''); // strip off fragment IDs (which could be #firefly-login, etc)
				if (GEL.firefly.getParameterByName('pagerestricted')!=null){
					// Remove pagerestricted.
					redirectUrl=object.removeParameter(redirectUrl,'pagerestricted');
				}
				
				o.loginAutomatically({
					'params': {
						'autologin': autoLogin
					},
//					'success': function(msg, user, data) {  },
					'failure': function(msg) { o.cookie.del('autologin', '/', o.options.cookieDomain); },
					'redirect': redirectUrl
				});
			}
		}
	},
	/*
		Description:
			Logs the user in with autoLogin cookie.
		
		Usage:
			api.loginAutomatically({
				'params': {autoLogin=XXXYYY, marketId=BG},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'loginAutomatically': function(options){
		var o = this; // Consistency is good.
		var method = 'loginAutomatically';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status==0 || data.meta.status==320){ /* 320 is the "Accounts were merged" warning */
				o.apiOnLogin(options, data, method);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Logs the user in using Facebook.
		
		Usage:
			api.loginFromSocial({
				'params': {'username': 'testguy','sitecode': 'BG'},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'loginFromSocial': function(options){
		var o = this; // Consistency is good.
		var method = 'loginFromSocial';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status==0 || data.meta.status==320){ /* 320 is the "Accounts were merged" warning */
				o.apiOnLogin(options, data, method);

				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},

	/*
		Description:
			Logs the user out.
		
		Usage:
			api.logout({
				'params': {'sessionKey': 'testguy'},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'logout': function(options){
		var o = this; // Consistency is good.
		var method = 'logout';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			// Whether logout succeeds or not, do what we can:
			o.cookie.del('atyponid');
			o.cookie.del('userLicenseType');
			o.cookie.del('ERIGHTS');
			o.cookie.del('at');
			o.cookie.del('autologin');
			o.cookie.del('ERIGHTS_TOPBAR');

			if(data.meta.status==0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
			}

			if(typeof(options.reload)=='undefined'||options.reload==true){
				// Check for and remove subscriptionThankYou from URL.
				var href=window.location.href.replace('subscriptionThankYou=2','').replace('subscriptionThankYou=1','');
				window.location.href=href;
			}
			
			return (data.meta.status==0);
		});
	},
	/*
		Description:
			Lookup all accounts associated with the last name, zip and phone# passed
		
		Usage:
			api.lookupAccount({
				'params': {
					'lastName': 'Guy',
					'zip': 46202,
					'phoneNumber': '(555) 000-0000'
				},
				'success': function(msg,accounts){ console.log(accounts) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'lookupAccount': function(options){
		var o = this; // Consistency is good.
		var method = 'lookupAccount';
		if(typeof options.params !== 'object') options.params = {};
		/* Clean inputed parameters. Should be in the API ideally. */
		if(typeof options.params.phoneNumber != 'undefined') options.params.phoneNumber = options.params.phoneNumber.replace(/\D+/g,'');
		if(options.params.lastName==''){delete options.params.lastName;}
		// Deal with related market IDs.
		if (o.options.relatedMarketIDs != '') {
			options.params.marketId = o.options.marketId + ',' + o.options.relatedMarketIDs;
		}
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				o.data.accounts = data.response.accounts;
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data.response);
				return true;
			}else{
				
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method), data.response);
				return false;
			}
		});
	},
	/*
		Description:
			Get all users associated with the accountNumber, publicationCode, and unitNumber passed in.
		
		Usage:
			api.getAccount({
				'params': {
					'accountNumber': accountNumber,
					'publicationCode': publicationCode,
					'unitNumber': unitNumber
				},
				'success': function(msg,users){ console.log(users) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'getAccount': function(options){
		var o = this; // Consistency is good.
		var method = 'getAccount';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				o.data.users = data.response.users;
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data.response);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method));
				return false;
			}
		});
	},
	/*
		Description:
			Combine accounts by providing two user ids.
		
		Usage:
			api.combineAccount({
				'params': {
					'userId': 123,
					'combineUserId': 456,
					'password': 'XXXXXXXXXXXXXXXXXX',
					'marketId': 'AZ'
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'combineAccount': function(options){
		var o = this; // Consistency is good.
		var method = 'combineAccount';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Link an account to a user.
		
		Usage:
			api.linkAccount({
				'params': {
					'userId': 123,
					'unitNumber': 'XXXXXXXXXXXXXXXXXX',
					'publicationCode': 'XXXXXXXXXXXXXXXXXX',
					'accountNumber': 'XXXXXXXXXXXXXXXXXX',
					'marketId': 'AZ'
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'linkAccount': function(options){
		var o = this; // Consistency is good.
		var method = 'linkAccount';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Link all accounts to a user.
		
		Usage:
			api.linkAllAccounts({
				'params': {
					'userId': 123, // or 'email'
					'lastName': 'XXXXXXXXXXXXXXXXXX',
					'zip': 'XXXXXXXXXXXXXXXXXX',
					'phoneNumber': 'XXXXXXXXXXXXXXXXXX',
					'marketId': 'AZ'
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'linkAllAccounts': function(options){
		var o = this; // Consistency is good.
		var method = 'linkAllAccounts';
		if(typeof options.params !== 'object') options.params = {};
		/* Clean inputed parameters. Should be in the API ideally. */
		if(typeof options.params.phoneNumber != 'undefined') options.params.phoneNumber = options.params.phoneNumber.replace(/\D+/g,'');
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data.response);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Send welcome email to a user.
		
		Usage:
			api.sendWelcomeEmail({
				'params': {
					'userId': 123, // or 'email'
					'marketId': 'AZ'
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'sendWelcomeEmail':  function(options){
		var o = this; // Consistency is good.
		var method = 'sendWelcomeEmail';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Begin the reset password proceedure.
		
		Usage:
			api.resetPassword({
				'params': {
					'email': 'test@example.com',
					'marketId': 'AZ',
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'resetPassword': function(options){
		var o = this; // Consistency is good.
		var method = 'resetPassword';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Changes the user's password--which sends the reset password confirmation 
			email--and logs in the user.
		Usage:
			api.changePassword({
				'params': {
					'resetToken': '446f4e3757',
					'newPassword': 'passw0rd',
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'changePassword': function(options){
		var o = this; // Consistency is good.
		var method = 'changePassword';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				data.response.user["GCIONID"] = data.response.user.gcionCookie;
				o.apiOnLogin(options, data, method);
				//if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Changes the user's temporary password--which resets the resetPassword flag
			and sends the reset password confirmation email--and logs in the user.
		Usage:
			api.changeUserPassword({
				'params': {
					'email': 'test@example.com',
					'newPassword': 'passw0rd',
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'changeUserPassword': function(options){
		var o = this; // Consistency is good.
		var method = 'changeUserPassword';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},

	/*
		Description:
			Begin the reset password proceedure.
		
		Usage 1 (If the user ID is known):
			api.changePassword({
				'params': {
					'userId': 123,
					'oldPassword': 'XXXXXXXXXXXXXXXXXX',
					'newPassword': 'XXXXXXXXXXXXXXXXXX',
					'marketId': 'AZ'
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
		
		Usage 2 (If you have a reset password token):
			api.changePassword({
				'params': {
					'resetToken': 'XXXXXXXXXXXXXXXXXX',
					'oldPassword': 'XXXXXXXXXXXXXXXXXX',
					'newPassword': 'XXXXXXXXXXXXXXXXXX',
					'marketId': 'AZ'
				},
				'success': function(msg){ console.log(msg) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'resetToken': function(options){
		var o = this; // Consistency is good.
		var method = 'resetPassword';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	/*
		Description:
			Method to return the user's total count (int) of viewed packages.
		
		Usage: 
			api.getCount();
	*/
	'getCount':function(){
		var o = this, count = 0;
		count=parseInt(o.cookie.get("EMETA_NCLICK"));
		if (typeof count!='number'||count<1||isNaN(count)){
			count=0;
		}
		return count;
	},
	/*
	 	Description:
			Method to return the number of remaining free packages.
		
		Usage: 
			api.getCountRemainingFree();
	*/
	'getCountRemainingFree':function(){
		var o = this, count = 0, viewed = o.getCount();

		if (o.options.limitOne != o.options.limitTwo) {
			// When there are two limits.
			if (o.is('loggedIn')) {
				count = o.options.limitTwo - viewed;
			} else {
				if (o.options.limitOne >= viewed) {
					count = o.options.limitOne - viewed;
				} else {
					count = 0;
				}
			}
		} else {
			// When there is one limit.
			count = o.options.limitTwo - viewed;
		}

		if (typeof count!='number'||count<1||isNaN(count)){
			count=0;
		}
		return count;
	},
	/*
	 	Description:
			Method to return the session key.
		
		Usage: 
			api.getSessionKey();
	*/
	'getSessionKey':function(){
		var o=this;
		var sessionKey=o.cookie.get('ERIGHTS');
		if(sessionKey!=''&&sessionKey!=null){
			return sessionKey;
		}
		return '';
	},
	/*
	 	Description:
			Method used after login to forward user to location where session info is set before redirected back.

		Usage:
			api.go({
				'at':'',
				'gcionID':'',
				'redirectURL':window.location.href,
				'sessionID':''
			},'replace')
	*/
	'go':function(options,method){
		var o = this; // Consistency is good.
		var url = o.options.api.global +'/go?'+encodeURI(fireflyJQuery.param(options));

		if (typeof method  != 'undefined' && method == 'redirect') {
			window.location.href=url;
		} else if (typeof method  != 'undefined' && method == 'url') {
			return url;
		}else{
			window.location.replace(url);
		}
	},
	/*
		Description:
			Object to get, set, and delete cookies.
		
		Usage: 
			Set Cookie: Sets a cookie for the given number of days.
				api.cookie.set('cookieName', 'cookieValue', 30);
			Get Cookie: Gets the value of a cookie. Returns null when not found.
				api.cookie.get('cookieName');
			Delete Cookie: Deletes the given cookie.
				api.cookie.del('cookieName');
	*/
	'cookie':{
		'events': undefined, // set in init
		'isEnabled':function(){
			var cookiesEnabled = false;
			
			try {
				// see if our cookie test is already set
				cookiesEnabled = !!this.get('atyponapi_cookiecheck');
				
				// if not, then try setting and reading
				if (!cookiesEnabled) {
					this.set('atyponapi_cookiecheck', 'enabled');
				
					cookiesEnabled = !!this.get('atyponapi_cookiecheck');
					}
			} catch (e) {}
			
			return cookiesEnabled;
		},
		'del':function(name, path, domain){
			var o=this;
			if(typeof path=='undefined'){
				path='/';
			}
			if(typeof domain=='undefined'){
				domain=GEL.thepage.pageinfo.firefly.cookieDomain;
			}
			if ( this.get( name ) ) document.cookie = name + "=" +
				( ( path ) ? ";path=" + path : "") +
				( ( domain ) ? ";domain=" + domain : "" ) +
				";expires=Thu, 01-Jan-1970 00:00:01 GMT";
			
			o.events.trigger(name + ".del", [path, domain]);
		},
		'get':function(check_name){
			// first we'll split this cookie up into name/value pairs
			// note: document.cookie only returns name=value, not the other components
			var a_all_cookies = document.cookie.split( ';' );
			var a_temp_cookie = '';
			var cookie_name = '';
			var cookie_value = '';
			var b_cookie_found = false; // set boolean t/f default f
		
			for ( i = 0; i < a_all_cookies.length; i++ )
			{
				// now we'll split apart each name=value pair
				a_temp_cookie = a_all_cookies[i].split( '=' );
		
		
				// and trim left/right whitespace while we're at it
				cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
		
				// if the extracted name matches passed check_name
				if ( cookie_name == check_name )
				{
					b_cookie_found = true;
					// we need to handle case where cookie has no value but exists (no = sign, that is):
					if ( a_temp_cookie.length > 1 )
					{
						cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, '') );
					}
					// note that in cases where cookie is initialized but no value, null is returned
					return cookie_value;
					break;
				}
				a_temp_cookie = null;
				cookie_name = '';
			}
			if ( !b_cookie_found )
			{
				return null;
			}
		},
		'set':function(name, value, expires, path, domain, secure){
			var o=this;
			
			if(typeof path=='undefined'){
				path='/';
			}
			if(typeof domain=='undefined'){
				domain=GEL.thepage.pageinfo.firefly.cookieDomain;
			}
			// set time, it's in milliseconds
			var today = new Date();
			today.setTime( today.getTime() );
			
			/*
			if the expires variable is set, make the correct
			expires time, the current script below will set
			it for x number of days, to make it for hours,
			delete * 24, for minutes, delete * 60 * 24
			*/
			if ( expires ){
				expires = expires * 1000 * 60 * 60 * 24;
			}
			var expires_date = new Date( today.getTime() + (expires) );
				
			document.cookie = name + "=" +escape( value ) +
				( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
				( ( path ) ? ";path=" + path : "" ) +
				( ( domain ) ? ";domain=" + domain : "" ) +
				( ( secure ) ? ";secure" : "" );
			
			o.events.trigger(name + ".set", [value, expires, path, domain, secure]);
		}
	},
	/*
		Description:
			Applies a promotional offer to the user. claimCode, email or userId,
			and marketId are required.
		Usage:
			api.redeemPromoCode({
				'params': {
					'claimCode': '123',
					'email': 'test@example.com',
					'marketId': 'BG'
				},
				'success': function(msg,user){ console.log(user) },
				'failure': function(msg){ console.log(msg); }
			});
	*/
	'redeemPromoCode':function(options){
		var o = this; // Consistency is good.
		var method = 'redeemPromoCode';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	},
	'test':function(m,t,cb){
		var o = this; // Consistency is good.
		var test = o.options.methods[m].tests[t];
		if(typeof cb != 'function') var cb = function(){};
		o[m]({
			'params': test.data,
			'success': function(msg,data){ check(msg,data,cb); },
			'failure': function(msg,data){ check(msg,data,cb); }
		});
		
		function check(msg,data,callback){
			if(test.check(msg,data)){
				var r = test.description+': PASSED';
				console.log(r);
				o.tests.push(r);
			}else{
				var r = test.description+': FAILED';
				console.log(r);
				o.tests.push(r);
			}
			callback(r);
		}
	},
	unprotectUrl: function(url) {
		/* Redirects */
		url=url.replace(/\/proart\//, '/article/');
		url=url.replace(/\/prostory\//, '/story/');
		url=url.replace(/\/provid\//, '/videonetwork/');
		url=url.replace(/\/progal\//, '/apps/pbcs.dll/gallery');
		url=url.replace(/\/prosec\//, '/section/');
		url=url.replace(/\/proint\//, '/interactive/');
		url=url.replace(/\/proliv\//, '/livestream/');

		// remove pagerestricted QSP, then duplicate ampersands, then an ampersand next to question mark, then a question mark or ampersand at the end of the QS
		url=url.replace(/([?&])pagerestricted=\d/i, '$1').replace(/[&]+/, '&').replace('?&', '?').replace(/[?&]$/, '');
		
		var reggy = new RegExp('^http(s|)://'+GEL.thepage.pageinfo.url.hostname+'(/|)$');
		url = (url.match(reggy)) ? 'http://'+GEL.thepage.pageinfo.url.hostname+'/apps/pbcs.dll/frontpage' : url ;
		
		return url;
	},
	'testAll':function(cbs){
		var o = this; // Consistency is good.
		if(typeof cbs != 'function') var cbs = function(){};
		
		for(var m in o.options.methods){
			for(var t in o.options.methods[m].tests){
				o.test(m,t,cbs);
			}
		}
	},
	'validateClaimTicket': function(options) {
		var o = this; // Consistency is good.
		var method = 'validateClaimTicket';
		if(typeof options.params !== 'object') options.params = {};
		o.doMethod(method,options.params,function(data){
			if(data.meta.status == 0){
				if(typeof options.success == 'function') options.success(o.msgLookup(data.meta,method),data);
				return true;
			}else{
				if(typeof options.failure == 'function') options.failure(o.msgLookup(data.meta,method),data);
				return false;
			}
		});
	}
};
}
