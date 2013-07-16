// Set this to your client ID from
// https://code.google.com/apis/console/#access
var debug = true;

var APIVersion = 'v1';

// for explicit button renders
var clientId = '1083886491857.apps.googleusercontent.com';

// The circled users
var circled = null;

var stagingServerUrl =
    'https://www.googleapis.com';

function loadApiFromDiscoveryDoc() {
  gapi.config.update('googleapis.config/root', stagingServerUrl);
  //Silvano: register from discovery mimicking gapi.client.load
  gapi.client.setApiVersions({'plus': APIVersion});
  $.getJSON('/AndyTest/static/v1sandbox.json', function(data) {
    for (var resource in data.resources) {
      for (var prop in data.resources[resource]) {
        if (data.resources[resource].hasOwnProperty(prop) &&
            prop == 'methods') {
          var methods = data.resources[resource][prop];
          for (var method in methods) {
            if (!methods.hasOwnProperty(method)) {
              continue;
            }
            gapi.client.register(methods[method].id,
                { 'root': stagingServerUrl, 'version': APIVersion });
          }
        }
      }
    }
  });
}

/**
 * Step 1
 * This will authenticate and store the auth token using gapi.
 */

/**
 * This method is called upon completion of the sign in flow. Its primary
 * function is to hide the sign in button.
 *
 * @param {Object} authResult an object which contains the access token and
 *    other authentication information.
 */
function onSignInCallback(authResult) {
  clearStatus();

  console.log('authResult', authResult);
  statusLog('authResult', authResult);

  // Store the auth result for later use
  gapi.auth.setToken(authResult);

  loadApiFromDiscoveryDoc();

  console.log('Get token: ', gapi.auth.getToken());
  statusLog('Get token: ', gapi.auth.getToken());

  // Render the interactive post buttons.
  renderInteractivePostButtons('inviteButtonDiv');

  updateSignInView();

  stepActionEffect('1');
}

function showAccessToken() {
  $('#accessToken').append(gapi.auth.getToken().access_token);
}

/**
 * This method will render the personalization data
*/
function updateSignInView() {
  if (debug) {
    console.log('updateSignInView');
    statusLog('updateSignInView');
  }

  var authResult = gapi.auth.getToken();
  if (authResult == null) {
    console.log('Logged out');
    statusLog('Logged out');
    $('#authOps').hide('slow');
    $('#gConnect').show();
    $('#signinButton').show();
  } else if (authResult.error == null) {
    if (debug) {
      console.log('Auth Success', authResult);
      statusLog('Auth Success', authResult);
    }

    $('#signinButton').hide('fast');
    $('#signedInText').html(
        'We hid the sign-in button because you have signed in.');


    $('#step1').hide('slow');
    $('#step2').show('slow');
    var index = $('#tabs a[href="#step2"]').parent().index();
    $('#tabs').tabs('select', index);
    $('#authOps').show('slow');
  } else {
    if (debug) {
      errorMessage('There was a problem!', authResult);
    }
  }
}

/**
 * Clear the status area.
 */
function clearStatus() {
  $('#status').empty();
  stepActionEffect('consoleClear');
}

/**
 * Step 2 part 1
 * Gets your profile and updates the page to reflect it.
 */
function personalize() {
  stepActionEffect('2');

  if (debug) {
    console.log('Attempting to get your profile');
    statusLog('Attempting to get your profile');
  }

  var request = gapi.client.plus.people.get({
    'userId': 'me'
  });
  request.execute(function(resp) {
    myProfile = resp;
    console.log('Retrieved profile:', myProfile);
    statusLog('Retrieved profile:', myProfile);
    onProfileLoaded(myProfile);
  });

}

/**
 * Callback from people.me get
 *
 * @param {Object} profile an object which contains the profile info.
 */
function onProfileLoaded(profile) {
  var content = $('#profile');

  content.empty();
  if (!profile || profile == undefined) {
    if (debug) {
      errorMessage('Display empty profile', profile);
    }
    return;
  }

  if (profile.image != undefined && profile.image.url != undefined){
    $('<img />', {
      'src': profile.image.url
    }).appendTo('<p/>')
      .appendTo(content);
  }
  if (profile.displayName != undefined){
    $('<p/>')
      .append('Hello ' + profile.displayName + '!')
      .appendTo(content);
  }
  if (profile.tagline != undefined){
    $('<p/>')
      .append('Tagline: ' + profile.tagline)
      .appendTo(content);
  }
  if (profile.aboutMe != undefined){
    $('<p/>')
      .append('About: ' + profile.aboutMe)
      .appendTo(content);
  }
  if (profile.coverPhoto != undefined && rofile.coverPhoto.uri != undefined){
    $('<img />', {
      'src': profile.cover.coverPhoto.url
    }).appendTo('<p/>')
      .appendTo(content);
  }

}

/**
 * Step 2 part 2.
 * Retrieves your circled friends and displays them.
 *
 * @param {number} maxToShow maximum number of friends to show.
 */
function getCircled(maxToShow) {
  if (debug) {
    console.log('Attempting to get people in your circles');
    statusLog('Attempting to get people in your circles');
  }

  var request = gapi.client.plus.people.list({
    'userId': 'me',
    'collection': 'visible',
    'maxResults': maxToShow
  });
  request.execute(function(response) {
    onCirclesLoaded(response, maxToShow);
  });

}

function onCirclesLoaded(response, maxToShow) {
  if (debug) {
    console.log(response);
    statusLog(response);
  }
  circled = response.items;
  $('#getVaultCircled').show('slow');
  $('#circlesmessage').hide('slow');

  // Draw maxToShow profile images
  if (typeof maxToShow === 'undefined') {
    maxToShow = circled.length;
  }

  var circledPeopleDiv = $('#circledPeople');
  circledPeopleDiv.hide('slow');
  circledPeopleDiv.empty();

  if (circled === undefined){
    this.statusLog('No visible people were found.  This could be because you ' +
        'either did not grant the app access to any circled users or you ' +
        ' have no people in your circles.');
  }

  var toShow = (maxToShow < circled.length) ?
      maxToShow : circled.length;

  for (var i = 0; i < toShow; i++) {
    var a = $('<a/>', {
      'class': 'profileLink',
      'href': circled[i].url
    });
    var img = $('<img/>', {
      'class': 'profileImg',
      'title': circled[i].displayName,
      'src': circled[i].image.url
    }).appendTo(a);
    circledPeopleDiv.append(a);
  }

  if (toShow < circled.length) {
    circledPeopleDiv.append(' and <a id="getAllCircled" href="#">' +
        (circled.length - toShow) + ' more</a>.');
    // Click to retrieve all circled people
    $('#getAllCircled').click(function(event) {
      event.preventDefault();
      getCircled();
    });
  }
  circledPeopleDiv.show('slow');
  stepActionEffect('2');
}

/**
 * Invite
 *
 * @param {Object} e event.
 */
function onInviteWidgetClick(e) {
}

/**
 * History API
 */

/**
 * Step 4 part 1
 * Write a moment
 *
 * @param {Object} body the content of the moment to write.
 */
function writeMoment(body) {
  console.log('Sending moment', body);
  statusLog('Sending moment', body);

  var request = gapi.client.plus.moments.insert({
    'userId': 'me',
    'collection': 'vault',
    'resource': body
  });
  request.execute(onMomentWritten);

  stepActionEffect('4');
}

/**
 * Step 4 part 2
 * Use History API to write a custom moment
 */
function writeCustomMoment() {
  try {
    body = $.parseJSON($('#custom-json').val());

    var request = gapi.client.plus.moments.insert({
      'userId': 'me',
      'collection': 'vault',
      'resource': body
    });
    request.execute(onMomentWritten);
    stepActionEffect('4a');

  }catch (e) {
    errorLog(e);
  }
}

function onMomentWritten(response) {
  console.log('Moment write response', response);
  statusLog('Moment write response', response);
  $('#moments').prepend(createMomentDiv(response));
}

// Step 5

function getMoments(maxToShow) {
  stepActionEffect('5');
  if (debug) {
    console.log('Getting moments');
    statusLog('Getting moments');
  }

  var request = gapi.client.plus.moments.list({
    'userId': 'me',
    'collection': 'vault',
    'maxResults': maxToShow
  });
  request.execute(function(response) {
    onMomentsLoaded(response, maxToShow);
  });
}

function onMomentsLoaded(response) {
  if (debug) {
    statusLog('Moment list response', response);
    console.log('Moment list response', response);
  }
  var momentsDiv = $('#moments');
  momentsDiv.hide();
  var moments = response.items;

  if (debug) {
    console.log('Moments: ' + moments);
    statusLog('Moments: ' + moments);
  }

  momentsDiv.empty();
  $('#momentsTextarea').val('');

  if (typeof maxToShow === 'undefined') {
    maxToShow = moments.length;
  }
  var toShow = (maxToShow < moments.length) ?
      maxToShow : moments.length;
  for (var i = 0; i < toShow; i++) {
    var moment = moments[i];

    // Create the moment / delete / share buttons
    var momentDiv = createMomentDiv(moment);
    momentsDiv.append(momentDiv);

    // Append the text for the current moment
    var currText = '\n' + getMomentString(moment) + '\n';
    statusLog(currText);
    console.log(currText);

  }

  if (toShow < moments.length) {
    momentsDiv.append(' and <a id="getAllMoments" href="#">' +
        (moments.length - toShow) + ' more</a>.');
    $('#getAllMoments').click(function(event) {
      event.preventDefault();
      getMoments();
    });
  }
  momentsDiv.show('slow');
  return moments;
}

/**
 * Step 5 part 3
 * Delete a moment
 *
 * @param {string} momentId the ID of the moment to delete.
 * @return {Boolean} TRUE if the moment has been successfully deleted, false
 *    otherwise.
 */
function deleteMoment(momentId)  {
  stepActionEffect('5a');
  if (debug) {
    console.log('Preparing to delete');
    console.log('momentId:');
    console.log(momentId);
    statusLog('Preparing to delete');
    statusLog('momentId:');
    statusLog(momentId);
  }
  if (debug) {
    console.log('Deleting moment');
    statusLog('Deleting moment');
  }

  var request = gapi.client.plus.moments.remove({
    'id': momentId
  });
  request.execute(function(response) {
    onMomentDeleted(response, momentId);
  });

  return false;
}

function onMomentDeleted(response, momentId) {
  if (response && response.error != null) {
    console.log('Moment could not be deleted.');
    statusLog('Moment could not be deleted.');
  } else {
    if (debug) {
      console.log('Moment deleted');
      statusLog('Moment deleted');
    }
    $('#moment' + momentId).remove();
  }
}

/**
 * Helper for creating divs for moments
 *
 * @param {Object} moment JSON representation of the moment to render.
 * @return {string} a text description of the moment.
 */
function getMomentString(moment) {
  var momentText = 'moment.id: ' + JSON.stringify(moment.id) +
      ' moment.type: ' + JSON.stringify(moment.type) +
      ' moment.target: ' + JSON.stringify(moment.target.id) +
      '\n';
  return momentText;
}

function createMomentDiv(moment) {
  // get the last item with a slash before it for the type
  var type = JSON.stringify(moment.type).split('/');
  type = type[type.length - 1];

  // abridge the long moment id
  var momentIdPart = JSON.stringify(moment.id);
  momentIdPart = momentIdPart.substring(0, 5) + '(...)';

  var momentHtml = $('<div>moment.id: ' + momentIdPart +
      ' moment.type: ' + type +
      ' moment.target.id: ' +
      '</div>');
  var a = $('<a/>', {
    'class': 'momentLink',
    'href': createShareMomentUrl(moment)
  }).append('Share');
  var deleteHtml = $('<button/>', {
    'class': 'deleteBtn',
    'click': function() {
      deleteMoment(moment.id);
    }
  }).append('Delete');

  var momentDiv = $('<li/>', {
    'id': 'moment' + moment.id,
    'class': 'momentDiv'
  });
  momentDiv.append(a);
  momentDiv.append(momentHtml);
  momentDiv.append(deleteHtml);
  return momentDiv;
}

/**
 * helper for moment URLs
 *
 * @param {Object} moment JSON representation of the moment to which we create
 *    a link.
 * @return {string} the URL linking to the moment.
 */
function createShareMomentUrl(moment) {
  return 'https://plus.google.com/share?url=' +
      encodeURIComponent(moment.target.id);
}

function statusLog(message, obj) {
  var now = new Date();
  var addZero = '';
  if (parseInt(now.getSeconds()) < 10) addZero = '0';
  message = '[' + now.getHours() + ':' + now.getMinutes() + ':' +
    addZero + now.getSeconds() + ' ' + now.getMilliseconds() + '] ' + message;

  if (obj != null) {
    message += '\n' + JSON.stringify(obj).replace(/,/g, ',\n');
  }
  $('#status').prepend(message + '\n\n');
}

function errorLog(errorMessage, obj) {
  var errorDiv = $('#errorDiv');

  var errorMessageDiv = $('#errorStatus');
  if (obj != null) {
    errorMessage += JSON.stringify(obj).replace(/,/g, ',\n');
  }
  errorMessageDiv.html('<h2>' + errorMessage + '</h2>');
  errorMessageDiv.show();
  errorDiv.show();
}

/**
 * Helper to render explicit InteractivePost widgets.
 *
 * divID
 *
 */
function renderInteractivePostButtons(divId) {
  var options = {
    contenturl: 'https://coopersample.appspot.com/static/starter.html#content',
    contentdeeplinkid: '/',
    clientid: clientId,
    prefilltext: 'Some prefilled text and an interactive tutorial to get you started...',
    calltoactionlabel: 'INVITE',
    calltoactionurl: 'https://coopersample.appspot.com/static/starter.html#action',
    calltoactiondeeplinkid: '/starter'
  };
  gapi.interactivepost.render(divId, options);
};

// Helper for transfer effects
function stepActionEffect(step) {
  var from;
  var to;

  // Map the steps for from / to...
  // The following is a guide for usable divs
  // The containers for the action buttons [actionsColumn]
  //   (1) gConnect
  //   (2) authOps
  //   (3) inviteDiv
  //   (4) momentsDiv
  //   (4a)
  //   (5) manageMomentsDiv
  //   (6) circledMomentsDiv
  //
  // The containers for the tabs in the middle section [descriptionsColumn]
  //   (1) step1
  //       ...
  //   (6) step6 (the tab divs)
  //
  // The status column [statusColumn]
  //   statusConsoleDiv
  //   clearStatusDiv

  if (step == 'consoleClear') {
    from = 'clearStatusDiv';
    to = 'statusConsoleDiv';
  }else if (step == '1') {
      from = 'step1';
      to = 'statusConsoleDiv';
  }else if (step == '2') {
    from = 'authOps';
    to = 'step2';
  }else if (step == '3') {
    from = 'inviteDiv';
    to = 'step3';
  }else if (step == '4') {
    from = 'sample-moment-buttons';
    to = 'statusConsoleDiv';
  }else if (step == '4a') {
    from = 'customMomentDiv';
    to = 'statusConsoleDiv';
  }else if (step == '5') {
    from = 'manageMomentsDiv';
    to = 'step5';
  }else if (step == '5a') {
    from = 'moments';
    to = 'statusConsoleDiv';
  }else {
    // Error: unrecognized step
    return;
  }

  options = { to: '#' + to, className: 'ui-effects-transfer' };

  // run the effect
  $('#' + from).effect('transfer', options, 500);
}
