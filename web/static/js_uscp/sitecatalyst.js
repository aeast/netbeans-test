// JavaScript Document
/* SiteCatalyst code version: H.3.
Copyright 1997-2005 Omniture, Inc. More info available at
http://www.omniture.com */
(function(){ 
    var 
    _CFG= GEL.namespace("config.omniture"),
    _scode= null
    ; 
    if(!_CFG.account) 
        throw new Error("You must have your omniture account configured at GEL.config.omniture.account"); 
    _scode= _CFG.s_code= new s_gi(_CFG.account); 
})(); 




/************************** CONFIG SECTION **************************/
/* You may add or alter any code config here. */
/* Link Tracking Config */
/*GMTI-WE need to revisit follwoing setting since these might be Site specific Settings*/
var s_gmti=s_gi(GEL.namespace("config.omniture").account)
/* E-commerce Config */
s_gmti.currencyCode="USD"

s_gmti.trackDownloadLinks=true
s_gmti.trackExternalLinks=false
s_gmti.trackInlineStats=true
s_gmti.linkDownloadFileTypes="exe,zip,wav,mp3,mp4,m4v,mov,mpg,avi,wmv,doc,pdf,xls,docx,xlsx,ppt,pptx"
s_gmti.linkInternalFilters="javascript:gbahn,planetdiscover,indystar,starnews,apartments,cars,carcast,homefinder,homescape,homehunter,newhomenetwork,network,usatoday,careers.usatoday,usatodaycareers,gcijobs,careerpath,space,event411,infi,ur.gcion.com,wire.ap.org,datemaker,e-thepeople,salary,topix,jobmanager.usatoday,usatoday.salary,resume.usatoday,asp.usatoday,employers.usatoday,newhomesnetwork,gannettnewsservices,customwire.ap.org,careerbuilder,customcoupon.com,winwithhollywood,Eharmony.com,Matchnet.com,Jdate.com,Glimpse.com,newslibrary,newslibrary.com,newsbank,newsbank.com,Americansingles.com,hosted.ap,infi.net,gbahn.net,gannettonline.com,careerbuilder.com,cars.com,apartments.com,homescape.com,shoplocal.com,gmti.com,mom,momslikeme.com,indy.com,highschoolsports,highschoolsports.net,metromix,traffic,pictopia"

if(typeof affil_domain!='undefined'){
    s_gmti.linkInternalFilters=s_gmti.linkInternalFilters+","+affil_domain
        }
s_gmti.linkLeaveQueryString=false
s_gmti.linkTrackVars="None"
s_gmti.linkTrackEvents="None"
/* Plugin Config */
s_gmti.classifyRefDomainList="Google:News|News.google.com,google.com/news>Google:Images|Images.google.com,google.com/images>Google:Maps|Maps.google.com>Google:Video|Video.google.com>Google:Email|Mail.google.com>Google:Translate|Translate.google.com>Google:HomePage|Google.com/ig>Google:Blogs|Blogsearch.google.com>Google:Groups|Groups.google.com>Yahoo:News|News.yahoo.com>Yahoo:Email|Mail.yahoo.com>Yahoo:Buzz|Buzz.yahoo.com>Yahoo:Answers|Answers.yahoo.com>Yahoo:Finance|Finance.yahoo.com>Yahoo:Groups|Groups.yahoo.com>Yahoo:Travel|Travel.yahoo.com>Yahoo:Images|Images.yahoo.com>Yahoo:Video|Video.yahoo.com>Yahoo:HomePage|My.yahoo.com>Bing:Images|Bing.com/images>Bing:Videos|Bing.com/videos>Bing:News|Bing.com/news>Bing:Maps|Bing.com/maps>Microsoft:Email|mail.live.com"
s_gmti.prop29="1";
s_gmti.prop38="false";
  
if(typeof s_products !='undefined'){
    s_gmti.products=s_products;
}

if(typeof GDN != 'undefined' && typeof gdn_version != 'undefined' && gdn_version > 2) {
    if (typeof GDN.Cookies.GCION != 'undefined') {
        if(GDN.Cookie.Exists(GDN.Cookies.GCION.Name)) {
            var ckie = GEL.env.cookies.gcionid.values;
            if(ckie.gcionid){
                s_gmti.prop27=ckie.gcionid;
            }
            if(ckie.version){
                s_gmti.prop28=ckie.version;
            }
            if(ckie.status){
                s_gmti.prop29=ckie.status;
            }
            if(ckie.zip){
                s_gmti.prop30=ckie.zip;
            } //zipcode
            if(ckie.yob){
                s_gmti.prop31=ckie.yob;
            } //year of birth
            if(ckie.gen){
                (ckie.gen==1)?(s_gmti.prop32='female'):(s_gmti.prop32='male');
            } //gender
            if(ckie.job){
                s_gmti.prop33=ckie.job;
            } //occupation
            if(ckie.ind){
                s_gmti.prop34=ckie.ind;
            } //industry
            if(ckie.cou){
                s_gmti.prop35=ckie.cou;
            } //country
            if(ckie.sit){
                s_gmti.prop36=ckie.sit;
            } //site
            if(ckie.date_created){
                s_gmti.prop37=ckie.date_created;
            }
            if(ckie.status > 1){
                s_gmti.prop38="true";
                s_gmti.eVar5='';
            }else{
                s_gmti.prop38="false";
            }
            //(GDN.UR.Intercept.IsException(location.href, gdn_local_ex)) ? (s_gmti.prop39="false"):(s_gmti.prop39="true");
            s_gmti.prop39="true"; 
        }
    }
}


if(location.href.indexOf("zagform")!= -1) {
    /* Form Analysis Config */
    //s_gmti.formList="Zago,login"
    s_gmti.trackFormList=true
    s_gmti.trackPageName=true
    s_gmti.useCommerce=true
    s_gmti.varUsed="eVar6"
    s_gmti.eventList="event14,event15,event16" //Abandon,Success,Error
}

if(location.href.indexOf('usatref=sportsmod')!= -1) {
    /*USATSports link, add appropriate events*/
    s_gmti.eVar41=GEL.config.bus.properties.contenttype; //set the eVar41 value to the current contentType.
}

function sendFormEventsZago() {
    var gcizagf=document.getElementById("URWidget-Zag");
    var isok=true;
    var today = new Date();
    var yob = gcizagf.Yob.value;
    var startYear = 1901;
    var endYear = today.getFullYear();

    if(typeof s_gmti.formList == 'undefined') {
        s_gmti.formList="Zago";
        s_gmti.setupFormAnalysis();
    }
    if(gcizagf.Gender[0].checked!=true&&gcizagf.Gender[1].checked!=true) {
        s_gmti.sendFormEvent('e','Zago Registration', 'ZagoForm', 'Error: Gender not selected');
        isok=false;
    }
    else if(yob == "" || yob == null) {
        s_gmti.sendFormEvent('e','Zago Registration', 'ZagoForm', 'Error: YOB Entry value is Blank');
        isok=false;
    } else if(isNaN(yob)) {
        s_gmti.sendFormEvent('e','Zago Registration', 'ZagoForm', 'Error: YOB Entry value is Not a Number');
        isok=false;
    } else if(yob>endYear||yob<startYear) {
        s_gmti.sendFormEvent('e','Zago Registration', 'ZagoForm', 'Error: YOB Entry value is Out of Range');
        isok=false;
    }
    else if(gcizagf.Country.selectedIndex==0) {
        if(gcizagf.Zip.value=="" ||gcizagf.Zip.value==null) {
            s_gmti.sendFormEvent('e','Zago Registration', 'ZagoForm', 'Error: Zip code Entry is Blank');
            isok=false;
        } else if(isNaN(gcizagf.Zip.value)) {
            s_gmti.sendFormEvent('e','Zago Registration', 'ZagoForm', 'Error: Zip code Entry is Not a Number');
            isok=false;
        }
    }
    if(isok){
        s_gmti.sendFormEvent('s','Zago Registration', 'ZagoForm');
        return true;
    }
}
function sendFormEventsZagoLogin() {
    var gcizagf = window.document.login;
    var isok=true;
    if(typeof s_gmti.formList == 'undefined') {
        s_gmti.formList="login";
        s_gmti.setupFormAnalysis();
    }
    if(gcizagf.email.value==''||gcizagf.email.value==null) {
        s_gmti.sendFormEvent('e','Zago Login', 'ZagoLoginForm', 'Username (email) Entry is Blank');
        isok=false;
    } else if(gcizagf.pwd.value==''||gcizagf.pwd.value==null) {
        s_gmti.sendFormEvent('e','Zago Login', 'ZagoLoginForm', 'Password Entry is Blank');
        isok=false;
    }
    if(isok){
        s_gmti.sendFormEvent('s','Zago Login', 'ZagoLoginForm');
    }
}

/* Plugin Config */
s_gmti.usePlugins=true
function s_doPlugins(s) {
    /* Add calls to plugins here */
    if (window.s_prePlugins) {
        s_prePlugins(s)
    }
  
    if (window.s_postPlugins) {
        s_postPlugins(s)
    }
  
    //  if(location.href.indexOf("register_zago")!= -1){s_gmti.setupFormAnalysis();}

    s_gmti.campaign=s_gmti.getQueryParam('source') // Campaign tracking:added by Omniture on 10/5/07
    s_gmti.campaign=s_gmti.getValOnce(s_gmti.campaign,'s_v0',0) //added by Adobe Consulting on 11/15/2010
    /* Campaign Pathing : check for Campaign and populate prop26 with path */
    var tc = s_gmti.campaign;
    var pn = s_gmti.pageName;
    var isCurrent = s_gmti.c_r('tc');
    if(tc) {
        s_gmti.prop26 = tc +": "+pn;
        s_gmti.c_w('tc',tc,0)
        }
    if(isCurrent && !tc){
        s_gmti.prop26=pn
        }
    if(tc && isCurrent!=tc){
        s_gmti.prop26 = tc +" : "+pn;
        s_gmti.c_w('tc',tc,0)
        }

    if(typeof s_gmti.eVar41 !== 'undefined' && s_gmti.eVar41 !== null){
        //did we previously determine this was a sportsmod article? this has to happen in two places due to s_gmti.apl not being available until now
        s_gmti.events=s_gmti.apl(s_gmti.events,"event41",",",1); //Append the event41 value onto the event list using provided apl (append to list) (list, value, delimeter, unique bit)
    }

    /* the following lines of code were added by Adobe Consulting on 5/27/2011*/
    /* Set event 3 (page view) on every page*/
    s_gmti.events=s_gmti.apl(s_gmti.events,"event3",",",1);
    /* accounting for specialized search Engines */
    s_gmti.eVar34=s_gmti.classifyRefDomain();
    /* Plugin Example: channelManager v2.4*/
    s_gmti.channelManager('source','','0',1,'c_m2');
    s_gmti.eVar33=s_gmti._partner;
    s_gmti.eVar35=s_gmti._channel;
    s_gmti.eVar36=s_gmti._referringDomain;
    s_gmti.eVar37=s_gmti._channel=="Natural Search"?s_gmti._referringDomain:"";
    s_gmti.eVar38=s_gmti._keywords;

    s_gmti.eVar50=s_gmti.pageName;
    s_gmti.eVar51 = (typeof setPollOmnitureInfo !== 'undefined' && setPollOmnitureInfo !== null) ? s_gmti.prop16 + '|' + s_gmti.pageName + setPollOmnitureInfo : s_gmti.prop16 + '|' + s_gmti.pageName + '|None|None';
    s_gmti.eVar16 = s_gmti.prop16;

    /* all Entries Bounce Rate */
    s_gmti.clickPast(s_gmti._channel,'event24','event25','s_all');
    /* SEO landing Page tracking */
    s_gmti.prop56=s_gmti.eVar32=s_gmti._channel=='Natural Search'?s_gmti.pageName?s_gmti.pageName:s_gmti.wd.location:'';
    /* SEO Landing Page Bounce Rate */
    s_gmti.clickPast(s_gmti.eVar32,'event22','event23','s_seoPN');
    /* copying the pageName to eVar30 */
    s_gmti.eVar30=s_gmti.pageName?s_gmti.pageName:s_gmti.wd.location;
    s_gmti.eVar31=s_gmti.prop18;
    /* dedupeReferrer v1.0 */
    s_gmti.referrer=s_gmti.dedupeReferrer();
    /* get the goole rank (deprecaited)*/
    //if(typeof s_gmti.referrer != 'undefined' && s_gmti.referrer.substring(7,18) == 'www.google.')  s_gmti.getGoogleRank('event26','event27');	
    /* custom visit number */
    s_gmti.prop55=s_gmti.eVar52=s_gmti.getVisitNum('m','7');
    s_gmti.prop53=s_gmti.eVar53=s_gmti.getVisitNumExpire(7);
    s_gmti.prop54=s_gmti.eVar54=s_gmti.getNewRepeat(7);
    //Code for percentage of page viewed plugin
    s_gmti.prop52=s_gmti.getPreviousValue(s_gmti.pageName,"s_pv");
    if (s_gmti.prop52){
        s_gmti.prop51=s_gmti.getPercentPageViewed();
    }
    s_gmti.tnt=s_gmti.trackTNT();
}
s_gmti.doPlugins=s_doPlugins
/************************** PLUGINS SECTION *************************/
/* You may insert any plugins you wish to use here.                 */
GEL.config.omniture.plugins= (function(){ 
    var s= {};  
    /*
 * Adobe SiteCatalyst Cookie Combining Utility
 
*/
    if(!s_gmti.__ccucr){
        s_gmti.c_rr=s_gmti.c_r;
        s_gmti.__ccucr = true;
        s_gmti.c_r=new Function("k",""
            +"var s=this,d=new Date,v=s.c_rr(k),c=s.c_rr('s_pers'),i,m,e;if(v)ret"
            +"urn v;k=s.ape(k);i=c.indexOf(' '+k+'=');c=i<0?s.c_rr('s_sess'):c;i="
            +"c.indexOf(' '+k+'=');m=i<0?i:c.indexOf('|',i);e=i<0?i:c.indexOf(';'"
            +",i);m=m>0?m:e;v=i<0?'':s.epa(c.substring(i+2+k.length,m<0?c.length:"
            +"m));if(m>0&&m!=e)if(parseInt(c.substring(m+1,e<0?c.length:e))<d.get"
            +"Time()){d.setTime(d.getTime()-60000);s.c_w(s.epa(k),'',d);v='';}ret"
            +"urn v;");
    }
    if(!s_gmti.__ccucw){
        s_gmti.c_wr=s_gmti.c_w;
        s_gmti.__ccucw = true;
        s_gmti.c_w=new Function("k","v","e",""
            +"this.new2 = true;"
            +"var s=this,d=new Date,ht=0,pn='s_pers',sn='s_sess',pc=0,sc=0,pv,sv,"
            +"c,i,t;d.setTime(d.getTime()-60000);if(s.c_rr(k)) s.c_wr(k,'',d);k=s"
            +".ape(k);pv=s.c_rr(pn);i=pv.indexOf(' '+k+'=');if(i>-1){pv=pv.substr"
            +"ing(0,i)+pv.substring(pv.indexOf(';',i)+1);pc=1;}sv=s.c_rr(sn);i=sv"
            +".indexOf(' '+k+'=');if(i>-1){sv=sv.substring(0,i)+sv.substring(sv.i"
            +"ndexOf(';',i)+1);sc=1;}d=new Date;if(e){if(e.getTime()>d.getTime())"
            +"{pv+=' '+k+'='+s.ape(v)+'|'+e.getTime()+';';pc=1;}}else{sv+=' '+k+'"
            +"='+s.ape(v)+';';sc=1;}if(sc) s.c_wr(sn,sv,0);if(pc){t=pv;while(t&&t"
            +".indexOf(';')!=-1){var t1=parseInt(t.substring(t.indexOf('|')+1,t.i"
            +"ndexOf(';')));t=t.substring(t.indexOf(';')+1);ht=ht<t1?t1:ht;}d.set"
            +"Time(ht);s.c_wr(pn,pv,d);}return v==s.c_r(s.epa(k));");
    }
    /*
* TNT Integration Plugin v1.0
*/
    s_gmti.trackTNT =new Function("v","p","b",""
        +"var s=this,n='s_tnt',p=p?p:n,v=v?v:n,r='',pm=false,b=b?b:true;if(s."
        +"getQueryParam){pm=s.getQueryParam(p);}if(pm){r+=(pm+',');}if(s.wd[v"
        +"]!=undefined){r+=s.wd[v];}if(b){s.wd[v]='';}return r;");	
    /*

 * Plugin: getNewRepeat 1.2 - Returns whether user is new or repeat
 */

    s_gmti.getNewRepeat=new Function("d","cn",""
        +"var s=this,e=new Date(),cval,sval,ct=e.getTime();d=d?d:30;cn=cn?cn:"
        +"'s_nr';e.setTime(ct+d*24*60*60*1000);cval=s.c_r(cn);if(cval.length="
        +"=0){s.c_w(cn,ct+'-New',e);return'New';}sval=s.split(cval,'-');if(ct"
        +"-sval[0]<30*60*1000&&sval[1]=='New'){s.c_w(cn,ct+'-New',e);return'N"
        +"ew';}else{s.c_w(cn,ct+'-Repeat',e);return'Repeat';}");
    /*
 * getVisitNum
 */
    s_gmti.getVisitNum=new Function("Y","X","c","C",""
        +"var s=this,i,k,K,e,I,D,V,E,Q,d;e=new Date;E=new Date;Q=e.getTime();"
        +"if(!Y){Y='m';}if(Y=='m'||Y=='w'||Y=='d'){eo=s.endof(Y),y=eo.getTime"
        +"();e.setTime(y);}else{d=Y*86400000;e.setTime(Q+d);}if(!X){X='m';}if"
        +"(X=='m'||X=='w'||X=='d'){eo2=s.endof(X);y2=eo2.getTime();E.setTime("
        +"y2);}else{d2=Q+X*86400000;E.setTime(d2);}if(!c){c='s_Vnum';}if(!C){"
        +"C='s_IVnum';}I=s.c_r(c);if(I){i=s.split(I,'|');K=i[1];D=i[2];K=Q>D?"
        +"1:K;}V=s.c_r(C);if(V){if(K){e.setTime(Q+1800000);s.c_w(C,'true',e);"
        +"return K;}else{return'unknownvisitnumber';}}else{if(K){K++;k=i[0];e"
        +".setTime(k);s.c_w(c,k+'|'+K+'|'+d2,e);e.setTime(Q+1800000);s.c_w(C,"
        +"'true',e);return K;}else{s.c_w(c,e.getTime()+'|1|'+d2,e);e.setTime("
        +"Q+1800000);s.c_w(C,'true',e);return 1;}}");
    s_gmti.dimo=new Function("m","y",""
        +"var d=new Date(y,m+1,0);return d.getDate();");
    s_gmti.endof=new Function("x",""
        +"var t=new Date;t.setHours(0);t.setMinutes(0);t.setSeconds(0);if(x=="
        +"'m'){d=s_gmti.dimo(t.getMonth(),t.getFullYear())-t.getDate()+1;}else if("
        +"x=='w'){d=7-t.getDay();}else{d=1;}t.setDate(t.getDate()+d);return t"
        +";");
    /* Plugin: getVisitNumExpire - version 1.0 */
    s_gmti.getVisitNumExpire=new Function("tp","c","c2","" 
        +"var s=this,e=new Date,cval,cvisit,ct=e.getTime(),d;if(!tp){tp=30;}"
        +"d=tp*86400000;e.setTime(ct+d);if(!c){c='s_vnum';}if(!c2){c2='s_inv"
        +"isit';}cval=s.c_r(c);if(cval){var i=cval.indexOf('&vn='),str=cval."
        +"substring(i+4,cval.length),k;}cvisit=s.c_r(c2);if(cvisit){if(str)"
        +"{e.setTime(ct+1800000);s.c_w(c2,'true',e);e.setTime(ct+d);s.c_w(c,"
        +"e.getTime()+'&vn='+str,e);return str;}else {return 'unknown visit "
        +"number';}}else{if(str){str++;k=cval.substring(0,i);e.setTime(k);"
        +"s.c_w(c,k+'&vn='+str,e);e.setTime(ct+1800000);s.c_w(c2,'true',e);"
        +"return str;}else{s.c_w(c,e.getTime()+'&vn=1',e);e.setTime(ct+18000"
        +"00);s.c_w(c2,'true',e);return 1;}}");
    /*
 * Utility Function: split v1.5 (JS 1.0 compatible)
 */
    s_gmti.split=new Function("l","d",""
        +"var i,x=0,a=new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x"
        +"++]=l.substring(0,i);l=l.substring(i+d.length);}return a");
    /*
 * s.join: 1.0 - Joins an array into a string
 */
    s_gmti.join = new Function("v","p",""
        +"var s = this;var f,b,d,w;if(p){f=p.front?p.front:'';b=p.back?p.back"
        +":'';d=p.delim?p.delim:'';w=p.wrap?p.wrap:'';}var str='';for(var x=0"
        +";x<v.length;x++){if(typeof(v[x])=='object' )str+=s.join( v[x],p);el"
        +"se str+=w+v[x]+w;if(x<v.length-1)str+=d;}return f+str+b;");
    /*
 * getGoogleRank v1.0 (deprecaited)
 */
    /*s_gmti.getGoogleRank=new Function("ce,ie,ev1,ev2,dn",""
+"var s=this,dr,rd,p,pa,kr,kw,dn=dn||'';qp='resnum,cd';dr=s.referrer|"
+"|typeof s.referrer!='undefined'?s.referrer:document.referrer;if(!dr"
+"||!ce||!ie)return;rd=s.split(dr,'/');if(rd[2].substring(0,11)!='www"
+".google.')return;kw=s.getQueryParam('q,as_q',' ',dr);if(!kw)return;"
+"if(ev1)s[ev1]=kw;kr=rd[3].substring(0,4)=='url?'?s.getQueryParam(qp"
+",'|',dr):'';if(kr.indexOf('|')>-1)kr=kr.substring(0,kr.indexOf('|')"
+");if(!kr||kr=='0'){if(ev2)s[ev2]='no rank available';return;}if(ev2"
+")s[ev2]=kr;p=s.products;pa=s.split(p,',');pa[0]=s.split(pa[0],';');"
+"pa[0][0]=pa[0][0]||'';pa[0][1]=pa[0][1]||dn;pa[0][2]=pa[0][2]||'';p"
+"a[0][3]=pa[0][3]||'';pa[0][4]=s.apl(pa[0][4],ie+'='+kr,'|',2);pa[0]"
+"=s.join(pa[0],{delim:';'});pa=s.join(pa,{delim:','});s.events=s.apl"
+"(s.events,ce,',',2);s.events=s.apl(s.events,ie,',',2);s.products=pa"
+";return;");*/
    /*
 * Plugin: classifyRefDomain v1.0 - classifies referrers
 */
    s_gmti.classifyRefDomain=new Function("g",""
        +"var s=this,g,i,j,k,m,q,r,S,T,Y,P='';if(!g){g=s.referrer?s.referrer:"
        +"document.referrer;}g=g.toLowerCase();if(g){k=g.indexOf('?');i=k>-1?"
        +"k:g.length;j=g.substring(0,i);a=s.classifyRefDomainList;a=s.split(a"
        +",'>');for(m=0;m<a.length;m++){q=s.split(a[m],'|');r=s.split(q[1],',"
        +"');S=r.length;for(T=0;T<S;T++){Y=r[T];Y=Y.toLowerCase();i=j.indexOf"
        +"(Y);if(i>-1)P=q[0]}}}return P");
    s_gmti.classifyRefDomainList="Google:News|News.google.com,google.com/n"
    +"ews>Google:Images|Images.google.com,google.com/images>Google:Maps|M"
    +"aps.google.com>Google:Video|Video.google.com>Google:Email|Mail.goog"
    +"le.com>Google:Translate|Translate.google.com>Google:HomePage|Google"
    +".com/ig>Google:Blogs|Blogsearch.google.com>Google:Groups|Groups.goo"
    +"gle.com>Yahoo:News|News.yahoo.com>Yahoo:Email|Mail.yahoo.com>Yahoo:"
    +"Buzz|Buzz.yahoo.com>Yahoo:Answers|Answers.yahoo.com>Yahoo:Finance|F"
    +"inance.yahoo.com>Yahoo:Groups|Groups.yahoo.com>Yahoo:Travel|Travel."
    +"yahoo.com>Yahoo:Images|Images.yahoo.com>Yahoo:Video|Video.yahoo.com"
    +">Yahoo:HomePage|My.yahoo.com>Bing:Images|Bing.com/images>Bing:Video"
    +"s|Bing.com/videos>Bing:News|Bing.com/news>Bing:Maps|Bing.com/maps>M"
    +"icrosoft:Email|mail.live.com";
    /*                                                                  
* Plugin: clickPast - version 1.0
*/
    s_gmti.clickPast=new Function("scp","ct_ev","cp_ev","cpc",""
        +"var s=this,scp,ct_ev,cp_ev,cpc,ev,tct;if(s.p_fo(ct_ev)==1){if(!cpc)"
        +"{cpc='s_cpc';}ev=s.events?s.events+',':'';if(scp){s.events=ev+ct_ev"
        +";s.c_w(cpc,1,0);}else{if(s.c_r(cpc)>=1){s.events=ev+cp_ev;s.c_w(cpc"
        +",0,0);}}}");
    s_gmti.p_fo=new Function("n",""
        +"var s=this;if(!s.__fo){s.__fo=new Object;}if(!s.__fo[n]){s.__fo[n]="
        +"new Object;return 1;}else {return 0;}");
    /*
 * Plugin: dedupeReferrer v1.0 - prevents the duplication of referrers
 */
    s_gmti.dedupeReferrer=new Function("c","b",""
        +"var s=this,a,g,i,j,k,l,m,n,o;g=s.referrer?s.referrer:document.refer"
        +"rer;g=g.toLowerCase();if(g){i=g.indexOf('?')>-1?g.indexOf('?'):g.le"
        +"ngth;j=g.substring(0,i);k=s.linkInternalFilters.toLowerCase();k=s.s"
        +"plit(k,',');l=k.length;for(m=0;m<l;m++){n=j.indexOf(k[m])>-1?g:'';i"
        +"f(n)o=n}if(!o){c=c?c:'_dr';b=b?b-1:'1';a=g;a=s.getValOnce(a,c,0);if"
        +"(a){return a}else{return k[b]}}}");
    /*
 * channelManager v2.4 - Tracking External Traffic
 */
    s_gmti.channelManager=new Function("a","b","c","d","e","f",""
        +"var s=this,A,B,g,l,m,M,p,q,P,h,k,u,S,i,O,T,j,r,t,D,E,F,G,H,N,U,v=0,"
        +"X,Y,W,n=new Date;n.setTime(n.getTime()+1800000);if(e){v=1;if(s.c_r("
        +"e))v=0;if(!s.c_w(e,1,n))s.c_w(e,1,0);if(!s.c_r(e))v=0;}g=s.referrer"
        +"?s.referrer:document.referrer;g=g.toLowerCase();if(!g)h=1;i=g.index"
        +"Of('?')>-1?g.indexOf('?'):g.length;j=g.substring(0,i);k=s.linkInter"
        +"nalFilters.toLowerCase();k=s.split(k,',');l=k.length;for(m=0;m<l;m+"
        +"+){B=j.indexOf(k[m])==-1?'':g;if(B)O=B;}if(!O&&!h){p=g;U=g.indexOf("
        +"'//');q=U>-1?U+2:0;Y=g.indexOf('/',q);r=Y>-1?Y:i;t=g.substring(q,r)"
        +";t=t.toLowerCase();u=t;P='Referrers';S=s.seList+'>'+s._extraSearchE"
        +"ngines;if(d==1){j=s.repl(j,'oogle','%');j=s.repl(j,'ahoo','^');g=s."
        +"repl(g,'as_q','*');}A=s.split(S,'>');T=A.length;for(i=0;i<A.length;"
        +"i++){D=A[i];D=s.split(D,'|');E=s.split(D[0],',');for(G=0;G<E.length"
        +";G++){H=j.indexOf(E[G]);if(H>-1){if(D[2])N=u=D[2];else N=t;if(d==1)"
        +"{N=s.repl(N,'#',' - ');g=s.repl(g,'*','as_q');N=s.repl(N,'^','ahoo'"
        +");N=s.repl(N,'%','oogle');}i=s.split(D[1],',');for(k=0;k<i.length;k"
        +"++){M=s.getQueryParam(i[k],'',g).toLowerCase();if(M)break;}}}}}if(!"
        +"O||f!='1'){O=s.getQueryParam(a,b);if(O){u=O;if(M)P='Paid Search';el"
        +"se P='Paid Non-Search';}if(!O&&N){u=N;P='Natural Search'}}if(h==1&&"
        +"!O&&v==1)u=P=t=p='Direct Load';X=M+u+t;c=c?c:'c_m';if(c!='0'){X=s.g"
        +"etValOnce(X,c,0);}g=s._channelDomain;if(g&&X){k=s.split(g,'>');l=k."
        +"length;for(m=0;m<l;m++){q=s.split(k[m],'|');r=s.split(q[1],',');S=r"
        +".length;for(T=0;T<S;T++){Y=r[T];Y=Y.toLowerCase();i=j.indexOf(Y);if"
        +"(i>-1)P=q[0];}}}g=s._channelParameter;if(g&&X){k=s.split(g,'>');l=k"
        +".length;for(m=0;m<l;m++){q=s.split(k[m],'|');r=s.split(q[1],',');S="
        +"r.length;for(T=0;T<S;T++){U=s.getQueryParam(r[T]);if(U)P=q[0]}}}g=s"
        +"._channelPattern;if(g&&X){k=s.split(g,'>');l=k.length;for(m=0;m<l;m"
        +"++){q=s.split(k[m],'|');r=s.split(q[1],',');S=r.length;for(T=0;T<S;"
        +"T++){Y=r[T];Y=Y.toLowerCase();i=O.toLowerCase();H=i.indexOf(Y);if(H"
        +"==0)P=q[0];}}}if(X)M=M?M:N?'Keyword Unavailable':'n/a';p=X&&p?p:'';"
        +"t=X&&t?t:'';N=X&&N?N:'';O=X&&O?O:'';u=X&&u?u:'';M=X&&M?M:'';P=X&&P?"
        +"P:'';s._referrer=p;s._referringDomain=t;s._partner=N;s._campaignID="
        +"O;s._campaign=u;s._keywords=M;s._channel=P;");

    s_gmti.seList="search`|qu|7search.com>search.about`|terms|About.com>alltheweb`|query,q|All The Web>allsearchengines.co.uk|querys|AllSearchEngines>altavista.co|q,r|AltaVista>ca.altavista`|q|AltaVista#Canada>dk.altavista`|q|AltaVista#Denmark>fr.altavista`|q,r|AltaVista#France>it.altavista`|q,r|AltaVista#Italy>nl.altavista`|q|AltaVista#Netherlands>no.altavista`|q|AltaVista#Norway>es.altavista`|q,r|AltaVista#Spain>se.altavista`|q,r|AltaVista#Sweden>ch.altavista`|q,r|AltaVista#Switzerland>ananzi.co.za|qt|Ananzi>aol.fr|q|AOL#France>suche.aol.de,suche.aolsvc.de|q|AOL#Germany>aol.co.uk,search.aol.co.uk|query|AOL#United Kingdom>search.aol`,search.aol.ca|query,q|AOL.com Search>aport.ru|r|Aport>ask`,ask.co.uk|ask,q|Ask Jeeves>www.baidu`|wd,word|Baidu>www.baidu.jp|wd,word|Baidu Japan>search.biglobe.ne.jp|q|Biglobe>centrum.cz|q|Centrum.cz>clix.pt|question|Clix>cuil`|q|Cuil>daum.net,search.daum.net|q|Daum>Dictionary`,Dictionary|term,query,q|Dictionary.com>directhit`|qry,q|DirectHit>Docomo.ne.jp|key|Docomo.ne.jp>eniro.dk|search_word|Eniro>eniro.fi|search_word|Eniro#Finland>eniro.se|search_word|Eniro#Sweden>euroseek`|query,string|Euroseek>excite.fr|search,q|Excite#France>excite.co.jp|search,s|Excite#Japan>fireball.de|q,query|Fireball>search.fresheye`|ord,kw|FreshEye>goo.ne.jp|MT|Goo (Jp.)>g%.co,g%syndication`|q,*|G%>g%`.af|q,*|G%#Afghanistan>g%.as|q,*|G%#American Samoa>g%`.ai|q,*|G%#Anguilla>g%`.ag|q,*|G%#Antigua and Barbuda>g%`.ar|q,*|G%#Argentina>g%.am|q,*|G%#Armenia>g%`.au|q,*|G%#Australia>g%.at|q,*|G%#Austria>g%.az|q,*|G%#Azerbaijan>g%`.bh|q,*|G%#Bahrain>g%`.bd|q,*|G%#Bangladesh>g%`.by|q,*|G%#Belarus>g%.be|q,*|G%#Belgium>g%`.bz|q,*|G%#Belize>g%`.bo|q,*|G%#Bolivia>g%.ba|q,*|G%#Bosnia-Hercegovina>g%.co.bw|q,*|G%#Botswana>g%`.br|q,*|G%#Brasil>g%.vg|q,*|G%#British Virgin Islands>g%`.bn|q,*|G%#Brunei>g%.bg|q,*|G%#Bulgaria>g%.bi|q,*|G%#Burundi>g%`.kh|q,*|G%#Cambodia>g%.ca|q,*|G%#Canada>g%.cl|q,*|G%#Chile>g%.cn|q,*|G%#China>g%`.co|q,*|G%#Colombia>g%.co.ck|q,*|G%#Cook Islands>g%.co.cr|q,*|G%#Costa Rica>g%.ci|q,*|G%#Cote D\'Ivoire>g%.hr|q,*|G%#Croatia>g%`.cu|q,*|G%#Cuba>g%.cz|q,*|G%#Czech Republic>g%.dk|q,*|G%#Denmark>g%.dj|q,*|G%#Djibouti>g%.dm|q,*|G%#Dominica>g%`.do|q,*|G%#Dominican Republic>g%`.ec|q,*|G%#Ecuador>g%`.eg|q,*|G%#Egypt>g%`.sv|q,*|G%#El Salvador>g%.ee|q,*|G%#Estonia>g%`.et|q,*|G%#Ethiopia>g%`.fj|q,*|G%#Fiji>g%.fi|q,*|G%#Finland>g%.fr|q,*|G%#France>g%.de|q,*|G%#Germany>g%.gr|q,*|G%#Greece>g%.gl|q,*|G%#Greenland>g%.gp|q,*|G%#Guadeloupe>g%`.gt|q,*|G%#Guatemala>g%.gg|q,*|G%#Guernsey>g%.gy|q,*|G%#Guyana>g%.ht|q,*|G%#Haiti>g%.hn|q,*|G%#Honduras>g%`.hk|q,*|G%#Hong Kong>g%.hu|q,*|G%#Hungary>g%.co.in|q,*|G%#India>g%.co.id|q,*|G%#Indonesia>g%.ie|q,*|G%#Ireland>g%.is|q,*|G%#Island>g%`.gi|q,*|G%#Isle of Gibraltar>g%.im|q,*|G%#Isle of Man>g%.co.il|q,*|G%#Israel>g%.it|q,*|G%#Italy>g%`.jm|q,*|G%#Jamaica>g%.co.jp|q,*|G%#Japan>g%.je|q,*|G%#Jersey>g%.jo|q,*|G%#Jordan>g%.kz|q,*|G%#Kazakhstan>g%.co.ke|q,*|G%#Kenya>g%.ki|q,*|G%#Kiribati>g%.co.kr|q,*|G%#Korea>g%.kg|q,*|G%#Kyrgyzstan>g%.la|q,*|G%#Laos>g%.lv|q,*|G%#Latvia>g%.co.ls|q,*|G%#Lesotho>g%`.ly|q,*|G%#Libya>g%.li|q,*|G%#Liechtenstein>g%.lt|q,*|G%#Lithuania>g%.lu|q,*|G%#Luxembourg>g%.mw|q,*|G%#Malawi>g%`.my|q,*|G%#Malaysia>g%.mv|q,*|G%#Maldives>g%`.mt|q,*|G%#Malta>g%.mu|q,*|G%#Mauritius>g%`.mx|q,*|G%#Mexico>g%.fm|q,*|G%#Micronesia>g%.md|q,*|G%#Moldova>g%.mn|q,*|G%#Mongolia>g%.ms|q,*|G%#Montserrat>g%.co.ma|q,*|G%#Morocco>g%`.na|q,*|G%#Namibia>g%.nr|q,*|G%#Nauru>g%`.np|q,*|G%#Nepal>g%.nl|q,*|G%#Netherlands>g%.co.nz|q,*|G%#New Zealand>g%`.ni|q,*|G%#Nicaragua>g%`.ng|q,*|G%#Nigeria>g%.nu|q,*|G%#Niue>g%`.nf|q,*|G%#Norfolk Island>g%.no|q,*|G%#Norway>g%`.om|q,*|G%#Oman>g%`.pk|q,*|G%#Pakistan>g%`.pa|q,*|G%#Panama>g%`.py|q,*|G%#Paraguay>g%`.pe|q,*|G%#Peru>g%`.ph|q,*|G%#Philippines>g%.pn|q,*|G%#Pitcairn Islands>g%.pl|q,*|G%#Poland>g%.pt|q,*|G%#Portugal>g%`.pr|q,*|G%#Puerto Rico>g%`.qa|q,*|G%#Qatar>g%.cd|q,*|G%#Rep. Dem. du Congo>g%.cg|q,*|G%#Rep. du Congo>g%.ge|q,*|G%#Repulic of Georgia>g%.ro|q,*|G%#Romania>g%.ru|q,*|G%#Russia>g%.rw|q,*|G%#Rwanda>g%.sh|q,*|G%#Saint Helena>g%`.vc|q,*|G%#Saint Vincent and the Grenadine>g%.ws|q,*|G%#Samoa>g%.sm|q,*|G%#San Marino>g%.st|q,*|G%#Sao Tome and Principe>g%`.sa|q,*|G%#Saudi Arabia>g%.sn|q,*|G%#Senegal>g%.sc|q,*|G%#Seychelles>g%`.sg|q,*|G%#Singapore>g%.sk|q,*|G%#Slovakia>g%.si|q,*|G%#Slovenia>g%`.sb|q,*|G%#Solomon Islands>g%.co.za|q,*|G%#South Africa>g%.es|q,*|G%#Spain>g%.lk|q,*|G%#Sri Lanka>g%.se|q,*|G%#Sweden>g%.ch|q,*|G%#Switzerland>g%`.tw|q,*|G%#Taiwan>g%`.tj|q,*|G%#Tajikistan>g%.co.th|q,*|G%#Thailand>g%.bs|q,*|G%#The Bahamas>g%.gm|q,*|G%#The Gambia>g%.tk|q,*|G%#Tokelau>g%.to|q,*|G%#Tonga>g%.tt|q,*|G%#Trinidad and Tobago>g%`.tr|q,*|G%#Turkey>g%.tm|q,*|G%#Turkmenistan>g%.co.ug|q,*|G%#Uganda>g%`.ua|q,*|G%#Ukraine>g%.ae|q,*|G%#United Arab Emirates>g%.co.uk|q,*|G%#United Kingdom>g%`.uy|q,*|G%#Uruguay>g%.co.uz|q,*|G%#Uzbekiston>g%.vu|q,*|G%#Vanuatu>g%.co.ve|q,*|G%#Venezuela>g%`.vn|q,*|G%#Viet Nam>g%.co.vi|q,*|G%#Virgin Islands>g%.co.zm|q,*|G%#Zambia>g%.co.zw|q,*|G%#Zimbabwe>hispavista`|cadena|HispaVista>icqit`|q|icq>www.ilse.nl|SEARCH_FOR,search_for|Ilse>infoseek.co.jp|qt|Infoseek#Japan>ixquick`|query|ixquick>kvasir.no|q,searchExpr|Kvasir>arianna.libero.it|query|Libero-Ricerca>bing`|q|Microsoft Bing>search.livedoor`|q|Livedoor.com>www.lycos`,search.lycos`|query|Lycos>lycos.fr|query|Lycos#France>lycol.de,search.lycos.de|query|Lycos#Germany>lycos.it|query|Lycos#Italy>lycos.es|query|Lycos#Spain>lycos.co.uk|query|Lycos#United Kingdom>mail.ru/search,go.mail.ru/search|q|Mail.ru>marchsearch`,search.curryguide`|query|MarchSearch>bing`|q|Microsoft Bing>myway`|searchfor|MyWay.com>nate`,search.nate`|query|Nate.com>naver`,search.naver`|query|Naver>netscape`|query,search|Netscape Search>search.nifty`|q|Nifty>odn.excite.co.jp|search|ODN>officialsearch`|qs|Official Search>dmoz.org|search|Open Directory Project>ozu.es|q|Ozu>pandia`|search|Pandia Plus>qksearch`|query|QkSearch>reference`|q|Reference.com>search.ch|q|Search.ch>searchalot`|query,q|Searchalot>sensis`.au|find|Sensis.com.au>seznam|w|Seznam.cz>g%.sina`.tw|kw|Sina#Taiwan>starmedia`|q|Starmedia>abcsok.no|q|Startsiden>suchmaschine`|suchstr|Suchmaschine>teoma`|q|Teoma>terra.es|query|Terra>thunderstone`|q|Thunderstone>tiscali.it|key|Tiscali>toile`|query,q|Toile du Quebec>busca.uol`.br|q|UOL Busca>usseek`|string|Usseek>vinden.nl|query|Vinden>vindex.nl|search_for|Vindex>virgilio.it|qs|Virgilio>voila.fr|kw|Voila>walla.co.il|q|Walla>web.de|su|Web.de>webalta.ru|q|Webalta>wp.pl|szukaj|Wirtualna Polska>woyaa`|query|WoYaa>y^`,search.y^`|p|Y^!>ar.y^`,ar.search.y^`|p|Y^!#Argentina>asia.y^`,asia.search.y^`|p|Y^!#Asia>au.y^`,au.search.y^`|p|Y^!#Australia>at.search.y^`|p|Y^!#Austria>br.y^`,br.search.y^`|p|Y^!#Brazil>ca.y^`,ca.search.y^`|p|Y^!#Canada>cn.y^`,search.cn.y^`|p|Y^!#China>dk.y^`,dk.search.y^`|p|Y^!#Denmark>fi.search.y^`|p|Y^!#Finland>fr.y^`,fr.search.y^`|p|Y^!#France>de.y^`,de.search.y^`|p|Y^!#Germany>hk.y^`,hk.search.y^`|p|Y^!#Hong Kong>in.y^`,in.search.y^`|p|Y^!#India>id.y^`,id.search.y^`|p|Y^!#Indonesia>it.y^`,it.search.y^`|p|Y^!#Italy>y^.co.jp,search.y^.co.jp|p,va|Y^!#Japan>kids.y^`,kids.y^`/search|p|Y^!#Kids>kr.y^`,kr.search.y^`|p|Y^!#Korea>malaysia.y^`,malaysia.search.y^`|p|Y^!#Malaysia>mx.y^`,mx.search.y^`|p|Y^!#Mexico>nl.y^`,nl.search.y^`|p|Y^!#Netherlands>nz.y^`,nz.search.y^`|p|Y^!#New Zealand>no.y^`,no.search.y^`|p|Y^!#Norway>ph.y^`,ph.search.y^`|p|Y^!#Philippines>ru.y^`,ru.search.y^`|p|Y^!#Russia>sg.y^`,sg.search.y^`|p|Y^!#Singapore>es.y^`,es.search.y^`|p|Y^!#Spain>telemundo.y^`,espanol.search.y^`|p|Y^!#Spanish (US : Telemundo)>se.y^`,se.search.y^`|p|Y^!#Sweden>ch.search.y^`|p|Y^!#Switzerland>tw.y^`,tw.search.y^`|p|Y^!#Taiwan>th.y^`,th.search.y^`|p|Y^!#Thailand>uk.y^`,uk.search.y^`|p|Y^!#UK and Ireland>vn.y^`,vn.search.y^`|p|Y^!#Viet Nam>yandex|text|Yandex.ru>www.zoeken.nl/|query|zoeken.nl"
    /*
 * Plugin Utility: apl v1.1
 */
    s_gmti.apl=new Function("l","v","d","u",""
        +"var s=this,m=0;if(!l)l='';if(u){var i,n,a=s.split(l,d);for(i=0;i<a."
        +"length;i++){n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCas"
        +"e()));}}if(!m)l=l?l+d+v:v;return l");
    /*
 * Utility Function: split v1.5 (JS 1.0 compatible)
 */
    s_gmti.split=new Function("l","d",""
        +"var i,x=0,a=new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x"
        +"++]=l.substring(0,i);l=l.substring(i+d.length);}return a");
    /*
 * Plugin Utility: Replace v1.0
 */
    s_gmti.repl=new Function("x","o","n",""
        +"var i=x.indexOf(o),l=n.length;while(x&&i>=0){x=x.substring(0,i)+n+x."
        +"substring(i+o.length);i=x.indexOf(o,i+l)}return x");
    /*
 * Plugin: getQueryParam 2.4
 */
    s_gmti.getQueryParam=new Function("p","d","u","h",""
        +"var s=this,v='',i,j,t;d=d?d:'';u=u?u:(s.pageURL?s.pageURL:s.wd.loca"
        +"tion);if(u=='f')u=s.gtfs().location;while(p){i=p.indexOf(',');i=i<0"
        +"?p.length:i;t=s.p_gpv(p.substring(0,i),u+'',h);if(t){t=t.indexOf('#"
        +"')>-1?t.substring(0,t.indexOf('#')):t;}if(t)v+=v?d+t:t;p=p.substrin"
        +"g(i==p.length?i:i+1)}return v");
    s_gmti.p_gpv=new Function("k","u","h",""
        +"var s=this,v='',q;j=h==1?'#':'?';i=u.indexOf(j);if(k&&i>-1){q=u.sub"
        +"string(i+1);v=s.pt(q,'&','p_gvf',k)}return v");
    s_gmti.p_gvf=new Function("t","k",""
        +"if(t){var s=this,i=t.indexOf('='),p=i<0?t:t.substring(0,i),v=i<0?'T"
        +"rue':t.substring(i+1);if(p.toLowerCase()==k.toLowerCase())return s."
        +"epa(v)}return''");

    /*
 * Plugin: linkHandler 0.5 - identify and report custom links
 */
    s_gmti.linkHandler=new Function("p","t",""
        +"var s=this,h=s.p_gh(),i,l;t=t?t:'o';if(!h||(s.linkType&&(h||s.linkN"
        +"ame)))return '';i=h.indexOf('?');h=s.linkLeaveQueryString||i<0?h:h."
        +"substring(0,i);l=s.pt(p,'|','p_gn',h.toLowerCase());if(l){s.linkNam"
        +"e=l=='[['?'':l;s.linkType=t;return h;}return '';");
    s_gmti.p_gn=new Function("t","h",""
        +"var i=t?t.indexOf('~'):-1,n,x;if(t&&h){n=i<0?'':t.substring(0,i);x="
        +"t.substring(i+1);if(h.indexOf(x.toLowerCase())>-1)return n?n:'[[';}"
        +"return 0;");
    s_gmti.p_gh=new Function(""
        +"var s=this;if(!s.eo&&!s.lnk)return '';var o=s.eo?s.eo:s.lnk,y=s.ot("
        +"o),n=s.oid(o),x=o.s_oidt;if(s.eo&&o==s.eo){while(o&&!n&&y!='BODY'){"
        +"o=o.parentElement?o.parentElement:o.parentNode;if(!o)return '';y=s."
        +"ot(o);n=s.oid(o);x=o.s_oidt}}return o.href?o.href:'';");
    /*
 * Plugin: getValOnce_v1.0
 */
    s_gmti.getValOnce=new Function("v","c","e",""
        +"var s=this,a=new Date,v=v?v:v='',c=c?c:c='s_gvo',e=e?e:0,k=s.c_r(c"
        +");if(v){a.setTime(a.getTime()+e*86400000);s.c_w(c,v,e?a:0);}return"
        +" v==k?'':v");

    /*
 * Plugin: Form Analysis 2.0 (Success, Error, Abandonment)
 */
    s_gmti.setupFormAnalysis=new Function(""
        +"var s=this;if(!s.fa){s.fa=new Object;var f=s.fa;f.ol=s.wd.onload;s."
        +"wd.onload=s.faol;f.uc=s.useCommerce;f.vu=s.varUsed;f.vl=f.uc?s.even"
        +"tList:'';f.tfl=s.trackFormList;f.fl=s.formList;f.va=new Array('',''"
        +",'','')}");
    s_gmti.sendFormEvent=new Function("t","pn","fn","en",""
        +"var s=this,f=s.fa;t=t=='s'?t:'e';f.va[0]=pn;f.va[1]=fn;f.va[3]=t=='"
        +"s'?'Success':en;s.fasl(t);f.va[1]='';f.va[3]='';");
    s_gmti.faol=new Function("e",""
        +"var s=s_c_il["+s_gmti._in+"],f=s_gmti.fa,r=true,fo,fn,i,en,t,tf;if(!e)e=s_gmti.wd."
        +"event;f.os=new Array;if(f.ol)r=f.ol(e);if(s.d.forms&&s.d.forms.leng"
        +"th>0){for(i=s.d.forms.length-1;i>=0;i--){fo=s.d.forms[i];fn=fo.name"
        +";tf=f.tfl&&s.pt(f.fl,',','ee',fn)||!f.tfl&&!s.pt(f.fl,',','ee',fn);"
        +"if(tf){f.os[fn]=fo.onsubmit;fo.onsubmit=s.faos;f.va[1]=fn;f.va[3]='"
        +"No Data Entered';for(en=0;en<fo.elements.length;en++){el=fo.element"
        +"s[en];t=el.type;if(t&&t.toUpperCase){t=t.toUpperCase();var md=el.on"
        +"mousedown,kd=el.onkeydown,omd=md?md.toString():'',okd=kd?kd.toStrin"
        +"g():'';if(omd.indexOf('.fam(')<0&&okd.indexOf('.fam(')<0){el.s_famd"
        +"=md;el.s_fakd=kd;el.onmousedown=s.fam;el.onkeydown=s.fam}}}}}f.ul=s"
        +".wd.onunload;s.wd.onunload=s.fasl;}return r;");
    s_gmti.faos=new Function("e",""
        +"var s=s_c_il["+s_gmti._in+"],f=s_gmti.fa,su;if(!e)e=s_gmti.wd.event;if(f.vu){s[f.v"
        +"u]='';f.va[1]='';f.va[3]='';}su=f.os[this.name];return su?su(e):tru"
        +"e;");
    s_gmti.fasl=new Function("e",""
        +"var s=s_c_il["+s_gmti._in+"],f=s_gmti.fa,a=f.va,l=s_gmti.wd.location,ip=s_gmti.trackPag"
        +"eName,p=s_gmti.pageName;if(a[1]!=''&&a[3]!=''){a[0]=!p&&ip?l.host+l.path"
        +"name:a[0]?a[0]:p;if(!f.uc&&a[3]!='No Data Entered'){if(e=='e')a[2]="
        +"'Error';else if(e=='s')a[2]='Success';else a[2]='Abandon'}else a[2]"
        +"='';var tp=ip?a[0]+':':'',t3=e!='s'?':('+a[3]+')':'',ym=!f.uc&&a[3]"
        +"!='No Data Entered'?tp+a[1]+':'+a[2]+t3:tp+a[1]+t3,ltv=s.linkTrackV"
        +"ars,lte=s.linkTrackEvents,up=s.usePlugins;if(f.uc){s.linkTrackVars="
        +"ltv=='None'?f.vu+',events':ltv+',events,'+f.vu;s.linkTrackEvents=lt"
        +"e=='None'?f.vl:lte+','+f.vl;f.cnt=-1;if(e=='e')s.events=s.pt(f.vl,'"
        +",','fage',2);else if(e=='s')s.events=s.pt(f.vl,',','fage',1);else s"
        +".events=s.pt(f.vl,',','fage',0)}else{s.linkTrackVars=ltv=='None'?f."
        +"vu:ltv+','+f.vu}s[f.vu]=ym;s.usePlugins=false;s.tl(true,'o','Form A"
        +"nalysis');s[f.vu]='';s.usePlugins=up}return f.ul&&e!='e'&&e!='s'?f."
        +"ul(e):true;");
    s_gmti.fam=new Function("e",""
        +"var s=s_c_il["+s_gmti._in+"],f=s_gmti.fa;if(!e) e=s_gmti.wd.event;var o=s_gmti.trackLas"
        +"tChanged,et=e.type.toUpperCase(),t=this.type.toUpperCase(),fn=this."
        +"form.name,en=this.name,sc=false;if(document.layers){kp=e.which;b=e."
        +"which}else{kp=e.keyCode;b=e.button}et=et=='MOUSEDOWN'?1:et=='KEYDOW"
        +"N'?2:et;if(f.ce!=en||f.cf!=fn){if(et==1&&b!=2&&'BUTTONSUBMITRESETIM"
        +"AGERADIOCHECKBOXSELECT-ONEFILE'.indexOf(t)>-1){f.va[1]=fn;f.va[3]=e"
        +"n;sc=true}else if(et==1&&b==2&&'TEXTAREAPASSWORDFILE'.indexOf(t)>-1"
        +"){f.va[1]=fn;f.va[3]=en;sc=true}else if(et==2&&kp!=9&&kp!=13){f.va["
        +"1]=fn;f.va[3]=en;sc=true}if(sc){nface=en;nfacf=fn}}if(et==1&&this.s"
        +"_famd)return this.s_famd(e);if(et==2&&this.s_fakd)return this.s_fak"
        +"d(e);");
    s_gmti.ee=new Function("e","n",""
        +"return n&&n.toLowerCase?e.toLowerCase()==n.toLowerCase():false;");
    s_gmti.fage=new Function("e","a",""
        +"var s=this,f=s.fa,x=f.cnt;x=x?x+1:1;f.cnt=x;return x==a?e:'';");
    /*
* Plugin: getPercentPageViewed v1.2
*/
    s_gmti.getPercentPageViewed=new Function("",""
        +"var s=this;if(typeof(s_gmti.linkType)=='undefined'||s_gmti.linkType=='e'){var"
        +" v=s_gmti.c_r('s_ppv');s_gmti.c_w('s_ppv',0);return v;}");
    s_gmti.getPPVCalc=new Function("",""
        +"var s=s_c_il["+s_gmti._in+"],dh=Math.max(Math.max(s_gmti.d.body.scrollHeight,"
        +"s_gmti.d.documentElement.scrollHeight),Math.max(s_gmti.d.body.offsetHeight,s_gmti."
        +"d.documentElement.offsetHeight),Math.max(s_gmti.d.body.clientHeight,s_gmti.d."
        +"documentElement.clientHeight)),vph=s_gmti.wd.innerHeight||(s_gmti.d.documentE"
        +"lement.clientHeight||s_gmti.d.body.clientHeight),st=s_gmti.wd.pageYOffset||(s"
        +".wd.document.documentElement.scrollTop||s_gmti.wd.document.body.scrollTo"
        +"p),vh=st+vph,pv=Math.round(vh/dh*100),cp=s_gmti.c_r('s_ppv');if(pv>100){"
        +"s_gmti.c_w('s_ppv','');}else if(pv>cp){s_gmti.c_w('s_ppv',pv);}");
    s_gmti.getPPVSetup=new Function("",""
        +"var s=this;if(s_gmti.wd.addEventListener){s_gmti.wd.addEventListener('load',s"
        +".getPPVCalc,false);s_gmti.wd.addEventListener('scroll',s_gmti.getPPVCalc,fals"
        +"e);s_gmti.wd.addEventListener('resize',s_gmti.getPPVCalc,false);}else if(s_gmti.wd"
        +".attachEvent){s_gmti.wd.attachEvent('onload',s_gmti.getPPVCalc);s_gmti.wd.attachEv"
        +"ent('onscroll',s_gmti.getPPVCalc);s_gmti.wd.attachEvent('onresize',s_gmti.getPPVCa"
        +"lc);}");
    s_gmti.getPPVSetup();
    /*
* Plugin: getPreviousValue_v1.0 - return previous value of designated
* variable (requires split utility)
*/
    s_gmti.getPreviousValue=new Function("v","c","el",""
        +"var s=this,t=new Date,i,j,r='';t.setTime(t.getTime()+1800000);if(el"
        +"){if(s_gmti.events){i=s_gmti.split(el,',');j=s_gmti.split(s_gmti.events,',');for(x in i"
        +"){for(y in j){if(i[x]==j[y]){if(s_gmti.c_r(c)) r=s_gmti.c_r(c);v?s_gmti.c_w(c,v,t)"
        +":s_gmti.c_w(c,'no value',t);return r}}}}}else{if(s_gmti.c_r(c)) r=s_gmti.c_r(c);v?"
        +"s_gmti.c_w(c,v,t):s_gmti.c_w(c,'no value',t);return r}");

    /* WARNING: Changing any of the below variables will cause drastic
changes to how your visitor data is collected.  Changes should only be
made when instructed to do so by your account manager.*/
    s_gmti.visitorNamespace="gntbcstglobal"
    s_gmti.trackingServer="gntbcstglobal.112.2o7.net"

    return s_gmti; 
})(); /************* DO NOT ALTER ANYTHING BELOW THIS LINE ! **************/
var s_code='',s_objectID;
function s_gi(un,pg,ss){
    var c="s.version='H.23.8';s.an=s_an;s.logDebug=function(m){var s=this,tcf=new Function('var e;try{console.log(\"'+s.rep(s.rep(m,\"\\n\",\"\\\\n\"),\""
    +"\\\"\",\"\\\\\\\"\")+'\");}catch(e){}');tcf()};s.cls=function(x,c){var i,y='';if(!c)c=this.an;for(i=0;i<x.length;i++){n=x.substring(i,i+1);if(c.indexOf(n)>=0)y+=n}return y};s.fl=function(x,l){retur"
    +"n x?(''+x).substring(0,l):x};s.co=function(o){if(!o)return o;var n=new Object,x;for(x in o)if(x.indexOf('select')<0&&x.indexOf('filter')<0)n[x]=o[x];return n};s.num=function(x){x=''+x;for(var p=0;p"
    +"<x.length;p++)if(('0123456789').indexOf(x.substring(p,p+1))<0)return 0;return 1};s.rep=s_rep;s.sp=s_sp;s.jn=s_jn;s.ape=function(x){var s=this,h='0123456789ABCDEF',i,c=s.charSet,n,l,e,y='';c=c?c.toU"
    +"pperCase():'';if(x){x=''+x;if(s.em==3)x=encodeURIComponent(x);else if(c=='AUTO'&&('').charCodeAt){for(i=0;i<x.length;i++){c=x.substring(i,i+1);n=x.charCodeAt(i);if(n>127){l=0;e='';while(n||l<4){e=h"
    +".substring(n%16,n%16+1)+e;n=(n-n%16)/16;l++}y+='%u'+e}else if(c=='+')y+='%2B';else y+=escape(c)}x=y}else x=escape(''+x);x=s.rep(x,'+','%2B');if(c&&c!='AUTO'&&s.em==1&&x.indexOf('%u')<0&&x.indexOf('"
    +"%U')<0){i=x.indexOf('%');while(i>=0){i++;if(h.substring(8).indexOf(x.substring(i,i+1).toUpperCase())>=0)return x.substring(0,i)+'u00'+x.substring(i);i=x.indexOf('%',i)}}}return x};s.epa=function(x)"
    +"{var s=this;if(x){x=s.rep(''+x,'+',' ');return s.em==3?decodeURIComponent(x):unescape(x)}return x};s.pt=function(x,d,f,a){var s=this,t=x,z=0,y,r;while(t){y=t.indexOf(d);y=y<0?t.length:y;t=t.substri"
    +"ng(0,y);r=s[f](t,a);if(r)return r;z+=y+d.length;t=x.substring(z,x.length);t=z<x.length?t:''}return ''};s.isf=function(t,a){var c=a.indexOf(':');if(c>=0)a=a.substring(0,c);c=a.indexOf('=');if(c>=0)a"
    +"=a.substring(0,c);if(t.substring(0,2)=='s_')t=t.substring(2);return (t!=''&&t==a)};s.fsf=function(t,a){var s=this;if(s.pt(a,',','isf',t))s.fsg+=(s.fsg!=''?',':'')+t;return 0};s.fs=function(x,f){var"
    +" s=this;s.fsg='';s.pt(x,',','fsf',f);return s.fsg};s.si=function(){var s=this,i,k,v,c=s_gi+'var s=s_gi(\"'+s.oun+'\");s.sa(\"'+s.un+'\");';for(i=0;i<s.va_g.length;i++){k=s.va_g[i];v=s[k];if(v!=unde"
    +"fined){if(typeof(v)!='number')c+='s.'+k+'=\"'+s_fe(v)+'\";';else c+='s.'+k+'='+v+';'}}c+=\"s.lnk=s.eo=s.linkName=s.linkType=s.wd.s_objectID=s.ppu=s.pe=s.pev1=s.pev2=s.pev3='';\";return c};s.c_d='';"
    +"s.c_gdf=function(t,a){var s=this;if(!s.num(t))return 1;return 0};s.c_gd=function(){var s=this,d=s.wd.location.hostname,n=s.fpCookieDomainPeriods,p;if(!n)n=s.cookieDomainPeriods;if(d&&!s.c_d){n=n?pa"
    +"rseInt(n):2;n=n>2?n:2;p=d.lastIndexOf('.');if(p>=0){while(p>=0&&n>1){p=d.lastIndexOf('.',p-1);n--}s.c_d=p>0&&s.pt(d,'.','c_gdf',0)?d.substring(p):d}}return s.c_d};s.c_r=function(k){var s=this;k=s.a"
    +"pe(k);var c=' '+s.d.cookie,i=c.indexOf(' '+k+'='),e=i<0?i:c.indexOf(';',i),v=i<0?'':s.epa(c.substring(i+2+k.length,e<0?c.length:e));return v!='[[B]]'?v:''};s.c_w=function(k,v,e){var s=this,d=s.c_gd"
    +"(),l=s.cookieLifetime,t;v=''+v;l=l?(''+l).toUpperCase():'';if(e&&l!='SESSION'&&l!='NONE'){t=(v!=''?parseInt(l?l:0):-60);if(t){e=new Date;e.setTime(e.getTime()+(t*1000))}}if(k&&l!='NONE'){s.d.cookie"
    +"=k+'='+s.ape(v!=''?v:'[[B]]')+'; path=/;'+(e&&l!='SESSION'?' expires='+e.toGMTString()+';':'')+(d?' domain='+d+';':'');return s.c_r(k)==v}return 0};s.eh=function(o,e,r,f){var s=this,b='s_'+e+'_'+s."
    +"_in,n=-1,l,i,x;if(!s.ehl)s.ehl=new Array;l=s.ehl;for(i=0;i<l.length&&n<0;i++){if(l[i].o==o&&l[i].e==e)n=i}if(n<0){n=i;l[n]=new Object}x=l[n];x.o=o;x.e=e;f=r?x.b:f;if(r||f){x.b=r?0:o[e];x.o[e]=f}if("
    +"x.b){x.o[b]=x.b;return b}return 0};s.cet=function(f,a,t,o,b){var s=this,r,tcf;if(s.apv>=5&&(!s.isopera||s.apv>=7)){tcf=new Function('s','f','a','t','var e,r;try{r=s[f](a)}catch(e){r=s[t](e)}return "
    +"r');r=tcf(s,f,a,t)}else{if(s.ismac&&s.u.indexOf('MSIE 4')>=0)r=s[b](a);else{s.eh(s.wd,'onerror',0,o);r=s[f](a);s.eh(s.wd,'onerror',1)}}return r};s.gtfset=function(e){var s=this;return s.tfs};s.gtfs"
    +"oe=new Function('e','var s=s_c_il['+s._in+'],c;s.eh(window,\"onerror\",1);s.etfs=1;c=s.t();if(c)s.d.write(c);s.etfs=0;return true');s.gtfsfb=function(a){return window};s.gtfsf=function(w){var s=thi"
    +"s,p=w.parent,l=w.location;s.tfs=w;if(p&&p.location!=l&&p.location.host==l.host){s.tfs=p;return s.gtfsf(s.tfs)}return s.tfs};s.gtfs=function(){var s=this;if(!s.tfs){s.tfs=s.wd;if(!s.etfs)s.tfs=s.cet"
    +"('gtfsf',s.tfs,'gtfset',s.gtfsoe,'gtfsfb')}return s.tfs};s.mrq=function(u){var s=this,l=s.rl[u],n,r;s.rl[u]=0;if(l)for(n=0;n<l.length;n++){r=l[n];s.mr(0,0,r.r,r.t,r.u)}};s.flushBufferedRequests=fun"
    +"ction(){};s.mr=function(sess,q,rs,ta,u){var s=this,dc=s.dc,t1=s.trackingServer,t2=s.trackingServerSecure,tb=s.trackingServerBase,p='.sc',ns=s.visitorNamespace,un=s.cls(u?u:(ns?ns:s.fun)),r=new Obje"
    +"ct,l,imn='s_i_'+(un),im,b,e;if(!rs){if(t1){if(t2&&s.ssl)t1=t2}else{if(!tb)tb='2o7.net';if(dc)dc=(''+dc).toLowerCase();else dc='d1';if(tb=='2o7.net'){if(dc=='d1')dc='112';else if(dc=='d2')dc='122';p"
    +"=''}t1=un+'.'+dc+'.'+p+tb}rs='http'+(s.ssl?'s':'')+'://'+t1+'/b/ss/'+s.un+'/'+(s.mobile?'5.1':'1')+'/'+s.version+(s.tcn?'T':'')+'/'+sess+'?AQB=1&ndh=1'+(q?q:'')+'&AQE=1';if(s.isie&&!s.ismac)rs=s.fl"
    +"(rs,2047)}if(s.d.images&&s.apv>=3&&(!s.isopera||s.apv>=7)&&(s.ns6<0||s.apv>=6.1)){if(!s.rc)s.rc=new Object;if(!s.rc[un]){s.rc[un]=1;if(!s.rl)s.rl=new Object;s.rl[un]=new Array;setTimeout('if(window"
    +".s_c_il)window.s_c_il['+s._in+'].mrq(\"'+un+'\")',750)}else{l=s.rl[un];if(l){r.t=ta;r.u=un;r.r=rs;l[l.length]=r;return ''}imn+='_'+s.rc[un];s.rc[un]++}im=s.wd[imn];if(!im)im=s.wd[imn]=new Image;im."
    +"s_l=0;im.onload=new Function('e','this.s_l=1;var wd=window,s;if(wd.s_c_il){s=wd.s_c_il['+s._in+'];s.mrq(\"'+un+'\");s.nrs--;if(!s.nrs)s.m_m(\"rr\")}');if(!s.nrs){s.nrs=1;s.m_m('rs')}else s.nrs++;if"
    +"(s.debugTracking){var d='AppMeasurement Debug: '+rs,dl=s.sp(rs,'&'),dln;for(dln=0;dln<dl.length;dln++)d+=\"\\n\\t\"+s.epa(dl[dln]);s.logDebug(d)}im.src=rs;if((!ta||ta=='_self'||ta=='_top'||(s.wd.na"
    +"me&&ta==s.wd.name))&&rs.indexOf('&pe=')>=0){b=e=new Date;while(!im.s_l&&e.getTime()-b.getTime()<500)e=new Date}return ''}return '<im'+'g sr'+'c=\"'+rs+'\" width=1 height=1 border=0 alt=\"\">'};s.gg"
    +"=function(v){var s=this;if(!s.wd['s_'+v])s.wd['s_'+v]='';return s.wd['s_'+v]};s.glf=function(t,a){if(t.substring(0,2)=='s_')t=t.substring(2);var s=this,v=s.gg(t);if(v)s[t]=v};s.gl=function(v){var s"
    +"=this;if(s.pg)s.pt(v,',','glf',0)};s.rf=function(x){var s=this,y,i,j,h,p,l=0,q,a,b='',c='',t;if(x&&x.length>255){y=''+x;i=y.indexOf('?');if(i>0){q=y.substring(i+1);y=y.substring(0,i);h=y.toLowerCas"
    +"e();j=0;if(h.substring(0,7)=='http://')j+=7;else if(h.substring(0,8)=='https://')j+=8;i=h.indexOf(\"/\",j);if(i>0){h=h.substring(j,i);p=y.substring(i);y=y.substring(0,i);if(h.indexOf('google')>=0)l"
    +"=',q,ie,start,search_key,word,kw,cd,';else if(h.indexOf('yahoo.co')>=0)l=',p,ei,';if(l&&q){a=s.sp(q,'&');if(a&&a.length>1){for(j=0;j<a.length;j++){t=a[j];i=t.indexOf('=');if(i>0&&l.indexOf(','+t.su"
    +"bstring(0,i)+',')>=0)b+=(b?'&':'')+t;else c+=(c?'&':'')+t}if(b&&c)q=b+'&'+c;else c=''}i=253-(q.length-c.length)-y.length;x=y+(i>0?p.substring(0,i):'')+'?'+q}}}}return x};s.s2q=function(k,v,vf,vfp,f"
    +"){var s=this,qs='',sk,sv,sp,ss,nke,nk,nf,nfl=0,nfn,nfm;if(k==\"contextData\")k=\"c\";if(v){for(sk in v) {if((!f||sk.substring(0,f.length)==f)&&v[sk]&&(!vf||vf.indexOf(','+(vfp?vfp+'.':'')+sk+',')>="
    +"0)){nfm=0;if(nfl)for(nfn=0;nfn<nfl.length;nfn++)if(sk.substring(0,nfl[nfn].length)==nfl[nfn])nfm=1;if(!nfm){if(qs=='')qs+='&'+k+'.';sv=v[sk];if(f)sk=sk.substring(f.length);if(sk.length>0){nke=sk.in"
    +"dexOf('.');if(nke>0){nk=sk.substring(0,nke);nf=(f?f:'')+nk+'.';if(!nfl)nfl=new Array;nfl[nfl.length]=nf;qs+=s.s2q(nk,v,vf,vfp,nf)}else{if(typeof(sv)=='boolean'){if(sv)sv='true';else sv='false'}if(s"
    +"v){if(vfp=='retrieveLightData'&&f.indexOf('.contextData.')<0){sp=sk.substring(0,4);ss=sk.substring(4);if(sk=='transactionID')sk='xact';else if(sk=='channel')sk='ch';else if(sk=='campaign')sk='v0';e"
    +"lse if(s.num(ss)){if(sp=='prop')sk='c'+ss;else if(sp=='eVar')sk='v'+ss;else if(sp=='list')sk='l'+ss;else if(sp=='hier'){sk='h'+ss;sv=sv.substring(0,255)}}}qs+='&'+s.ape(sk)+'='+s.ape(sv)}}}}}}if(qs"
    +"!='')qs+='&.'+k}return qs};s.hav=function(){var s=this,qs='',l,fv='',fe='',mn,i,e;if(s.lightProfileID){l=s.va_m;fv=s.lightTrackVars;if(fv)fv=','+fv+','+s.vl_mr+','}else{l=s.va_t;if(s.pe||s.linkType"
    +"){fv=s.linkTrackVars;fe=s.linkTrackEvents;if(s.pe){mn=s.pe.substring(0,1).toUpperCase()+s.pe.substring(1);if(s[mn]){fv=s[mn].trackVars;fe=s[mn].trackEvents}}}if(fv)fv=','+fv+','+s.vl_l+','+s.vl_l2;"
    +"if(fe){fe=','+fe+',';if(fv)fv+=',events,'}if (s.events2)e=(e?',':'')+s.events2}for(i=0;i<l.length;i++){var k=l[i],v=s[k],b=k.substring(0,4),x=k.substring(4),n=parseInt(x),q=k;if(!v)if(k=='events'&&"
    +"e){v=e;e=''}if(v&&(!fv||fv.indexOf(','+k+',')>=0)&&k!='linkName'&&k!='linkType'){if(k=='timestamp')q='ts';else if(k=='dynamicVariablePrefix')q='D';else if(k=='visitorID')q='vid';else if(k=='pageURL"
    +"'){q='g';v=s.fl(v,255)}else if(k=='referrer'){q='r';v=s.fl(s.rf(v),255)}else if(k=='vmk'||k=='visitorMigrationKey')q='vmt';else if(k=='visitorMigrationServer'){q='vmf';if(s.ssl&&s.visitorMigrationS"
    +"erverSecure)v=''}else if(k=='visitorMigrationServerSecure'){q='vmf';if(!s.ssl&&s.visitorMigrationServer)v=''}else if(k=='charSet'){q='ce';if(v.toUpperCase()=='AUTO')v='ISO8859-1';else if(s.em==2||s"
    +".em==3)v='UTF-8'}else if(k=='visitorNamespace')q='ns';else if(k=='cookieDomainPeriods')q='cdp';else if(k=='cookieLifetime')q='cl';else if(k=='variableProvider')q='vvp';else if(k=='currencyCode')q='"
    +"cc';else if(k=='channel')q='ch';else if(k=='transactionID')q='xact';else if(k=='campaign')q='v0';else if(k=='resolution')q='s';else if(k=='colorDepth')q='c';else if(k=='javascriptVersion')q='j';els"
    +"e if(k=='javaEnabled')q='v';else if(k=='cookiesEnabled')q='k';else if(k=='browserWidth')q='bw';else if(k=='browserHeight')q='bh';else if(k=='connectionType')q='ct';else if(k=='homepage')q='hp';else"
    +" if(k=='plugins')q='p';else if(k=='events'){if(e)v+=(v?',':'')+e;if(fe)v=s.fs(v,fe)}else if(k=='events2')v='';else if(k=='contextData'){qs+=s.s2q('c',s[k],fv,k,0);v=''}else if(k=='lightProfileID')q"
    +"='mtp';else if(k=='lightStoreForSeconds'){q='mtss';if(!s.lightProfileID)v=''}else if(k=='lightIncrementBy'){q='mti';if(!s.lightProfileID)v=''}else if(k=='retrieveLightProfiles')q='mtsr';else if(k=="
    +"'deleteLightProfiles')q='mtsd';else if(k=='retrieveLightData'){if(s.retrieveLightProfiles)qs+=s.s2q('mts',s[k],fv,k,0);v=''}else if(s.num(x)){if(b=='prop')q='c'+n;else if(b=='eVar')q='v'+n;else if("
    +"b=='list')q='l'+n;else if(b=='hier'){q='h'+n;v=s.fl(v,255)}}if(v)qs+='&'+s.ape(q)+'='+(k.substring(0,3)!='pev'?s.ape(v):v)}}return qs};s.ltdf=function(t,h){t=t?t.toLowerCase():'';h=h?h.toLowerCase("
    +"):'';var qi=h.indexOf('?');h=qi>=0?h.substring(0,qi):h;if(t&&h.substring(h.length-(t.length+1))=='.'+t)return 1;return 0};s.ltef=function(t,h){t=t?t.toLowerCase():'';h=h?h.toLowerCase():'';if(t&&h."
    +"indexOf(t)>=0)return 1;return 0};s.lt=function(h){var s=this,lft=s.linkDownloadFileTypes,lef=s.linkExternalFilters,lif=s.linkInternalFilters;lif=lif?lif:s.wd.location.hostname;h=h.toLowerCase();if("
    +"s.trackDownloadLinks&&lft&&s.pt(lft,',','ltdf',h))return 'd';if(s.trackExternalLinks&&h.substring(0,1)!='#'&&(lef||lif)&&(!lef||s.pt(lef,',','ltef',h))&&(!lif||!s.pt(lif,',','ltef',h)))return 'e';r"
    +"eturn ''};s.lc=new Function('e','var s=s_c_il['+s._in+'],b=s.eh(this,\"onclick\");s.lnk=s.co(this);s.t();s.lnk=0;if(b)return this[b](e);return true');s.bc=new Function('e','var s=s_c_il['+s._in+'],"
    +"f,tcf;if(s.d&&s.d.all&&s.d.all.cppXYctnr)return;s.eo=e.srcElement?e.srcElement:e.target;tcf=new Function(\"s\",\"var e;try{if(s.eo&&(s.eo.tagName||s.eo.parentElement||s.eo.parentNode))s.t()}catch(e"
    +"){}\");tcf(s);s.eo=0');s.oh=function(o){var s=this,l=s.wd.location,h=o.href?o.href:'',i,j,k,p;i=h.indexOf(':');j=h.indexOf('?');k=h.indexOf('/');if(h&&(i<0||(j>=0&&i>j)||(k>=0&&i>k))){p=o.protocol&"
    +"&o.protocol.length>1?o.protocol:(l.protocol?l.protocol:'');i=l.pathname.lastIndexOf('/');h=(p?p+'//':'')+(o.host?o.host:(l.host?l.host:''))+(h.substring(0,1)!='/'?l.pathname.substring(0,i<0?0:i)+'/"
    +"':'')+h}return h};s.ot=function(o){var t=o.tagName;if(o.tagUrn||(o.scopeName&&o.scopeName.toUpperCase()!='HTML'))return '';t=t&&t.toUpperCase?t.toUpperCase():'';if(t=='SHAPE')t='';if(t){if((t=='INP"
    +"UT'||t=='BUTTON')&&o.type&&o.type.toUpperCase)t=o.type.toUpperCase();else if(!t&&o.href)t='A';}return t};s.oid=function(o){var s=this,t=s.ot(o),p,c,n='',x=0;if(t&&!o.s_oid){p=o.protocol;c=o.onclick"
    +";if(o.href&&(t=='A'||t=='AREA')&&(!c||!p||p.toLowerCase().indexOf('javascript')<0))n=s.oh(o);else if(c){n=s.rep(s.rep(s.rep(s.rep(''+c,\"\\r\",''),\"\\n\",''),\"\\t\",''),' ','');x=2}else if(t=='IN"
    +"PUT'||t=='SUBMIT'){if(o.value)n=o.value;else if(o.innerText)n=o.innerText;else if(o.textContent)n=o.textContent;x=3}else if(o.src&&t=='IMAGE')n=o.src;if(n){o.s_oid=s.fl(n,100);o.s_oidt=x}}return o."
    +"s_oid};s.rqf=function(t,un){var s=this,e=t.indexOf('='),u=e>=0?t.substring(0,e):'',q=e>=0?s.epa(t.substring(e+1)):'';if(u&&q&&(','+u+',').indexOf(','+un+',')>=0){if(u!=s.un&&s.un.indexOf(',')>=0)q="
    +"'&u='+u+q+'&u=0';return q}return ''};s.rq=function(un){if(!un)un=this.un;var s=this,c=un.indexOf(','),v=s.c_r('s_sq'),q='';if(c<0)return s.pt(v,'&','rqf',un);return s.pt(un,',','rq',0)};s.sqp=funct"
    +"ion(t,a){var s=this,e=t.indexOf('='),q=e<0?'':s.epa(t.substring(e+1));s.sqq[q]='';if(e>=0)s.pt(t.substring(0,e),',','sqs',q);return 0};s.sqs=function(un,q){var s=this;s.squ[un]=q;return 0};s.sq=fun"
    +"ction(q){var s=this,k='s_sq',v=s.c_r(k),x,c=0;s.sqq=new Object;s.squ=new Object;s.sqq[q]='';s.pt(v,'&','sqp',0);s.pt(s.un,',','sqs',q);v='';for(x in s.squ)if(x&&(!Object||!Object.prototype||!Object"
    +".prototype[x]))s.sqq[s.squ[x]]+=(s.sqq[s.squ[x]]?',':'')+x;for(x in s.sqq)if(x&&(!Object||!Object.prototype||!Object.prototype[x])&&s.sqq[x]&&(x==q||c<2)){v+=(v?'&':'')+s.sqq[x]+'='+s.ape(x);c++}re"
    +"turn s.c_w(k,v,0)};s.wdl=new Function('e','var s=s_c_il['+s._in+'],r=true,b=s.eh(s.wd,\"onload\"),i,o,oc;if(b)r=this[b](e);for(i=0;i<s.d.links.length;i++){o=s.d.links[i];oc=o.onclick?\"\"+o.onclick"
    +":\"\";if((oc.indexOf(\"s_gs(\")<0||oc.indexOf(\".s_oc(\")>=0)&&oc.indexOf(\".tl(\")<0)s.eh(o,\"onclick\",0,s.lc);}return r');s.wds=function(){var s=this;if(s.apv>3&&(!s.isie||!s.ismac||s.apv>=5)){i"
    +"f(s.b&&s.b.attachEvent)s.b.attachEvent('onclick',s.bc);else if(s.b&&s.b.addEventListener)s.b.addEventListener('click',s.bc,false);else s.eh(s.wd,'onload',0,s.wdl)}};s.vs=function(x){var s=this,v=s."
    +"visitorSampling,g=s.visitorSamplingGroup,k='s_vsn_'+s.un+(g?'_'+g:''),n=s.c_r(k),e=new Date,y=e.getYear();e.setYear(y+10+(y<1900?1900:0));if(v){v*=100;if(!n){if(!s.c_w(k,x,e))return 0;n=x}if(n%1000"
    +"0>v)return 0}return 1};s.dyasmf=function(t,m){if(t&&m&&m.indexOf(t)>=0)return 1;return 0};s.dyasf=function(t,m){var s=this,i=t?t.indexOf('='):-1,n,x;if(i>=0&&m){var n=t.substring(0,i),x=t.substring"
    +"(i+1);if(s.pt(x,',','dyasmf',m))return n}return 0};s.uns=function(){var s=this,x=s.dynamicAccountSelection,l=s.dynamicAccountList,m=s.dynamicAccountMatch,n,i;s.un=s.un.toLowerCase();if(x&&l){if(!m)"
    +"m=s.wd.location.host;if(!m.toLowerCase)m=''+m;l=l.toLowerCase();m=m.toLowerCase();n=s.pt(l,';','dyasf',m);if(n)s.un=n}i=s.un.indexOf(',');s.fun=i<0?s.un:s.un.substring(0,i)};s.sa=function(un){var s"
    +"=this;s.un=un;if(!s.oun)s.oun=un;else if((','+s.oun+',').indexOf(','+un+',')<0)s.oun+=','+un;s.uns()};s.m_i=function(n,a){var s=this,m,f=n.substring(0,1),r,l,i;if(!s.m_l)s.m_l=new Object;if(!s.m_nl"
    +")s.m_nl=new Array;m=s.m_l[n];if(!a&&m&&m._e&&!m._i)s.m_a(n);if(!m){m=new Object,m._c='s_m';m._in=s.wd.s_c_in;m._il=s._il;m._il[m._in]=m;s.wd.s_c_in++;m.s=s;m._n=n;m._l=new Array('_c','_in','_il','_"
    +"i','_e','_d','_dl','s','n','_r','_g','_g1','_t','_t1','_x','_x1','_rs','_rr','_l');s.m_l[n]=m;s.m_nl[s.m_nl.length]=n}else if(m._r&&!m._m){r=m._r;r._m=m;l=m._l;for(i=0;i<l.length;i++)if(m[l[i]])r[l"
    +"[i]]=m[l[i]];r._il[r._in]=r;m=s.m_l[n]=r}if(f==f.toUpperCase())s[n]=m;return m};s.m_a=new Function('n','g','e','if(!g)g=\"m_\"+n;var s=s_c_il['+s._in+'],c=s[g+\"_c\"],m,x,f=0;if(!c)c=s.wd[\"s_\"+g+"
    +"\"_c\"];if(c&&s_d)s[g]=new Function(\"s\",s_ft(s_d(c)));x=s[g];if(!x)x=s.wd[\\'s_\\'+g];if(!x)x=s.wd[g];m=s.m_i(n,1);if(x&&(!m._i||g!=\"m_\"+n)){m._i=f=1;if((\"\"+x).indexOf(\"function\")>=0)x(s);e"
    +"lse s.m_m(\"x\",n,x,e)}m=s.m_i(n,1);if(m._dl)m._dl=m._d=0;s.dlt();return f');s.m_m=function(t,n,d,e){t='_'+t;var s=this,i,x,m,f='_'+t,r=0,u;if(s.m_l&&s.m_nl)for(i=0;i<s.m_nl.length;i++){x=s.m_nl[i]"
    +";if(!n||x==n){m=s.m_i(x);u=m[t];if(u){if((''+u).indexOf('function')>=0){if(d&&e)u=m[t](d,e);else if(d)u=m[t](d);else u=m[t]()}}if(u)r=1;u=m[t+1];if(u&&!m[f]){if((''+u).indexOf('function')>=0){if(d&"
    +"&e)u=m[t+1](d,e);else if(d)u=m[t+1](d);else u=m[t+1]()}}m[f]=1;if(u)r=1}}return r};s.m_ll=function(){var s=this,g=s.m_dl,i,o;if(g)for(i=0;i<g.length;i++){o=g[i];if(o)s.loadModule(o.n,o.u,o.d,o.l,o."
    +"e,1);g[i]=0}};s.loadModule=function(n,u,d,l,e,ln){var s=this,m=0,i,g,o=0,f1,f2,c=s.h?s.h:s.b,b,tcf;if(n){i=n.indexOf(':');if(i>=0){g=n.substring(i+1);n=n.substring(0,i)}else g=\"m_\"+n;m=s.m_i(n)}i"
    +"f((l||(n&&!s.m_a(n,g)))&&u&&s.d&&c&&s.d.createElement){if(d){m._d=1;m._dl=1}if(ln){if(s.ssl)u=s.rep(u,'http:','https:');i='s_s:'+s._in+':'+n+':'+g;b='var s=s_c_il['+s._in+'],o=s.d.getElementById(\""
    +"'+i+'\");if(s&&o){if(!o.l&&s.wd.'+g+'){o.l=1;if(o.i)clearTimeout(o.i);o.i=0;s.m_a(\"'+n+'\",\"'+g+'\"'+(e?',\"'+e+'\"':'')+')}';f2=b+'o.c++;if(!s.maxDelay)s.maxDelay=250;if(!o.l&&o.c<(s.maxDelay*2)"
    +"/100)o.i=setTimeout(o.f2,100)}';f1=new Function('e',b+'}');tcf=new Function('s','c','i','u','f1','f2','var e,o=0;try{o=s.d.createElement(\"script\");if(o){o.type=\"text/javascript\";'+(n?'o.id=i;o."
    +"defer=true;o.onload=o.onreadystatechange=f1;o.f2=f2;o.l=0;':'')+'o.src=u;c.appendChild(o);'+(n?'o.c=0;o.i=setTimeout(f2,100)':'')+'}}catch(e){o=0}return o');o=tcf(s,c,i,u,f1,f2)}else{o=new Object;o"
    +".n=n+':'+g;o.u=u;o.d=d;o.l=l;o.e=e;g=s.m_dl;if(!g)g=s.m_dl=new Array;i=0;while(i<g.length&&g[i])i++;g[i]=o}}else if(n){m=s.m_i(n);m._e=1}return m};s.voa=function(vo,r){var s=this,l=s.va_g,i,k,v,x;f"
    +"or(i=0;i<l.length;i++){k=l[i];v=vo[k];if(v||vo['!'+k]){if(!r&&(k==\"contextData\"||k==\"retrieveLightData\")&&s[k])for(x in s[k])if(!v[x])v[x]=s[k][x];s[k]=v}}};s.vob=function(vo){var s=this,l=s.va"
    +"_g,i,k;for(i=0;i<l.length;i++){k=l[i];vo[k]=s[k];if(!vo[k])vo['!'+k]=1}};s.dlt=new Function('var s=s_c_il['+s._in+'],d=new Date,i,vo,f=0;if(s.dll)for(i=0;i<s.dll.length;i++){vo=s.dll[i];if(vo){if(!"
    +"s.m_m(\"d\")||d.getTime()-vo._t>=s.maxDelay){s.dll[i]=0;s.t(vo)}else f=1}}if(s.dli)clearTimeout(s.dli);s.dli=0;if(f){if(!s.dli)s.dli=setTimeout(s.dlt,s.maxDelay)}else s.dll=0');s.dl=function(vo){va"
    +"r s=this,d=new Date;if(!vo)vo=new Object;s.vob(vo);vo._t=d.getTime();if(!s.dll)s.dll=new Array;s.dll[s.dll.length]=vo;if(!s.maxDelay)s.maxDelay=250;s.dlt()};s.track=s.t=function(vo){var s=this,trk="
    +"1,tm=new Date,sed=Math&&Math.random?Math.floor(Math.random()*10000000000000):tm.getTime(),sess='s'+Math.floor(tm.getTime()/10800000)%10+sed,y=tm.getYear(),vt=tm.getDate()+'/'+tm.getMonth()+'/'+(y<1"
    +"900?y+1900:y)+' '+tm.getHours()+':'+tm.getMinutes()+':'+tm.getSeconds()+' '+tm.getDay()+' '+tm.getTimezoneOffset(),tcf,tfs=s.gtfs(),ta=-1,q='',qs='',code='',vb=new Object;s.gl(s.vl_g);s.uns();s.m_l"
    +"l();if(!s.td){var tl=tfs.location,a,o,i,x='',c='',v='',p='',bw='',bh='',j='1.0',k=s.c_w('s_cc','true',0)?'Y':'N',hp='',ct='',pn=0,ps;if(String&&String.prototype){j='1.1';if(j.match){j='1.2';if(tm.s"
    +"etUTCDate){j='1.3';if(s.isie&&s.ismac&&s.apv>=5)j='1.4';if(pn.toPrecision){j='1.5';a=new Array;if(a.forEach){j='1.6';i=0;o=new Object;tcf=new Function('o','var e,i=0;try{i=new Iterator(o)}catch(e){"
    +"}return i');i=tcf(o);if(i&&i.next)j='1.7'}}}}}if(s.apv>=4)x=screen.width+'x'+screen.height;if(s.isns||s.isopera){if(s.apv>=3){v=s.n.javaEnabled()?'Y':'N';if(s.apv>=4){c=screen.pixelDepth;bw=s.wd.in"
    +"nerWidth;bh=s.wd.innerHeight}}s.pl=s.n.plugins}else if(s.isie){if(s.apv>=4){v=s.n.javaEnabled()?'Y':'N';c=screen.colorDepth;if(s.apv>=5){bw=s.d.documentElement.offsetWidth;bh=s.d.documentElement.of"
    +"fsetHeight;if(!s.ismac&&s.b){tcf=new Function('s','tl','var e,hp=0;try{s.b.addBehavior(\"#default#homePage\");hp=s.b.isHomePage(tl)?\"Y\":\"N\"}catch(e){}return hp');hp=tcf(s,tl);tcf=new Function('"
    +"s','var e,ct=0;try{s.b.addBehavior(\"#default#clientCaps\");ct=s.b.connectionType}catch(e){}return ct');ct=tcf(s)}}}else r=''}if(s.pl)while(pn<s.pl.length&&pn<30){ps=s.fl(s.pl[pn].name,100)+';';if("
    +"p.indexOf(ps)<0)p+=ps;pn++}s.resolution=x;s.colorDepth=c;s.javascriptVersion=j;s.javaEnabled=v;s.cookiesEnabled=k;s.browserWidth=bw;s.browserHeight=bh;s.connectionType=ct;s.homepage=hp;s.plugins=p;"
    +"s.td=1}if(vo){s.vob(vb);s.voa(vo)}if((vo&&vo._t)||!s.m_m('d')){if(s.usePlugins)s.doPlugins(s);var l=s.wd.location,r=tfs.document.referrer;if(!s.pageURL)s.pageURL=l.href?l.href:l;if(!s.referrer&&!s."
    +"_1_referrer){s.referrer=r;s._1_referrer=1}s.m_m('g');if(s.lnk||s.eo){var o=s.eo?s.eo:s.lnk,p=s.pageName,w=1,t=s.ot(o),n=s.oid(o),x=o.s_oidt,h,l,i,oc;if(s.eo&&o==s.eo){while(o&&!n&&t!='BODY'){o=o.pa"
    +"rentElement?o.parentElement:o.parentNode;if(o){t=s.ot(o);n=s.oid(o);x=o.s_oidt}}if(o){oc=o.onclick?''+o.onclick:'';if((oc.indexOf('s_gs(')>=0&&oc.indexOf('.s_oc(')<0)||oc.indexOf('.tl(')>=0)o=0}}if"
    +"(o){if(n)ta=o.target;h=s.oh(o);i=h.indexOf('?');h=s.linkLeaveQueryString||i<0?h:h.substring(0,i);l=s.linkName;t=s.linkType?s.linkType.toLowerCase():s.lt(h);if(t&&(h||l)){s.pe='lnk_'+(t=='d'||t=='e'"
    +"?t:'o');q+='&pe='+s.pe+(h?'&pev1='+s.ape(h):'')+(l?'&pev2='+s.ape(l):'');}else trk=0;if(s.trackInlineStats){if(!p){p=s.pageURL;w=0}t=s.ot(o);i=o.sourceIndex;if(s.gg('objectID')){n=s.gg('objectID');"
    +"x=1;i=1}if(p&&n&&t)qs='&pid='+s.ape(s.fl(p,255))+(w?'&pidt='+w:'')+'&oid='+s.ape(s.fl(n,100))+(x?'&oidt='+x:'')+'&ot='+s.ape(t)+(i?'&oi='+i:'')}}else trk=0}if(trk||qs){s.sampled=s.vs(sed);if(trk){i"
    +"f(s.sampled)code=s.mr(sess,(vt?'&t='+s.ape(vt):'')+s.hav()+q+(qs?qs:s.rq()),0,ta);qs='';s.m_m('t');if(s.p_r)s.p_r();s.referrer=s.lightProfileID=s.retrieveLightProfiles=s.deleteLightProfiles=''}s.sq"
    +"(qs)}}else s.dl(vo);if(vo)s.voa(vb,1);s.lnk=s.eo=s.linkName=s.linkType=s.wd.s_objectID=s.ppu=s.pe=s.pev1=s.pev2=s.pev3='';if(s.pg)s.wd.s_lnk=s.wd.s_eo=s.wd.s_linkName=s.wd.s_linkType='';return code"
    +"};s.trackLink=s.tl=function(o,t,n,vo){var s=this;s.lnk=s.co(o);s.linkType=t;s.linkName=n;s.t(vo)};s.trackLight=function(p,ss,i,vo){var s=this;s.lightProfileID=p;s.lightStoreForSeconds=ss;s.lightInc"
    +"rementBy=i;s.t(vo)};s.setTagContainer=function(n){var s=this,l=s.wd.s_c_il,i,t,x,y;s.tcn=n;if(l)for(i=0;i<l.length;i++){t=l[i];if(t&&t._c=='s_l'&&t.tagContainerName==n){for(i=0;i<s.va_g.length;i++)"
    +"{x=s.va_g[i];if(t[x])s[x]=t[x]}if(t.lmq)for(i=0;i<t.lmq.length;i++){x=t.lmq[i];y='m_'+x.n;if(!s[y]&&!s[y+'_c']){s[y]=t[y];s[y+'_c']=t[y+'_c']}s.loadModule(x.n,x.u,x.d)}if(t.ml)for(x in t.ml)if(s[x]"
    +"){y=s[x];x=t.ml[x];for(i in x)if(!Object.prototype[i]){if(typeof(x[i])!='function'||(''+x[i]).indexOf('s_c_il')<0)y[i]=x[i]}}if(t.mmq)for(i=0;i<t.mmq.length;i++){x=t.mmq[i];if(s[x.m]){y=s[x.m];if(y"
    +"[x.f]&&typeof(y[x.f])=='function'){if(x.a)y[x.f].apply(y,x.a);else y[x.f].apply(y)}}}if(t.tq)for(i=0;i<t.tq.length;i++)s.t(t.tq[i]);t.s=s;return}}};s.wd=window;s.ssl=(s.wd.location.protocol.toLower"
    +"Case().indexOf('https')>=0);s.d=document;s.b=s.d.body;if(s.d.getElementsByTagName){s.h=s.d.getElementsByTagName('HEAD');if(s.h)s.h=s.h[0]}s.n=navigator;s.u=s.n.userAgent;s.ns6=s.u.indexOf('Netscape"
    +"6/');var apn=s.n.appName,v=s.n.appVersion,ie=v.indexOf('MSIE '),o=s.u.indexOf('Opera '),i;if(v.indexOf('Opera')>=0||o>0)apn='Opera';s.isie=(apn=='Microsoft Internet Explorer');s.isns=(apn=='Netscap"
    +"e');s.isopera=(apn=='Opera');s.ismac=(s.u.indexOf('Mac')>=0);if(o>0)s.apv=parseFloat(s.u.substring(o+6));else if(ie>0){s.apv=parseInt(i=v.substring(ie+5));if(s.apv>3)s.apv=parseFloat(i)}else if(s.n"
    +"s6>0)s.apv=parseFloat(s.u.substring(s.ns6+10));else s.apv=parseFloat(v);s.em=0;if(s.em.toPrecision)s.em=3;else if(String.fromCharCode){i=escape(String.fromCharCode(256)).toUpperCase();s.em=(i=='%C4"
    +"%80'?2:(i=='%U0100'?1:0))}if(s.oun)s.sa(s.oun);s.sa(un);s.vl_l='dynamicVariablePrefix,visitorID,vmk,visitorMigrationKey,visitorMigrationServer,visitorMigrationServerSecure,ppu,charSet,visitorNamesp"
    +"ace,cookieDomainPeriods,cookieLifetime,pageName,pageURL,referrer,currencyCode';s.va_l=s.sp(s.vl_l,',');s.vl_mr=s.vl_m='charSet,visitorNamespace,cookieDomainPeriods,cookieLifetime,contextData,lightP"
    +"rofileID,lightStoreForSeconds,lightIncrementBy';s.vl_t=s.vl_l+',variableProvider,channel,server,pageType,transactionID,purchaseID,campaign,state,zip,events,events2,products,linkName,linkType,contex"
    +"tData,lightProfileID,lightStoreForSeconds,lightIncrementBy,retrieveLightProfiles,deleteLightProfiles,retrieveLightData';var n;for(n=1;n<=75;n++){s.vl_t+=',prop'+n+',eVar'+n;s.vl_m+=',prop'+n+',eVar"
    +"'+n}for(n=1;n<=5;n++)s.vl_t+=',hier'+n;for(n=1;n<=3;n++)s.vl_t+=',list'+n;s.va_m=s.sp(s.vl_m,',');s.vl_l2=',tnt,pe,pev1,pev2,pev3,resolution,colorDepth,javascriptVersion,javaEnabled,cookiesEnabled,"
    +"browserWidth,browserHeight,connectionType,homepage,plugins';s.vl_t+=s.vl_l2;s.va_t=s.sp(s.vl_t,',');s.vl_g=s.vl_t+',trackingServer,trackingServerSecure,trackingServerBase,fpCookieDomainPeriods,disa"
    +"bleBufferedRequests,mobile,visitorSampling,visitorSamplingGroup,dynamicAccountSelection,dynamicAccountList,dynamicAccountMatch,trackDownloadLinks,trackExternalLinks,trackInlineStats,linkLeaveQueryS"
    +"tring,linkDownloadFileTypes,linkExternalFilters,linkInternalFilters,linkTrackVars,linkTrackEvents,linkNames,lnk,eo,lightTrackVars,_1_referrer,un';s.va_g=s.sp(s.vl_g,',');s.pg=pg;s.gl(s.vl_g);s.cont"
    +"extData=new Object;s.retrieveLightData=new Object;if(!ss)s.wds();if(pg){s.wd.s_co=function(o){s_gi(\"_\",1,1).co(o)};s.wd.s_gs=function(un){s_gi(un,1,1).t()};s.wd.s_dc=function(un){s_gi(un,1).t()}}",
    w=window,l=w.s_c_il,n=navigator,u=n.userAgent,v=n.appVersion,e=v.indexOf('MSIE '),m=u.indexOf('Netscape6/'),a,i,j,x,s;
    if(un){
        un=un.toLowerCase();
        if(l)for(j=0;j<2;j++)for(i=0;i<l.length;i++){
            s=l[i];
            x=s._c;
            if((!x||x=='s_c'||(j>0&&x=='s_l'))&&(s.oun==un||(s.fs&&s.sa&&s.fs(s.oun,un)))){
                if(s.sa)s.sa(un);
                if(x=='s_c')return s
                    }else s=0
                }
            }
        w.s_an='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
w.s_sp=new Function("x","d","var a=new Array,i=0,j;if(x){if(x.split)a=x.split(d);else if(!d)for(i=0;i<x.length;i++)a[a.length]=x.substring(i,i+1);else while(i>=0){j=x.indexOf(d,i);a[a.length]=x.subst"
    +"ring(i,j<0?x.length:j);i=j;if(i>=0)i+=d.length}}return a");
w.s_jn=new Function("a","d","var x='',i,j=a.length;if(a&&j>0){x=a[0];if(j>1){if(a.join)x=a.join(d);else for(i=1;i<j;i++)x+=d+a[i]}}return x");
w.s_rep=new Function("x","o","n","return s_jn(s_sp(x,o),n)");
w.s_d=new Function("x","var t='`^@$#',l=s_an,l2=new Object,x2,d,b=0,k,i=x.lastIndexOf('~~'),j,v,w;if(i>0){d=x.substring(0,i);x=x.substring(i+2);l=s_sp(l,'');for(i=0;i<62;i++)l2[l[i]]=i;t=s_sp(t,'');d"
    +"=s_sp(d,'~');i=0;while(i<5){v=0;if(x.indexOf(t[i])>=0) {x2=s_sp(x,t[i]);for(j=1;j<x2.length;j++){k=x2[j].substring(0,1);w=t[i]+k;if(k!=' '){v=1;w=d[b+l2[k]]}x2[j]=w+x2[j].substring(1)}}if(v)x=s_jn("
    +"x2,'');else{w=t[i]+' ';if(x.indexOf(w)>=0)x=s_rep(x,w,t[i]);i++;b+=62}}}return x");
w.s_fe=new Function("c","return s_rep(s_rep(s_rep(c,'\\\\','\\\\\\\\'),'\"','\\\\\"'),\"\\n\",\"\\\\n\")");
w.s_fa=new Function("f","var s=f.indexOf('(')+1,e=f.indexOf(')'),a='',c;while(s>=0&&s<e){c=f.substring(s,s+1);if(c==',')a+='\",\"';else if((\"\\n\\r\\t \").indexOf(c)<0)a+=c;s++}return a?'\"'+a+'\"':"
    +"a");
w.s_ft=new Function("c","c+='';var s,e,o,a,d,q,f,h,x;s=c.indexOf('=function(');while(s>=0){s++;d=1;q='';x=0;f=c.substring(s);a=s_fa(f);e=o=c.indexOf('{',s);e++;while(d>0){h=c.substring(e,e+1);if(q){i"
    +"f(h==q&&!x)q='';if(h=='\\\\')x=x?0:1;else x=0}else{if(h=='\"'||h==\"'\")q=h;if(h=='{')d++;if(h=='}')d--}if(d>0)e++}c=c.substring(0,s)+'new Function('+(a?a+',':'')+'\"'+s_fe(c.substring(o+1,e))+'\")"
    +"'+c.substring(e+1);s=c.indexOf('=function(')}return c;");
c=s_d(c);
if(e>0){
    a=parseInt(i=v.substring(e+5));
    if(a>3)a=parseFloat(i)
        }else if(m>0)a=parseFloat(u.substring(m+10));else a=parseFloat(v);
if(a<5||v.indexOf('Opera')>=0||u.indexOf('Opera')>=0)c=s_ft(c);
if(!s){
    s=new Object;
    if(!w.s_c_in){
        w.s_c_il=new Array;
        w.s_c_in=0
        }
        s._il=w.s_c_il;
    s._in=w.s_c_in;
    s._il[s._in]=s;
    w.s_c_in++;
}
s._c='s_c';
(new Function("s","un","pg","ss",c))(s,un,pg,ss);
return s
}
function s_giqf(){
    var w=window,q=w.s_giq,i,t,s;
    if(q)for(i=0;i<q.length;i++){
        t=q[i];
        s=s_gi(t.oun);
        s.sa(t.un);
        s.setTagContainer(t.tagContainerName)
        }
        w.s_giq=0
    }
    s_giqf()
    
    
    
    //////////////////////////////
    //
    //  debugger code
    //
    
function s_rep(s,o,n) {
	var
		i=s.indexOf(o),
		l=n.length>0?n.length:1;
	while(s&&i>=0){
		s=s.substring(0,i)+n+s.substring(i+o.length);
		i=s.indexOf(o,i+l)
	}
	return s
}

function s_epa(s) {
	return unescape(s_rep(s,'+',' '))
}

// Requests in Images, Flash Movies, and global/window member image objects
function request_list_get() {
	var
		request_list = new Array;
	if (window.opener) {
		// Images
		if (window.opener.document.images) {
			for (var image_num = 0;image_num < window.opener.document.images.length;image_num++) {
				var
					src = window.opener.document.images[image_num].src;
				if (src.indexOf('/b/ss/') >= 0) {
					var
						request = new Object;
					request.method = 'Image';
					request.url    = src;
					request_list[request_list.length] = request;
				}
			}
		}
		// Global Image Objects
		for (var window_member in window.opener) {
			if ((window_member.substring(0,4) == 's_i_') && (window.opener[window_member].src)) {
				var
					src = window.opener[window_member].src;
				if (src.indexOf('/b/ss/') >= 0) {
					var
						request = new Object;
					request.method = 'Image';
					request.url    = src;
					request_list[request_list.length] = request;
				}
			}
		}
		// Flash Movies
		var
			movie_list = new Array;
		function get_movies(obj) {
			if (obj) {
				try {
					if ((obj.tagName) &&
					    ((obj.tagName.toUpperCase() == 'OBJECT') ||
					     (obj.tagName.toUpperCase() == 'EMBED'))) {
						obj.GetVariable('_root'); // Call to throw and error if this is not a movie
						movie_list[movie_list.length] = obj;
					}
				} catch(e) {}
				obj = obj.firstChild;
				while (obj) {
					get_movies(obj);
					obj = obj.nextSibling;
				}
			}
		}
		if (window.opener.document) {
			get_movies(window.opener.document.body);
			for (var movie_num = 0;movie_num < movie_list.length;movie_num++) {
				try {
					var
						movie = movie_list[movie_num],
						movie_request_list_str = movie.GetVariable("_root.s_s.requestList"),
						movie_request_list = (movie_request_list_str ? movie_request_list_str.split(',') : 0);
					if (movie_request_list) {
						for (var movie_request_num = 0;movie_request_num < movie_request_list.length;movie_request_num++) {
							var
								request = new Object;
							request.method = 'Flash';
							request.url    = movie_request_list[movie_request_num];
							request_list[request_list.length] = request;
						}
					}
				} catch(e) {}
			}
		}
	}

	return request_list;
}

function request_list_display(request_list,auto_refresh,url_decode) {
	var
		cell = document.getElementById('request_list_cell'),
		display = '';
	if (cell) {
		if ((auto_refresh) || (cell.innerHTML.toUpperCase().indexOf("TABLE") < 0)) {
			display += "<table border=\"0\" cellpadding=\"2\" cellspacing=\"1\" width=\"100%\">";
			if (request_list.length > 0) {
				for (var request_num = 0;request_num < request_list.length;request_num++) {
					display += ''
						+ "<tr bgcolor=\"" + (request_num % 2 == 0 ? "#FFFFFF" : "#EFEFEF") + "\"><td style=\"font:11px arial,sans-serif;color:#000000;\">"
						+ "<span style=\"font:bold 11px arial,sans-serif;color:#000000;\">" + request_list[request_num].method + "</span><br>"
						+ (url_decode ? s_epa(s_rep(request_list[request_num].url,"&","<br>")) : s_rep(request_list[request_num].url,"&","<br>"))
						+ "</td></tr>"
					;
				}
			} else {
				display += "<tr><td align=\"center\" style=\"font:11px arial,sans-serif;color:#FF0000;\">No Requests Found</td></tr>";
			}
			display += "</table>";

			cell.innerHTML = display;
		}
	}
}

function request_list_run() {
	request_list_display(
		request_list_get(),
		window.auto_refresh,
		window.url_decode
	);
	setTimeout("request_list_run()",5000);
}

// Header
document.write(''
	+ "<table border=\"0\" cellpadding=\"2\" cellspacing=\"1\" width=\"100%\">"
	+ "<form name=\"debugger\">"
	+ "<tr bgcolor=\"#293431\"><td height=\"24\" style=\"font:bold 14px arial,sans-serif;color:#FFFFFF;\">&nbsp;&nbsp;Omniture Debugger</td></tr>"
	+ "<tr><td style=\"font:bold 11px arial,sans-serif;color:#000000;\"><ul>"
	+ "<li>This tool will recheck and refresh the request list every 5 seconds in the case that an image source changes or another flash event was tracked.  You can disable the auto refresh below.</li>"
	+ "<li>This tool will not work with sites that use frames.</li>"
	+ "</ul></td></tr>"
	+ "<tr><td><input type=\"button\" name=\"close1\" value=\"Close\" onclick=\"window.close();\"></td></tr>"
	+ "</table>"
);

// Requests 
document.write(''
	+ "<table border=\"0\" cellpadding=\"2\" cellspacing=\"1\" width=\"100%\">"
	+ "<tr><td height=\"8\"></td></tr>"
	+ "<tr><td style=\"font:bold 11px arial,sans-serif;color:#000000;\">Data Collection Requests:&nbsp;&nbsp;"
	+ "<span style=\"font:11px arial,sans-serif;color:#000000;\">URL Decode</span>&nbsp;"
	+ "<input type=\"checkbox\" name=\"url_decode\" onclick=\"window.url_decode=this.checked;request_list_run()\">&nbsp;&nbsp;"
	+ "<span style=\"font:11px arial,sans-serif;color:#000000;\">Auto Refresh</span>&nbsp;"
	+ "<input type=\"checkbox\" name=\"auto_refresh\" onclick=\"window.auto_refresh=this.checked\" CHECKED>"
	+ "</td></tr>"
	+ "</table>"
	+ "<table border=\"0\" cellpadding=\"2\" cellspacing=\"1\" width=\"100%\">"
	+ "<tr><td id=\"request_list_cell\" align=\"center\"></td></tr>"
	+ "</table>"
);

// Footer
document.write(''
	+ "<table border=\"0\" cellpadding=\"2\" cellspacing=\"1\" width=\"100%\">"
	+ "<tr><td height=\"8\"></td></tr>"
	+ "<tr><td><input type=\"button\" name=\"close2\" value=\"Close\" onclick=\"window.close();\"></td></tr>"
	+ "</form>"
	+ "</table>"
);

// Title, status, and background color
document.title = 'Omniture Debugger';
window.status = 'Omniture Debugger';
document.bgColor = "#CECECE";

// Usage tracking
var
	account_set = '';
document.write('<im'+'g sr'+'c="http://support.112.2O7.net/b/ss/support/1/TAG/s0.000120001354290960/?pageName=Stats%20Debugger&prop1='+escape(account_set)+'" width="0" height="0" border="0" alt="0">');

document.close();

// Get and display requests
window.url_decode = false;
window.auto_refresh = true;
request_list_run();

try {
    
}
catch (e) {
    e.toString()
}