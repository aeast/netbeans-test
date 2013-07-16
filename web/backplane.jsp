<%-- 
    Document   : backplane
    Created on : Jul 1, 2013, 10:50:33 AM
    Author     : aeast
--%>

<%@page import="com.gannett.backplane.Backplane"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<% 
    
    Cookie[] cookies = request.getCookies();
    Cookie backplaneCookie = null;
    for (Cookie c : cookies) {
        if (c.getName().equalsIgnoreCase("bp_channel_id"));
        backplaneCookie = c;
        break;
    }

    String backplaneChannel = backplaneCookie.getValue();
    

    Backplane bp = new Backplane("Gannett", "Secret");

       //  include('backplane.php');

    // get cookie created by the backplane script

    //if(isset($_COOKIE['bp_channel_id'])) {

    //$channel = $_COOKIE['bp_channel_id'];

    // send message to BP server

    $bp = new Backplane('YOUR_BUSINESS_NAME', 'YOUR_BUSINESS_SECRET');

    $rsp = $bp->send(array(

      "source" => "YOUR_SOURCE_DOMAIN",

      "type" => "identity/login",

      "channel" => $channel,

      "user_id_url" => "USER_UNIQUE_URL",

      "display_name" => "USER_DISPLAY_NAME",

      "photo" => "USER_AVATAR_URL"

     ));

    }

%>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
    </head>
    <body>
        <h1>Hello World!</h1>
    </body>
</html>
