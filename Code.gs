/* Consider this your server-side file but without the server */

/**
 * Special function that handles HTTP GET requests to the published web app.
 * @return {HtmlOutput} The HTML page to be served.
 ***/
function doGet(e) {
    var requestedId = e.parameter.zoho_id;
    var templ = HtmlService.createTemplateFromFile('webpage');
    templ.data = requestRecordFromCRM(requestedId);
    return templ.evaluate()
        .setTitle('Web Form')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


/* - - - - - - - Zoho API - - - - - - - */
/* Data is pulled from Zoho CRM to pre-populate webform */

/*Post/Update record to CRM*/
function postRecordToCRM() {
    var authToken = 'INSERT_API_KEY'; //Zoho CRM API key goes here
    var xmlData = '<Leads><row no="1"><FL val="Company">Your Company</FL><FL val="First Name">HannahZZZZZ</FL><FL val="Last Name">SmithZZZ</FL><FL val="Email">ABCtesting@testing.com</FL></row></Leads>';
    var zohoPostUrl = 'https://crm.zoho.com/crm/private/json/Leads/insertRecords?authtoken=' + authToken + '&scope=crmapi&xmlData=';
    var response = UrlFetchApp.fetch(zohoPostUrl + encodeURIComponent(xmlData));
    var sanitizedResponse = JSON.parse(response.getContentText());
    Logger.log(sanitizedResponse);
}



/*Fetch record data with Lead ID*/
function requestRecordFromCRM(requestedId) {
    //var requestedId = 'INSERT_API_KEY'; //Sample record id
    var authToken = 'INSERT_API_KEY'; //Zoho CRM API key goes here
    var zohoRequestUrl = 'https://crm.zoho.com/crm/private/json/Leads/getRecordById?&authtoken=' + authToken + '&scope=crmapi&id=' + requestedId;
    var response = UrlFetchApp.fetch(zohoRequestUrl);
    var sanitizedResponse = (response.getContentText());
    //complete sample zoho api call (remember to replace api key) https://crm.zoho.com/crm/private/json/Leads/getRecordById?&authtoken=INSERT_API_KEY&scope=crmapi&id=392848000035649100

    /*Sanitize json*/
    var output = JSON.parse(sanitizedResponse);
    //uncomment Logger.log(output);

    /*Declare the variables you want to print*/
    var parsedOutput = output.response.result.Leads.row.FL;
    var recordObj = {}

    /*Equate variable value to corresponding key-value pair returned by api response*/
    for (var i = 0; i < output.response.result.Leads.row.FL.length; i++) {
      Logger.log(output.response.result.Leads.row.FL[i].val+" ==== "+output.response.result.Leads.row.FL[i].content);
      var fl=output.response.result.Leads.row.FL[i];

      if (fl.val == 'Width') {recordObj.width = fixinput(fl.content);}
      if (fl.val == 'Length') {recordObj.length = fixinput(fl.content);}
      if (fl.val == 'Height') {recordObj.height = fixinput(fl.content);}
      if (fl.val == 'Street') {recordObj.street = fixinput(fl.content);}
      if (fl.val == 'City') {recordObj.city =fixinput( fl.content);}
      if (fl.val == 'State') {recordObj.state = fixinput(fl.content);}
      if (fl.val == 'Country') {recordObj.country = fixinput(fl.content);}
      if (fl.val == 'Zip Code') {recordObj.zip = fixinput(fl.content);}
      if (fl.val == 'Lead Name') {recordObj.leadName = fixinput(fl.content);}
      if (fl.val == 'First Name') {recordObj.firstName =fixinput( fl.content);}
      if (fl.val == 'Last Name') {recordObj.lastName =fixinput( fl.content);}
      if (fl.val == 'Phone') {recordObj.phone = fixinput(fl.content);}
      if (fl.val == 'Email') {recordObj.email = fixinput(fl.content);}
      if (fl.val == 'Lead Owner') {recordObj.leadOwner = fixinput(fl.content);}
      if (fl.val == 'Standard Cost') {recordObj.standardPrice = fixinput(fl.content);}
      if (fl.val == 'Building Price') {recordObj.total =fixinput( fl.content);}
    }
  return (recordObj);
}

function fixinput(input) {
  //uncomment Logger.log(input);
  return input;
}

function debug() {
    Logger.log(ScriptApp.getService().getUrl());
}



/* - - - - - - - PDF Layer API - - - - - - - */
/*  High quality HTML to PDF conversion API  */

/* Convert HTML to PDF */
function convertToPDF(html) {
    var authKey = 'INSERT_API_KEY'; //PDF Layer API key goes here
    var creator = 'hkdeven';
    var documentName = 'WebForm.pdf';

    /* PDF Layer only reads inline-css, unless you pass a css_url parameter with the API call - remember, plain css only */
    var cssUrl = 'https://s3-us-west-2.amazonaws.com/folder/styles.css'; //Link to your external css file, if applicable

    var encodedUrl = encodeURI("http://api.pdflayer.com/api/convert" +
                               "?access_key=" + authKey +
                               "&creator=" + creator +
                               "&document_name=" + documentName +
                               "&dpi=300" +
                               "&page_size=A4" +
                               "&margin_top=0" +
                               "&margin_bottom=0" +
                               "&margin_left=0" +
                               "&margin_right=0" +
                               "&use_print_media=1" +
                               "&css_url=" + cssUrl);

    var payload = {
      'document_html': html
    }
    var request = {
      'method' : 'POST',
      'payload' : payload
    }
    var response = UrlFetchApp.fetch(encodedUrl, request);
    var obj = {}

    obj.headers = response.getAllHeaders();
    obj.responseCode = response.getResponseCode();

    if (obj.headers['Content-Type'] == MimeType.PDF) {
        /* PDF file for client-side webpage */
        obj.response = Utilities.base64Encode(response.getContent());
    }

    return JSON.stringify(obj);
}
