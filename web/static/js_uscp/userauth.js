(function(){ 
if(typeof GEL.UserAuth != 'undefined') { 
	GEL.log("It appears as if the GEL.Userauth namespace has all ready loaded"); 
	return; 
}


GEL.UserAuth = function(options){
	options= options || {};
	var 
		i=0,
		_uamodalele,
		_socialuser,
		_activemodalwindow,
		_D= document,
		_W= window,
		_hostname,
		_c,_d,
		_uanlformname="FB",
		_vt = GEL.thepage.viewTracker,
		_s = GEL.namespace("config.omniture").s_code,
		_tmessageRegex = /([A-Z][^A-Z]+)([A-Z][^A-Z]+)/,
		_tformname,
		_isstandalone=false,
		_showddflag =false;
		_redirect =false;
		_fbreg=false;
		_scheme = GEL.config.userauth.enable_ssl ? "https://" : "http://",
		_uamodalcont = 'uamodalcontainer' in options ? 
				options.uamodalcontainer : "UAModalcontainer",
		_uamodalfolder = 'uamodalfolder' in options ? 
				options.uamodalfolder : GEL.env.gelpath.path +"/userauth/content",
		_uamodaljsfolder = 'uamodaljsfolder' in options ? 
				options.uamodaljsfolder : GEL.env.gelpath.path +"/userauth/jsContent",				
		_uascriptsfolder = 'uascriptsfolder' in options ? 
				options.uascriptsfolder : GEL.env.gelpath.path +"/userauth/Events",
		_uatos = 'uatos' in options ? options.uatos : GEL.config.userauth.tos_url,
		_uapp = 'uapp' in options ? options.uapp : GEL.config.userauth.pp_url,
		_uafeedback = 'uafeedback' in options ? options.uafeedback : GEL.config.userauth.feedback_url,
		_ualoadfastoption = 'ualoadfastoption' in options ? options.ualoadfastoption : true,
		_uafaq = 'uafaq' in options ? options.uafaq : GEL.config.userauth.faq_url,
		_uasocprowsurl = 'uawebservericeurl' in options ? options.uawebservericeurl : _scheme + GEL.config.userauth.host +"/ProviderAuth.ashx",				
		_uasigninpagename = 'uasigninpagename' in options ? options.uasigninpagename :"pluck_signin",
		_uaregisterpagename = 'uaregisterpagename' in options ? options.uaregisterpagename :"pluck_register",
		_nletterregisterpagename = 'nletterregisterpagename' in options ? options.nletterregisterpagename :"nletterregister",
		_uasigninpage = 'uasigninpage' in options ? 
				options.uasigninpage : "http://" + GEL.thepage.pageinfo.url.hostname +"/section/pluck_register",
		_ualoginpage = 'ualoginpage' in options ? 
				options.ualoginpage : "http://" + GEL.thepage.pageinfo.url.hostname +"/section/pluck_signin",
		_uatrackclicks = 'uatrackclicks' in options ? options.uatrackclicks : true,
		_loadjscontent='loadjscontent' in options ? 	options.loadjscontent : false,
		_uamodalele = GEL.ement(_uamodalcont);
		_hostname = options.hostname || _W.location.hostname;

	this.init = function(){
		var _piua = GEL.thepage.pageinfo.additionalUAinfo;
			
		if(typeof(_piua) != 'undefined'){
			if (_piua.type=="login")
			GEL.util.uautil.Loginstandalone();
			else if(_piua.type=="signup")
			GEL.util.uautil.Signupstandalone();
			else
			if(_piua.type=="pluckpersona")
			GEL.util.uautil.ManageAccount();
		}
		gdn_Actions["Refresh"]=2;
		
		
	}
	
	this.isloadfasteron = function(){
	return _ualoadfastoption;
	}
	
	this.isnletterloginpage= function(){
	var _piua = GEL.thepage.pageinfo.additionalUAinfo;
		if(typeof(_piua) != 'undefined'){
			if(_piua.Nletterpage && _piua.type=="login") 
			return true;
			else
			return false;
		}
	}
	this.isnlettersignuppage= function(){
	var _piua = GEL.thepage.pageinfo.additionalUAinfo;
		if(typeof(_piua) != 'undefined'){
			if(_piua.Nletterpage && _piua.type=="signup") 
			return true;
			else
			return false;
			
		}
	}
	this.isnlettersubscribe= function(){
	var _piua = GEL.thepage.pageinfo.additionalUAinfo;
		if(typeof(_piua) != 'undefined'){
			if(_piua.Nletterpage && _piua.type=="subscribe") 
			return true;
			else
			return false;
			
		}
		return false;
	}
	this.isstandaloneloginpage= function(){
	var _piua = GEL.thepage.pageinfo.additionalUAinfo;
		if(typeof(_piua) != 'undefined'){
			if(_piua.SaxoProtectedPage && _piua.type=="login") 
			return true;
			else
			return false;
		}
	}
	this.isstandalonesignuppage= function(){
	var _piua = GEL.thepage.pageinfo.additionalUAinfo;
		if(typeof(_piua) != 'undefined'){
			if(_piua.SaxoProtectedPage && _piua.type=="signup") 
			return true;
			else
			return false;
		}
	}
	//SET and Get functions 
	this.getSitename = function(){
		if (typeof(GEL.thepage.pageinfo)!= 'undefined') 
			_c = GEL.thepage.pageinfo.url.domainroot;
		else
			_c = window.location.hostname;
		return _c.charAt(0).toUpperCase() + _c.slice(1);
	}
	this.getSitedomain = function(){
		if (typeof(GEL.thepage.pageinfo)!= 'undefined') 
			_d = GEL.thepage.pageinfo.url.domainname;
		else
			_d = window.location.hostname;
		return _d.charAt(0).toUpperCase() + _d.slice(1);
	}
	this.getSocialUser= function(_l){ 
		return _socialuser; 
	}
	this.setSocialUser= function(_l){ 
		_socialuser= _l; 
	} 
	this.getuasigninpage= function(){ 
		return _uasigninpage; 
	}
	this.getualoginpage= function(){ 
		return _ualoginpage; 
	}
	this.getisstandalone= function(){ 
		return _isstandalone; 
	}
	this.setisstandalone= function(_l){ 
		_isstandalone= _l; 
	} 
	this.getredirect= function(){ 
		return _redirect; 
	}
	this.setredirect= function(_l){ 
		_redirect= _l; 
	} 
	this.getfbreg= function(){ 
		return _fbreg; 
	}
	this.setfbreg= function(_l){ 
		_fbreg= _l; 
	} 
	this.getCurrentmodal= function(_l){
		return _activemodalwindow; 
	}
	this.setCurrentmodal= function(_l){ 
		_activemodalwindow= _l; 
	}
	this.getuamodalfolder= function(_l){
		return _uamodalfolder; 
	}	
	this.getnlformname=function(){
		return _uanlformname;
	}
	
	this.gettos = function(){ return ["http://",_hostname,_uatos].join(""); }
	this.getprivacypolicy = function(){ return ["http://",_hostname,_uapp].join(""); }
	this.getfeedback = function(){ return ["http://",_hostname,_uafeedback].join(""); }
	this.getfaq = function(){ return ["http://",_hostname,_uafaq].join(""); }
	this.getprofilepage = function(){ return GDN.CombinePath(GEL.config.userauth.site_url, GDN.AppendParam(GEL.config.userauth.persona_url, "U", GDN.Cookies.Pluck.GetValue("UserId"))); }
	this.gethomepage = function(){ return ["http://",GEL.config.userauth.site_url].join("");}
	this.setshowddflag = function(_l) { _showddflag = _l;}

	//from premium script
	this.mouseover =mouseover;
	this.mouseout =mouseout;
	this.setQuestion =setQuestion;
	this.resetQuestion =resetQuestion;
	this.onQuestion =onQuestion;
	this.setQuestionEvents =setQuestionEvents;
	this.redirect =redirect;
	
	//Track  functions
	this.settrackattribute= function(form,formname){
	//return;
	_vt.setAttribute(form,formname);
	_tformname = formname;
	}
	
	this.resizemodal = function(){
		_uamodalele.element.style.height="";
		_uamodalele.element.style.height="auto";
	}
	
	this.shownl = function(){
	var _o = GEL.util.uautil;
		 if(typeof GEL.UserAuth.NletterConfirm == 'undefined') {	
			_o.MakeRemoteCall("nletter_confirm","gelfolder","nletter_confirm.js",function(){
				var _d = new GEL.UserAuth.NletterConfirm,
					_o = GEL.util.uautil;
				_o.MakeRemoteCallContent("nletter_confirm","socialprovider","nletter_confirm.html",_d.initialize, {position:'absolute'});
				});
		  }
		  else {
		  var _d = new GEL.UserAuth.NletterConfirm;
		  _o.MakeRemoteCallContent("nletter_confirm","socialprovider","nletter_confirm.html",_d.initialize, {position:'absolute'});
				}
	_uanlformname="UA-Legacy";
	}
	
	this.ManageAccount = function(){
	var _changeacct = GEL.ement("ody-changeinfo"),
		_changepass = GEL.ement("ody-changepassword"),
		_sepe = GEL.ement("ody-ua-seperator"),
		_gel= GEL.ement("ody-ua-manageaccount"); 
		
		if(GDN.Cookies.Session.GetValue("sta") == "0") {
			if (GEL.env.sessioncache.getValue("sp") ==1) {
				_changeacct.show();
			}
			else
			{
				_changepass.show();
				_sepe.show();	
				_changeacct.show();
			}
		} else {
			return;
		}
		_changeacct.on("click",function(){
		if (typeof GDN.SetCheckedIndex != 'undefined')
				//GEL.util.uautil.UpdateAccount()
				window.location = GEL.thepage.pageinfo.firefly.apiUrl + "/account/"
				});
		_changepass.on("click",function(){
		if (typeof GDN.SetCheckedIndex != 'undefined')
				//GEL.util.uautil.ChangePassword()
				window.location = GEL.thepage.pageinfo.firefly.apiUrl + "/account/"
				});
		
	}
	
	function redirect() {
	var _q = GEL.env.url.qsv,
	 _pi = GEL.thepage.pageinfo;
	 

	if (((typeof(_pi.SaxoProtectedPage)!='undefined') && _pi.SaxoProtectedPage== 1)
			|| GEL.util.uautil.isnlettersubscribe())
		 window.location.reload(true);
	else
		if (typeof(_q.destination)== 'undefined')
		window.location = "http://" + GEL.thepage.pageinfo.url.hostname;
		else
			if (_q.destination== 'undefined')
			window.location = "http://" + GEL.thepage.pageinfo.url.hostname;
			else
			window.location = unescape(GEL.env.url.qsv.destination);
	}
	
	this.trackError = function (message) {
		if(_uatrackclicks){
			_s.events='event16';
			_vt.setAttribute('userauthaction', message);
			_vt.setAttribute('formname',"");
			_vt.setAttribute('division',"");
			_vt.setAttribute('pageName',"");
			_vt.providers.sitecat.trackView();
		}
		};
		
	this.trackSuccess = function (message) {
		if(_uatrackclicks){
			_vt.setAttribute('formname',message);
			_vt.setAttribute('division',message);
			_vt.setAttribute('userauthaction',"");
			_vt.setAttribute('pageName',message);
			_s.events='event15';
			_vt.providers.sitecat.trackView();
			}
		};
	this.trackSuccessUserAction = function (message) {
		if(_uatrackclicks){
			_vt.setAttribute('userauthaction',message);
			_vt.setAttribute('formname',"");
			_vt.setAttribute('division',"");
			_vt.setAttribute('pageName',"");
			_s.events='event15';
			_vt.providers.sitecat.trackView();
			}
		};
	this.trackAbandon = function (message) {
		if(_uatrackclicks){
			_vt.setAttribute('userauthaction',"");
			_s.events='event14';
			_vt.providers.sitecat.trackView();
		}
		};
	
	this.trackCompleted = function (message) {
		if(_uatrackclicks){
			_vt.setAttribute('formname',message);
			_vt.setAttribute('division',message);
			_vt.setAttribute('userauthaction',"");
			_vt.setAttribute('pageName',message);
			_s.events='event17';
			_vt.providers.sitecat.trackView();
		}
		};

		this.trackUserAction = function (message) {
		if(_uatrackclicks){
			_vt.setAttribute('userauthaction',message);
			_vt.setAttribute('formname',"");
			_vt.setAttribute('division',"");
			_vt.setAttribute('pageName',"");
			_s.events='';
			_vt.providers.sitecat.trackView();
			}
		};

		this.trackformdisplay = function (message) {
		if(_uatrackclicks){
			_vt.setAttribute('formname',message);
			_vt.setAttribute('division',message);
			_vt.setAttribute('userauthaction',"");
			_vt.setAttribute('pageName',message);
			_s.events='';
			_vt.providers.sitecat.trackView();
			}
		};
	
	//Main functions
	this.LoginProvider = function(){
		if(!(this.isnletterloginpage() || this.isstandaloneloginpage())){
			if (typeof(GEL.UserAuth.Login) == 'undefined' ){
				this.MakeRemoteCall("login","gelfolder","login.js",function(){
				 GDN.LoadFile("UI");
				  gdn_Actions["Login"] = 1;
				var _o = GEL.util.uautil,
				 _d = new GEL.UserAuth.Login;
				_o.MakeRemoteCallContent("userauthlogin","socialprovider","login.html",_d.initialize);
				});
			
			}
			else
			{
				var _o = GEL.util.uautil,
				 _d = new GEL.UserAuth.Login;
				_o.MakeRemoteCallContent("userauthlogin","socialprovider","login.html",_d.initialize);
			}
		}
	}
	
	this.SearchAction = function(){
	
		if (typeof(GEL.UserAuth.Search) == 'undefined' ){
			this.MakeRemoteCall("search","gelfolder","search.js",function(){
			var _o = GEL.util.uautil,
			 _d = new GEL.UserAuth.Search;
			_o.MakeRemoteCallContent("search","socialprovider","search.html",_d.initialize);
			});
		
		}
		else
		{
			var _o = GEL.util.uautil,
			 _d = new GEL.UserAuth.Search;
			_o.MakeRemoteCallContent("search","socialprovider","search.html",_d.initialize);
		}
	}
	
	this.UpdateAccount = function(){
	
		if (typeof(GEL.UserAuth.UpdateAccount) == 'undefined' ){
			this.MakeRemoteCall("updateaccount","gelfolder","updateaccount.js",function(){
			var _o = GEL.util.uautil,
			 _d = new GEL.UserAuth.UpdateAccount;
			_o.MakeRemoteCallContent("updateaccount","socialprovider","updateaccount.html",_d.initialize);
			});
		
		}
		else
		{
			var _o = GEL.util.uautil,
			 _d = new GEL.UserAuth.UpdateAccount;
			_o.MakeRemoteCallContent("updateaccount","socialprovider","updateaccount.html",_d.initialize);
		}
	}
	
	this.CancelMembership =function(){
	if (typeof(GEL.UserAuth.CancelMembership) == 'undefined' ){
			this.MakeRemoteCall("cancelmembership","gelfolder","cancelmembership.js",function(){
			var _o = GEL.util.uautil,
			 _d = new GEL.UserAuth.CancelMembership;
			_o.MakeRemoteCallContent("cancelmembership","socialprovider","cancelmembership.html",_d.initialize);
			});
		
		}
		else
		{
			var _o = GEL.util.uautil,
			 _d = new GEL.UserAuth.CancelMembership;
			_o.MakeRemoteCallContent("cancelmembership","socialprovider","cancelmembership.html",_d.initialize);
		}
	}
	
	this.ChangePassword =function(){
		if (GEL.env.sessioncache.getValue("sp") !=1) {
	
			if (typeof(GEL.UserAuth.ChangePassword) == 'undefined' ){
					this.MakeRemoteCall("changepassword","gelfolder","changepassword.js",function(){
					var _o = GEL.util.uautil,
					 _d = new GEL.UserAuth.ChangePassword;
					_o.MakeRemoteCallContent("changepassword","socialprovider","changepassword.html",_d.initialize);
					});
				
				}
				else
				{
					var _o = GEL.util.uautil,
					 _d = new GEL.UserAuth.ChangePassword;
					_o.MakeRemoteCallContent("changepassword","socialprovider","changepassword.html",_d.initialize);
				}
			}
		else
			alert(" No  password change for the user who is logged in through FB " );
	}
	
	this.UASignup = function(){
	if(!(this.isnlettersignuppage() || this.isstandalonesignuppage())){
		if (typeof(GEL.UserAuth.SignUp) == 'undefined' ){
			this.MakeRemoteCall("signup","gelfolder","signup.js",function(){
				GDN.LoadFile("UI"); 
				gdn_Actions["Reg"] = 1;
			var _o = GEL.util.uautil,
			 _d = new GEL.UserAuth.SignUp;
			_o.MakeRemoteCallContent("signup","socialprovider","signup.html",_d.initialize);
			});
		} else {
			var _o = GEL.util.uautil,
			 _d = new GEL.UserAuth.SignUp;
			_o.MakeRemoteCallContent("signup","socialprovider","signup.html",_d.initialize);
		}
	  }
	}
	
	this.NLSignup = function(){
	
		var _div= GEL.ement("signup").getElement();
		
		GEL.util.uautil.setisstandalone(true);
		if (typeof(GEL.UserAuth.SignUp) == 'undefined' ){
			this.MakeRemoteCall("signup","gelfolder","signup.js",function(){
				GDN.LoadFile("UI"); 
				gdn_Actions["Reg"] = 1;
				try{
					var _d = new GEL.UserAuth.SignUp;
					var _o = GEL.util.uautil,
					_d = new GEL.UserAuth.SignUp;
					_o.MakeRemoteCallContent("signup","socialprovider","signup.html",_d.initialize);									
				}catch(e){
					GEL.log("File: userauth.js. check line 450 to 463. Message: " + e.toString());
				}
			});
		} 
	}
		
	this.Signupstandalone= function() {
	
		var _div= GEL.ement("ody-signup-standalone").getElement();
		GEL.util.uautil.setisstandalone(true);
		if (typeof(GEL.UserAuth.SignUp) == 'undefined' ){
			this.MakeRemoteCall("signup","gelfolder","signup.js",function(){
				GDN.LoadFile("UI"); 
				gdn_Actions["Reg"] = 1;
				try{
					var _d = new GEL.UserAuth.SignUp;
					if(_D.getElementById("ody-signup-standalone")){
						var _u =  GEL.util.uautil.getuamodalfolder()+"/signup.html";
						ajax(_u, function (xhr) {
								_div.innerHTML = xhr.responseText;
								_d.initialize(this);
						});
					}else{
						_d.initialize(this);
					}
				}catch(e){
					GEL.log("File: userauth.js. check line 450 to 463. Message: " + e.toString());
				}
			});
		} 
	}
	
	this.Loginstandalone= function() {
		
		var _div= GEL.ement("ody-login-standalone").getElement();
		GEL.util.uautil.setisstandalone(true);
		if (typeof(GEL.UserAuth.Login) == 'undefined' ){
			this.MakeRemoteCall("login","gelfolder","Login.js",function(){
				GDN.LoadFile("UI"); 
				gdn_Actions["Login"] = 1;
				try{
					var _d = new GEL.UserAuth.Login;
					if(_D.getElementById("ody-login-standalone")){
						var _u =  GEL.util.uautil.getuamodalfolder()+"/Login.html";
						ajax(_u, function (xhr) {
								_div.innerHTML = xhr.responseText;
								_d.initialize(this);
						});
					}else{
						_d.initialize(this);
					}
				}catch(e){
					GEL.log("File: userauth.js. check line 468 to 480. Message: " + e.toString());
				}
			});
		} 
	}
	
	// Gigya specific functions 
	this.spunlink = function(){
			GEL.util.sputil.unlinkaccount(unlinkcallback);
	
	}

	function unlinkcallback(response){
	GEL.log("user unlinked from provider");
	}
	
	this.logout = function(){
	this.setshowddflag(false);
		GEL.util.sputil.logout(logoutcallback);
	
	}
	
	function logoutcallback(response){
	
	GEL.log("user logged out from provider");
	}
	
	//Utility functions 
	this.Showlogincontent = function(){
	var 
		_g = document.getElementById("ody-loggedin-dd"),  //GEL.ement didn't work at some cases.
		_s = document.getElementById("ody-loggedin-ScreenName"),
		_arrow= document.getElementById("ody-loggedin-arrows")
		
	;
	GDN.SetInnerHtml("CustomLinks", UserSearchLink);
		if (!_showddflag){
			_g.style.display = "block"; 
			_g.style.visibility = "visible";
			_arrow.className= "logged-up";
			_showddflag = true;
		}
		else 
		{
			_g.style.display = "none";
			_g.style.visibility = "hidden";
			_arrow.className= "logged-down";
			_showddflag = false;
		}
		
	}

	this.Setfocus = function (name){
	 var form = GEL.ement(name).element;

	  // set focus on first text field
	  try
	  {
		for (var i = 0; i < form.elements.length; i++)
		{
		  if (/text/.test(form.elements[i].type) || /password/.test(form.elements[i].type))
		  {
			form.elements[i].focus();
			break;
		  }
		}
	  }
	  catch (e) {}
	}
	
	this.closemodalwindow= function(modalwindow,cbfunc){
		var _g,_h;
		_h = (typeof(modalwindow)!='undefined')?modalwindow :GEL.util.uautil.getCurrentmodal();
		if ( _h != ""){
		_g = GEL.ement((typeof(modalwindow)!='undefined')?modalwindow :GEL.util.uautil.getCurrentmodal());
		if (typeof(_g) != 'undefined' && typeof(_g.element.childNodes) != 'undefined'){
			if(_g.element.childNodes.length > 0){
			var _md = new GEL.widget.modal({innerId:'UAModalcontainerwrapper'});
			_md.hideModal();
			GEL.log(modalwindow + " window closed");
				_g.element.style.display="none";
			_g.element.style.visibility="hidden";
			GEL.util.uautil.setCurrentmodal("");
			if (typeof(cbfunc)=='function')
			cbfunc(this);
			if (GEL.util.uautil.getredirect())
				GEL.util.uautil.redirect();
			}
		 }
		}
	}
	
	this.createsocialjson= function(souser){
	//P2 use GEL json object in order to create Json
	var json = new GDN.Json(); 
	json.Add("ApplicationName", GEL.config.userauth.app_name);	
		json.Add("Email", encodeURIComponent(souser.user.email));
		json.Add("UserId", encodeURIComponent(souser.user.UserId));
		json.Add("Identifier", souser.user.loginProviderUID);
		json.Add("isSiteUID", souser.user.isSiteUID);
		json.Add("ProviderName", souser.user.loginProvider);
		json.Add("signature", souser.signature);
		json.Add("timestamp", souser.user.timestamp);
		return json;
	}
	
	this.MakeRemoteCall = function(type,webservice,querystr,cbfunc){
		var _s = "social.userauth." + type;
		GEL.use(_s,cbfunc);
	}

	this.MakeRemoteScriptCall = function(type,webservice,querystr,cbfunc){

		var _div= document.createElement("DIV"),
			_url = (webservice == "socialprovider" ) ? _uasocprowsurl+"?"+querystr 
					: _uascriptsfolder+"/"+querystr,
			_r=Math.floor(Math.random()*1000000),
			_divele;
		_div.id=type+i;
		_uamodalele.appendChild(_div);
		_divele = GEL.ement(_div.id);
		_divele.setContentUrl(_url+"&"+_r,'script'); 
		_divele.updateRemoteContent(); 
		
		_divele.on("contentUpdated",cbfunc);
		i++;
	}
	
	this.MakeRemoteCallContent = function(type,webservice,querystr,cbfunc, options){
	
	var _div= document.createElement("DIV"),
		_url = (webservice == "socialprovider" ) ? _uamodalfolder+"/"+querystr 
				: _uascriptsfolder+"/"+querystr,
		_formLoaded,
		D=GEL.thepage,
		_width=(type=="signup")?830:600,
		_divgel;
		_div.id=type;
		_divgel = GEL.ement(_div.id),
		_options = options ? options : {};
		
	if (typeof(GEL.util.uautil.getCurrentmodal())!='undefined' &&  GEL.util.uautil.getCurrentmodal() != "" ) {
	
		GEL.util.uautil.closemodalwindow();
		}
		
		if (_divgel.getElement().innerHTML == null || _divgel.getElement().innerHTML =="") 
		{
			var test="";				
			if(_loadjscontent){
				GEL.util.uautil.MakeRemoteCallJSContent('js'+type+'.js',function(){
					_div.innerHTML = eval('GEL.util.uautil.js'+type);
				_uamodalele.appendChild(_div);			 
				cbfunc(this);
				_options.innerId = 'UAModalcontainerwrapper';
				_options.setwidth = true;
				_options.innerWidth = _width;
				var _md = new GEL.widget.modal(_options);
				_md.showModal();
				D.fire(type+"setfocus");
				});
			}
			else{	
				ajax(_url, function (xhr) {
					_div.innerHTML = xhr.responseText;
					_uamodalele.appendChild(_div);
					cbfunc(this);
					_options.innerId = 'UAModalcontainerwrapper';
					_options.setwidth = true;
					_options.innerWidth = _width;
					var _md = new GEL.widget.modal(_options);
					_md.showModal();
					D.fire(type+"setfocus");
				});
				}
				
		}
		else {
			_divgel.element.style.display="block";
			_divgel.element.style.visibility="visible";
			_options.innerId = 'UAModalcontainerwrapper';
			_options.setwidth = true;
			_options.innerWidth = _width;
			var _md = new GEL.widget.modal(_options);
			_md.showModal();
			D.fire(type+"setfocus");
			cbfunc(this);
		}
		
		GEL.util.uautil.setCurrentmodal(type);	
		
	}

	this.MakeRemoteCallJSContent = function(path,cbfunc){
		GEL.use(_uamodaljsfolder+"/"+path,cbfunc);
	}
		
		
		
	this.MakeRemoteCallsilently = function(type,webservice,querystr){
	
	var _div= document.createElement("DIV"),
		_url = (webservice == "socialprovider" ) ? _uamodalfolder+"/"+querystr 
				: _uascriptsfolder+"/"+querystr,
		
		_divgel;
		_div.id=type;
		_divgel = GEL.ement(_div.id);
		if (_divgel.getElement().innerHTML == null || _divgel.getElement().innerHTML =="") 
		{
				ajax(_url, function (xhr) {
				
					_div.innerHTML = xhr.responseText;
					_uamodalele.appendChild(_div);
					 
					_div.style.display="none";
					_div.style.visibility="hidden";
				});
		}
	}

	
	this.ModalController = function (widget){ 
	var 
		_modal= new GEL.Element.Modal({
			image: "/graphics/ajax_loading_big.gif",
			autoSize: true
		}),
		_el= widget
	; 

	//_el.on("preContentUpdate", function(){ 
		var _h= 80, _w= 80 ;
		_el.clearElement(); 	
		_modal.css ({ height: _h + 'px', width: _w + 'px' }); 
		_el.appendChild(_modal); 
	//}); 
	//_el.on("contentUpdated", function(){ 
	// 	_modal.removeElement(); 	
	//});	

}

	function ajax(src, callback) {
		var _xhr = new GEL.remoting.Fetcher.Ajax({}).makeElement();
		_xhr.open('get', src);
		_xhr.onreadystatechange = function () {
			if (_xhr.readyState === 4) {
				callback(_xhr);
			}
		};
		_xhr.send();
	}
	
	function mouseover(gelements,callback){
		try{
			for( var i = 0; i < gelements.length; i++ ){
				gelements[i].on("mouseover", function(type, event){
					if(callback) {
						callback(this);
						return;
					}
					this.css({
						cursor: "pointer" 
					});
				});
			}
		}catch(e){
			GEL.log(e);
		}
	};

	function mouseout(gelements,callback){
		try{
			for( var i = 0; i < gelements.length; i++ ){
				gelements[i].on("mouseout", function(type, event){
					if(callback) {
						callback(this);
						return;
					}
					this.css({
						cursor: "none" 
					});
				});
			}
		}catch(e){
			GEL.log(e);
		}
	};
	function setQuestion(gelement){
		gelement.fire("questionshow");
	};

	function resetQuestion(gelement){
		gelement.fire("questionhide");
	};
	function setQuestionEvents(gelements,classname){
		try{
			for( var i = 0; i < gelements.length; i++){
				onQuestion(gelements[i],classname);
			}
		}catch(e){
			GEL.log(e);
		}
	};

	function onQuestion(gelement,classname){
		gelement.on("questionshow", function(type, event){
			this.foreach(classname, function(){
				var _c= GEL.ement(this);
				_c.show();
			});
		});

		gelement.on("questionhide", function(type, event){
			this.foreach(classname, function(){
				var _c= GEL.ement(this);
				_c.hide();
			});
		});
	};


}; 
GEL.extend(GEL.UserAuth, GEL.event.Publisher); 
})();


