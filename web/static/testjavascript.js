/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


//javascript:void(window.open("","stats_debugger","width=600,height=600,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1").document.write("<script language='JavaScript' src='https://sitecatalyst.omniture.com/sc_tools/stats_debugger.html'></script><script language='JavaScript'>window.focus();</script>"));
//
// http://gntbcstglobal.112.2o7.net/b/ss/gpaper127,gntbcstglobal/1/H.23.8/s61697144315512?AQB=1
// http://gntbcstglobal.112.2o7.net/b/ss/gpaper127,gntbcstglobal/1/H.23.8/s71182789321115?AQB=1&ndh=1&t=30%2F10%2F2012%2011%3A17%3A40%205%20300&ns=gntbcstglobal&pageName=New%20jet%20Dreamliner%20makes%20stop%20at%20DIA(201211300621)&g=http%3A%2F%2Fwww.coloradoan.com%2Fviewart%2F20121130%2FNEWS11%2F311300030%2FNew-jet-Dreamliner-makes-stop-DIA%3Fodyssey%3Dnav%7Chead&r=careerbuilder&cc=USD&server=SAXO-GEL&events=event3%2Cevent24&v1=gpaper127&c2=Colorado%20News&v5=local_news&c6=news&c7=local_news&c11=%2Farticle%2F20121130%2FNEWS11%2F311300030&c16=article&v16=article&c17=news&c23=http%3A%2F%2Fwww.coloradoan.com%2Fviewart%2F20121130%2FNEWS11%2F311300030%2FNew-jet-Dreamliner-makes-stop-DIA%3Fodyssey%3Dnav%7Chead&c24=coloradoan.com&c25=gpaper127&c28=3&c29=2&c30=null&v30=New%20jet%20Dreamliner%20makes%20stop%20at%20DIA(201211300621)&c31=1971&c32=female&c35=null&v35=Referrers&v36=www.coloradoan.com&c38=true&v38=n%2Fa&c41=nav%7Chead&c42=enterprise_subscriber&c44=%2Farticle%2F20121130%2FNEWS11%2F311300030&c48=D08734_70693%7CD08734_70629%7CD08734_70625%7CD08734_70680%7CD08734_72009%7CD08734_72010%7CD08734_72012%7CD08734_72013%7CD08734_72014%7CD08734_72076%7CD08734_72078%7CD08734_72081%7CD08734_72083%7C10688%7CD08734_70050%7C10251%7C10300%7CD08734_70086%7CD08734_70105%7CD08734_70113%7CD08734_70063%7CD08734_72077%7CD08734_72079%7C10779%7C10785%7C10396%7C10352%7C10792%7C50032%7C50002%7C50030%7C50374%7C50387%7C50467%7C50462%7C10485%7C10486%7C10514%7C10243%7C50642%7C50240%7C50709%7C50763%7C50778%7C50001%7C51032&v50=New%20jet%20Dreamliner%20makes%20stop%20at%20DIA(201211300621)&c51=22&v51=article%7CNew%20jet%20Dreamliner%20makes%20stop%20at%20DIA(201211300621)%7CNone%7CNone&c52=New%20jet%20Dreamliner%20makes%20stop%20at%20DIA(201211300621)&v52=5&c53=5&v53=5&c54=Repeat&v54=Repeat&c55=5&c60=15&v60=15&c68=4069226&v68=4069226&c73=null&c74=1971&c75=female&s=1366x768&c=24&j=1.6&v=Y&k=Y&bw=1440&bh=342&ct=lan&hp=N&AQE=1
//

var trackingBeacon = "http://localhost/images/litics.gif?"
var s_code = "http://gntbcstglobal.112.2o7.net/b/ss/gpaper127,gntbcstglobal/1/H.23.8/s61697144315512?AQB=1";

var trackingBeacon = 'http://localhost/images/litics.gif';
var qryStringIndex = s_i_usatoday1.src.indexOf("?", 0);
var qryString = s_i_usatoday1.src;
var gd_s_code = trackingBeacon + qryString.substr(qryStringIndex, qryString.length);
document.write(gd_s_code);


var	request_list = new Array;	
for (var image_num = 0;image_num < document.images.length;image_num++) {
        var  src = document.images[image_num].src;
        
        var name = window.document.images[image_num].name;
        
        if (src.indexOf('/b/ss/') >= 0) {
                var
                        request = new Object;
                request.method = 'Image';
                request.url    = src;
                console.log(name);
                console.log(src);
                request_list[request_list.length] = request;
        }
}

// on usat
s_ut.hav();

// console test
var trackingBeacon = "http://localhost/images/litics.gif?";
var gd_s_code = trackingBeacon + s_ut.hav();
console.log(gd_s_code);
