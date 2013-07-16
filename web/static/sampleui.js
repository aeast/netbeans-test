// jQuery initialization
$(document).ready(function() {
  // Remove anything that's already in the button list
  $('#sample-moment-buttons').empty();
  // Load the sample activities and create a button for each one
  //$.getJSON("js/sampleActivities.json", function(data) {
  $.getJSON('/AndyTest/static/sampleActivities.json', function(data) {
    // render buttons for them
    $.each(data, function(name, body) {
      var button = $('<button/>', {
        'class': 'write-sample',
        'data-moment': JSON.stringify(body)
      }).append(name);
      button.appendTo('#sample-moment-buttons');
    });
  });
  // Attach event listeners to buttons
  $('.write-sample').live('click', function() {
    // send the json attached to the button as a moment
    writeMoment($.parseJSON($(this).attr('data-moment')));
  });

  // pretty the buttons
  $('.write-sample').button();
  $('#accordion').accordion({
    heightStyle: 'content',
    activate: function(event, ui) {
      var activeIdx = $('#accordion').accordion('option', 'active');
      $('#tabs').tabs({ active: activeIdx });
    }
  });

  $('#getCircled').button();
  $('#accessTokButton').button();
  $('#getProfile').button();
  $('#listMoments').button();
  $('#writeCustomMoment').button();
  $('#getVaultCircled').button();
  $('#clearStatus').button();
  $('#invite-button').button();

  $('#tabs').tabs({
    activate: function(event, ui) {
      var activeIdx = $('#tabs').tabs('option', 'active');
      $('#accordion').accordion({ active: activeIdx });
    }
  });
  if ($('[data-clientid="YOUR_CLIENT_ID"]').length > 0 || clientId == 'YOUR_CLIENT_ID'){
    errorLog('This sample requires your OAuth credentials (client ID) from ' +
      '<a href="https://code.google.com/apis/console/#:access" target="apis-console">Google APIs console</a>.<br>'+
      'Edit the <code>starter.html</code> and <code>samplestarter.js</code> files and replace <code>YOUR_CLIENT_ID</code> '+
      'with your client ID.')
  }
});
