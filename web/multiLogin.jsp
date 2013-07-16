<%-- 
    Document   : multiLogin
    Created on : Dec 20, 2012, 9:08:46 AM
    Author     : aeast
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>

<html xmlns:fb="http://ogp.me/ns/fb#">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Hello Cruel World</title>

        <!-- back plan -->
        <script src="http://cdn.echoenabled.com/clientapps/v2/jquery-pack.js"></script>
        <script src="http://cdn.echoenabled.com/clientapps/v2/backplane.js"></script>
        <script type="text/javascript">
            
            Backplane.init({
                
                "serverBaseURL" : "http://api.echoenabled.com/v1",
                
                "busName": "Gannett"
                
            });
            // save the channel id to a cookie with jquery
            $.cookie("bp_channel_id", Backplane.getChannelID());
             // or update a form <input> field with the channel id to pass it to your server
            $('#hidden-input-field').attr('value', Backplane.getChannelID());
        </script>

        <!-- Old way:  <script type="text/javascript" src="/AndyTest/static/google/gwt-oauth2.js"></script>-->
        
        <script type="text/javascript">
            function signinCallback(authResult) {  
                if (authResult['error'] == undefined) {    
                    // Successfully authorized    
                    // Set the auth token in the JavaScript API    
                    gapi.auth.setToken(authResult);    
                    console.log("success, token: " + authResult);
                    //// Hide the sign-in button now that the user is authorized, for example:    
                    document.getElementById('myGsignin').setAttribute('style','display: none;');
                    
                    // retrieve email address for user, first name, last name, gender, birth year, zip, country, state from google
                    // call maintainUserUsat(with values from google) <- user id (atypon id)
                    // call getUser -> user id to get licneses, etc..
                } 
                else if (authResult['error'] == 'access_denied') {    
                    // User denied access    
                    // Handle this case or ignore  
                    console.log(authResult['error'] + ' : ' + authResult['error_description']);    
                } 
                else {    
                    // Some other error occurred or the user might have closed the    
                    // authorization or the client ID might be set incorrectly.    
                    console.log(authResult['error'] + ' : ' + authResult['error_description']);    
                    // Handle errors  
                 }
             }
        </script>
    </head>
    <body>
       <!--<div id="fb-root"></div>
        <script>(function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=264095033716190";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));</script>
        <div id="article1" style="width: 400px;">
            <h1>My first article</h1>
            <section>
                <h1>Chapter 1: The Period</h1>
                <p>It was the best of times, it was the worst of times,
                    it was the age of wisdom, it was the age of foolishness,
                    it was the epoch of belief, it was the epoch of incredulity,
                    it was the season of Light, it was the season of Darkness,
                    ...</p>
            </section>
        </div>
    <fb:comments href="http://eastzilla.com" width="470" num_posts="10"></fb:comments>
    <br/><br/><br/>
              -->

    <div id="article2" style="width: 400px;">
        <h1>My second article</h1>
        <section>
            <h1>Chapter 1: The Period</h1>
            <p>It was the best of times, it was the worst of times,
                it was the age of wisdom, it was the age of foolishness,
                it was the epoch of belief, it was the epoch of incredulity,
                it was the season of Light, it was the season of Darkness,
                ...</p>
        </section>
    </div> 
    <br><br>
    <!-- Demonstrates using the gwt-oauth2 library in a regular JS script. Note    
         that the following files must be hosted in the same directory as this file:    
         * gwt-oauth2.js, which is referenced in the script tag above. It can be   
         moved/renamed.    * oauthWindow.html, which is displayed breifly during the login process. -->   
    <script type="text/javascript">    
    ////////////////////////////////////////////////
    //// AUTHENTICATING WITH GOOGLE 
    ////////////////////////////////////////////////
    //old (function() {      
    //old      var GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth";      
    //old     var GOOGLE_CLIENT_ID = "549650950581.apps.googleusercontent.com";      
    //old     var PLUS_ME_SCOPE = "https://www.googleapis.com/auth/plus.me";       
    //old     var button = document.createElement("button");      
    //old     button.innerText = "Authenticate with Google";      
    //old     button.onclick = function() {        
    //old         var req = {          "authUrl" : GOOGLE_AUTH_URL,          "clientId" : GOOGLE_CLIENT_ID,          "scopes" : [ PLUS_ME_SCOPE ],        };        
    //old         oauth2.login(req, function(token) {          
    //old             alert("Got an OAuth token:\n" + token + "\n"              + "Token expires in " + oauth2.expiresIn(req) + " ms\n");        
    //old         }, function(error) {          
    //old             alert("Error:\n" + error);        
    //old         });      
    //old     };      
    //old     document.body.appendChild(button);       
    //old     var clearTokens = document.createElement("button");      
    //old     clearTokens.innerText = "Clear all tokens";      
    //old     clearTokens.onclick = oauth2.clearAllTokens;      
    //old     document.body.appendChild(clearTokens);    })();   
     </script> 

    <!--Google+ login button -->
    <span id="myGsignin"  
          class="g-signin"  
          data-callback="signinCallback"  
          data-clientid="1083886491857.apps.googleusercontent.com"
          data-cookiepolicy="single_host_origin"
          data-requestvisibleactions="http://schemas.google.com/AddActivity http://schemas.google.com/CommentActivity"  
          data-scope="https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email">
    </span>

       
   <script type="text/javascript">  
            alert('channel id" ' + Backplane.getChannelID());  
            document.write('<p>Backplane Channel ID: ' + Backplane.getChannelID() + '</p>');
            Backplane.expectMessages(["identity/ack"]);
            Backplane.subscribe(function(message) {
                if (message.type == "identity/ack") {
                        // perform some actions if we receive the "identity/ack" message
                        alert ('Got an identity/ack message: ' + message);

                }
            });

        
    
   </script>
    <!-- Place this asynchronous JavaScript just before your </body> tag -->    
    <script type="text/javascript">      
        (function() {       
            var po = document.createElement('script'); 
            po.type = 'text/javascript'; 
            po.async = true;       
            po.src = 'https://apis.google.com/js/client:plusone.js';       
            var s = document.getElementsByTagName('script')[0]; 
            s.parentNode.insertBefore(po, s);
        })();    
    </script>    
    </body>
</html>
