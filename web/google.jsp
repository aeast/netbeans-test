<%-- 
    Document   : google.jsp
    Created on : Jan 23, 2013, 3:36:16 PM
    Author     : aeast
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Google+ Starter App (client-side)</title>
    <!-- jquery UI theme and external css -->
    <link href="//gplusstatic.appspot.com/css/blitzer/jquery-ui-1.9.1.custom.css" rel="stylesheet">
    <link href="//gplusstatic.appspot.com/css/samplestarter.css" rel="stylesheet">
    <!-- jQuery -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <!-- Using custom jQueryUI -->
    <script src="//gplusstatic.appspot.com/js/jquery-ui-1.9.1.custom.js"></script>
    <!--<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.9.1/jquery-ui.min.js"></script>-->
    
    <!-- Required to render the Google+ sign-in button -->
    <!-- Troubleshooting:
       No matching origin? Check https versus http on JavaScript origins
       redirect_uri_mismatch? Check that your redirect URI https/http
    -->
    <script src="/AndyTest/static/sampleui.js"></script>
    <script src="/AndyTest/static/samplestarter.js"></script>
    
    </head>
    <body>
    <table>
      <tr>
        <td colspan=3>
          <div id="errorDiv" class="ui-state-error ui-corner-all" style="padding: 0 .7em; display:none;">
            <p>
              <span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>
              <h2><strong>Alert:</strong></h2>
            </p>
            <div id="errorStatus"></div>
          </div>
        </td>
      </tr>
      <tr>
        <td></td>
        <td id="header">
          <h1>Google+ Starter App (client-side)</h1>
        </td>
        <td></td>
      </tr>
      <tr valign="top">
        <td class="actionsColumn" id="actions">
          <div id="accordion">
            <h3>Step 1: Sign in</h3>
            <div id="gConnect" style="display:block;">
              <div id='signinButton'>
                <span
                  class='g-signin'
                  data-scope='https://www.googleapis.com/auth/plus.login'
                  data-requestvisibleactions='http://schemas.google.com/AddActivity http://schemas.google.com/BuyActivity http://schemas.google.com/CheckInActivity http://schemas.google.com/CommentActivity http://schemas.google.com/CreateActivity http://schemas.google.com/ListenActivity http://schemas.google.com/ReserveActivity http://schemas.google.com/ReviewActivity'
                  data-clientId = '1083886491857.apps.googleusercontent.com'
                  data-callback='onSignInCallback'
                ></span>
              </div>
              <div id="signedInText"></div>
            </div>
            <h3>Step 2: Access User data</h3>
            <div id="authOps" style="display:none">
              <p><nobr>Display profile information / List of people circled</nobr></p>
              <p>
                <button id="getProfile" onClick="personalize();">Get Profile</button>
              </p>
              <p>
                <button id="getCircled" onClick='getCircled(10);'>List people circled</button>
              </p>
            </div>
            <h3>Step 3: Create interactive posts</h3>
            <div id="inviteDiv">
              <p>
                Invite people to try this tutorial:
              </p>
              <p>
              <div id='inviteButtonDiv'>
                  <button id='invite-button'>I will try it!</button>
              </div>
              </p>
            </div>
            <h3>Step 4: Write activities to Google</h3>
            <div id="momentsDiv">
              <p>
                After you have been granted permissions, you can write activities to Google using the moment methods. Supported types are listed on the <a href="https://developers.google.com/+/partners/cooper/api/moment-types">moments types</a> page. Users can manage their activities on Google+ by visiting their <a href="http://plus.google.com/history">App settings page</a>.
              </p>
            </div>
            <h3>Step 5: Manage activities written to Google</h3>
            <div id="manageMomentsDiv">
              <p>Manage activities written to Google using the moment methods.</p>
              <button id="listMoments" onClick="getMoments(10)">List and delete activities</button>
            </div>
          </div>
        </td>
        <td id="descriptionsColumn" class="descriptions">
          <!-- Tabs -->
          <div id="tabs">
            <ul>
              <li><a href="#step1">Step 1</a></li>
              <li><a href="#step2">Step 2</a></li>
              <li><a href="#step3">Step 3</a></li>
              <li><a href="#step4">Step 4</a></li>
              <li><a href="#step5">Step 5</a></li>
            </ul>
            <div id="step1" class="step1">
              <div>
                <p>When you click the Google+ Sign-In button, a request will be made from the iframe that contains the sign-in button. This will perform the OAUTH flow and will return an access token. This token can then be used by the Google API client to make queries on behalf of the user.
                </p>
              </div>
            </div>
            <div id="step2" class="step2">
              <div>
                <p>When you signed in, an OAUTH flow was started using the iframe for the sign-in button.  If you properly authenticated, an access token was returned to your application. This token allows your application make authenticated queries on behalf of the user who has granted your application access.
                 </p><p><b>Note</b>: The access tokens expire hourly and will be updated behind the scenes after this time
                 period runs out.</p>
                <p>You can call <code>gapi.auth.getToken()</code> to retrieve the current access token.</p>
                <p>
                  <button id="accessTokButton" onClick="showAccessToken()">Show Access Token</button>
                  Your current access token is:
                  <pre class="tokenDisplay" readonly="readonly" id="accessToken"></pre>
                </p>
                <p>
                  Because you authenticated this app, the app can make API calls to access the data that you
                  granted permissions to use.
                </p>
                <p>
                  Examples can be found in the left navigation area under Step 2 and the output will appear below.
                </p>
              </div>
              <div id="profile"></div>
              <div id="circledPeople"></div>
              <div>
                <p>If you want to explicitly revoke access to the app, go to your <a href="https://accounts.google.com/IssuedAuthSubTokens">Google account page</a></p>
                <p>To force reauthentication, try opening a sandboxed browsing session. For example, this can be done using an incognito window in Google Chrome.</p>
              </div>
            </div>
            <div id="step3">
              <p>
                Now that you have seen the various customizations that happen when you have authenticated, it's a great time to send an interactive post to people you know on Google+.
              </p>
              <p>
                The button on the left triggers an interactive post. In this case, the action prompts the recipients to try this tutorial.
              </p>
            </div>
            <div id="step4">
              <p>
                Your sample app now has customized it's look and feel based on the user's Google+ profile. The app
                has also shown various people from the authenticated user's circles and even lets them invite the
                people in their circles to participate in specific functions for your site. Now's a great time to explore writing activities to Google using the moment methods.
              </p>
              <p>
                Try writing activities. The following grid shows example activities &mdash; click to write the activity to Google.
              </p>
              <p>
                <div id="sample-moment-buttons"></div>
                <p>Or, as an alternative, you can create your own activity using your own data. Try replacing the URL in the following
                  example and write an AddActivity. <b>Note</b>: The AddActivity type should be only used when another
                  activity is not appropriate.</p>
                <div id="customMomentDiv">
                  <label>Specify custom JSON: <textarea id="custom-json" style="width:430px; height:140px"
>{
"type":"http://schemas.google.com/AddActivity",
"target":{
"url":"https://developers.google.com/+/plugins/snippet/examples/thing"
}
}</textarea>
                  </label>
                  <button id="writeCustomMoment" onClick='writeCustomMoment();'>Write custom activity</button>.
                </div>
              </p>
            </div>
            <div id="step5">
              <p>
                Once you have written activities to Google using the moments methods, you can read or delete them. This is useful because it lets you maintain consistency between the data stored on your site and activities you have written to Google. Click the Manage activities button to the left and list the first 10 activities.
              </p>
              <p>
                After you click the button to manage activities, the following area will list activities for
                that user. Activities that you wrote in Step 4 will already appear in this area. If you
                haven't written any activities from this application, no activities will appear.
              </p>
                <div id="moments"></div>
            </div>
          </div>
          <!-- insert troubleshooting with error class -->
        </td>
        <td class="results" id="resultsColumn">
          <div id="statusConsoleDiv">
            <pre class="statusConsole" readonly="readonly" id="status">
===============================================================================
*This* is the status area.
===============================================================================

Data passed to the API as well as debugging information is
returned to here.

Each entry will contain a timestamp in the format:
    [Hour:Minute:Second Millisecond]

Entries will appear from newest to oldest.
            </pre>
          </div>
          <div id="clearStatusDiv">
            <button id="clearStatus" onClick="clearStatus()">Clear Status Window</button>
          </div>
        </td>
      </tr>
    </table>
<!-- end grid -->
  <!-- asynchronous loading of the plusone.js JavaScript for improved performance -->
  <script type="text/javascript">
    (function() {
     var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
     po.src = 'https://plus.google.com/js/plusone.js';
     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
   })();
  </script>
    </body>
</html>
