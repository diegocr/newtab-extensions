/* ***** BEGIN LICENSE BLOCK *****
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * The Original Code is Flickr NewTab Mozilla Extension.
 * 
 * The Initial Developer of the Original Code is
 * Copyright (C)2012 Diego Casorran <dcasorran@gmail.com>
 * All Rights Reserved.
 * 
 * ***** END LICENSE BLOCK ***** */

let {classes: Cc, interfaces: Ci} = Components, ssu;

function startup(aData, aReason) {
	let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	
	xhr.addEventListener('load',function(){
		if(xhr.status == 200) {
			try {
				let m = JSON.parse(xhr.responseText).photos.photo;
				m.sort(function() 0.5-Math.random());
				m = m.shift();
				var URL = m.url_l || m.url_h || null;
			} catch(e) {
				Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService)
					.logStringMessage(e.message+' ~ '+aData.id);
			}
			
			if(URL) {
				
				xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
				try {
					xhr.open('GET', URL, true);
					xhr.send();
				} catch(e) {
					Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService)
						.logStringMessage(e.message+' ~ '+aData.id+' ~ '+URL);
					return;
				}
				
				URL = 'data:text/css;charset=utf-8,'
					+ encodeURIComponent('@-moz-document url(about:newtab){#newtab-scrollbox,#newtab-vertical-margin{'
					+ (function(c){
						let p = Cc["@mozilla.org/preferences-service;1"]
							.getService(Ci.nsIPrefService).getBranch('extensions.'+aData.id+'.');
						try {	c = p.getBoolPref('center');	}
						catch(e) {	p.setBoolPref('center', c);	}
						return c ? 'background-position:50% 50%;' : '';
					})(true)
					+ 'background-size:cover;background-image:url("'+URL+'") !important}}');
				
				let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService),
					uri = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(URL, null, null);
				sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
				ssu = uri;
			}
		}
	},false);
	
	let formData = new flickerInterestingnessForm();
	formData.append("extras", "url_l,url_h");
	formData.append("per_page", 500);
	xhr.open('POST', 'https://api.flickr.com/services/rest/', true);
	xhr.send(formData);
}

function flickerInterestingnessForm () {
	let formData = Cc['@mozilla.org/files/formdata;1'].createInstance(Ci.nsIDOMFormData);
	formData.append("method", "flickr.interestingness.getList");
	formData.append("api_key", "7cef40b1fbba6eccddc67f6263481cff");
	formData.append("format", "json");
	formData.append("nojsoncallback", 1);
	return formData;
}

function shutdown(aData, aReason) {
	if(aReason == APP_SHUTDOWN)
		return;
	
	if(ssu) {
		let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
		sss.unregisterSheet(ssu, sss.USER_SHEET);
	}
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
