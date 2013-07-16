<%-- 
    Document   : janrain
    Created on : Jul 12, 2013, 9:04:20 AM
    Author     : aeast
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Janrain Auth Page</title>
        <script type="text/javascript">
(function() {
    if (typeof window.janrain !== 'object') window.janrain = {};
    if (typeof window.janrain.settings !== 'object') window.janrain.settings = {};
    
    janrain.settings.tokenUrl = 'http://gci-aeast:8080/AndyTest/AuthTokenServlet';

    function isReady() { janrain.ready = true; };
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", isReady, false);
    } else {
      window.attachEvent('onload', isReady);
    }

    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.id = 'janrainAuthWidget';

    if (document.location.protocol === 'https:') {
      e.src = 'https://rpxnow.com/js/lib/gci-aeast/engage.js';
    } else {
      e.src = 'http://widget-cdn.rpxnow.com/js/lib/gci-aeast/engage.js';
    }

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(e, s);
})();
</script>
    </head>
    <body>
        <h1>Hello World!</h1>
        <h5>Now try to sign in using the Janrain widget.</h5><br>
        <div id="janrainEngageEmbed"></div>
    </body>
</html>
