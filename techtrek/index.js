

$(document).ready(()=>{

	var query = window.location.search.substring(1);
	var qs = parse_query_string(query);
	var api_access = null;
	var showDetails = false;

	// having clientID and secret in code here is not recommended
	// but we leave it here since this is just a sample demo
	var clientId = '45834350-24bc-4fb0-9867-3f7ca30e650e';
	var clientSecret = 'fdd4059c-b192-43b4-bd2e-6d75f5637e7f';

	// use https://cors-anywhere.herokuapp.com/ if you are planning to host
	// a local webserver for your app to bypass CORS issue with OAuth2
	// of course, this is not recommended also in a real world application
	var corsbypass = "https://cors-anywhere.herokuapp.com/";
	console.log(qs);

	var empty = "";

	$(function () {
	  $('[data-toggle="popover"]').popover()
	})

	$('#showdetails').hide();
	$('#loadingtext').hide();

	//if no query params, i.e its the homepage route
	if(qs[empty])
	{
		$('#loginlink').show();
		$('#showdetails').hide();
	}
	else
	{
		// if the code parameter is there,
		// then we have been redirected by the DBS OAuth login page
		if(qs['code'])
		{
			var code = qs["code"]	;
			var state = qs["state"];

			GetOAuthToken();
			$('#loginlink').hide();
			$('#loadingtext').show();
		}
		// if the get parameter is there,
		// then we have successfully retrieve the oauth token
		// and we can proceed to retrieve and display data from the other APIs
		else if(qs['get'])
		{
			$('#login').hide();
			$('#loadingtext').hide();
			$('#showdetails').show();

		}

	}

	//function to parse query parameters in the url
	function parse_query_string(query) {
	  var vars = query.split("&");
	  var query_string = {};
	  for (var i = 0; i < vars.length; i++) {
	    var pair = vars[i].split("=");
	    var key = decodeURIComponent(pair[0]);
	    var value = decodeURIComponent(pair[1]);
	    // If first entry with this name
	    if (typeof query_string[key] === "undefined") {
	      query_string[key] = decodeURIComponent(value);
	      // If second entry with this name
	    } else if (typeof query_string[key] === "string") {
	      var arr = [query_string[key], decodeURIComponent(value)];
	      query_string[key] = arr;
	      // If third or later entry with this name
	    } else {
	      query_string[key].push(decodeURIComponent(value));
	    }
	  }
	  return query_string;
	}

	// This function gets the Oauth2 token based on the
	// authorization code that was given in the url params
	// The authorization code is also given by OAuth2 after
	// the user is logged in and redirected back.
	function GetOAuthToken()
	{
		var settings = {
		  "async": true,
		  "crossDomain": true,
		  "url": corsbypass + "https://www.dbs.com/sandbox/api/sg/v1/oauth/tokens",
		  "method": "POST",
		  "headers": {
		    "authorization": "Basic NDU4MzQzNTAtMjRiYy00ZmIwLTk4NjctM2Y3Y2EzMGU2NTBlOmZkZDQwNTljLWIxOTItNDNiNC1iZDJlLTZkNzVmNTYzN2U3Zg==",
		    "content-type": "application/x-www-form-urlencoded",
		    "cache-control": "no-cache"
		  },
		  "data": {
		    "code": qs["code"],
		    "grant_type": "token",
		    "redirect_url": "http://localhost:8080/Hackaton/index.html?get=morgage"
		  }
		}

		$.ajax(settings).done(function (response) {
			console.log(response);
			api_access = response;

	  		$('#loginlink').hide();
			$('#login').hide();
			GetApplicantData();

		});
	}

	// this function gets the list of
	// morgage loan applicants and display
	// them in a table
	function GetApplicantData()
	{
		applicantData = {
			'Client Id': clientId,
			'Client secret': clientSecret,
		}
	  	var applicantSettings = {
		  "async": true,
		  "crossDomain": true,
		  "url": corsbypass + "https://www.dbs.com/sandbox/api/sg/v1/mortgages/170711048/applicants",
		  "method": "GET",
		  "headers": {
		    "content-type": "application/json",
		    "accesstoken": api_access["access_token"],
		    "clientid": clientId,
		    "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiIDogImh0dHBzOi8vY2FwaS5kYnMuY29tIiwiaWF0IiA6IDE1NDA4ODQ1MjAwMDgsICJleHAiIDogMTU0MDg4ODEyMDAwOCwic3ViIiA6ICJTVmN3TXpZPSIsInB0eXR5cGUiIDogMSwiY2xuaWQiIDogIjQ1ODM0MzUwLTI0YmMtNGZiMC05ODY3LTNmN2NhMzBlNjUwZSIsImNsbnR5cGUiIDogIjIiLCAiYWNjZXNzIiA6ICIxRkEiLCJzY29wZSIgOiAiMkZBLVNNUyIgLCJhdWQiIDogImh0dHBzOi8vY2FwaS5kYnMuY29tL2FjY2VzcyIgLCJqdGkiIDogIjM5NTQ4ODE1NzQ2OTMwMzUzMSIgLCJjaW4iIDogIlEwbE9NREF3TURBeCJ9.S03vCGQSYafw6CM9UjqMEpwLwAoMNHrWjFcChT2QlP0^Q0lOMDAwMDAx",
		    "cache-control": "no-cache"
		  },
		  "data": JSON.stringify(applicantData)
		}

		$.ajax(applicantSettings).done(function (response) {

		  $('#showdetails').show();

		  //render each row based on the data we retrieved
		  for(var i =0; i < response.applicantList.length; i++)
		  {
		  	var elem = response.applicantList[i];
		  	var tabletext = `
		  	<tr class="tablerow">
		  		<td>` + elem.applicant.applicantId + `</td>
		  		<td>` + elem.applicant.name.salutation + `</td>
		  		<td>` + elem.applicant.name.fullName + `</td>
			 </tr>
		  					`
		  	$('#tablebod').append(tabletext);
		  }

		});
	}
});
