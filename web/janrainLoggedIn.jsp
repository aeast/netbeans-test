<%-- 
    Document   : janrainLoggedIn
    Created on : Jul 12, 2013, 11:11:57 AM
    Author     : aeast
--%>

<%@page import="com.gannett.janrain.JanrainUser"%>
<%@page import="org.w3c.dom.Element"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%
    JanrainUser user = (JanrainUser)session.getAttribute("authInfo");
%>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Logged In</title>
        <script type="text/javascript">
            
        </script>
    </head>
    <body>
               <image src="<%=user.getProfile().getPhoto()%>">
 <h1>Hello <%=user.getProfile().getDisplayName() %><!</h1>
        <h3>Email:  <%=user.getProfile().getEmail() %></h3><br>
    </body>
</html>
