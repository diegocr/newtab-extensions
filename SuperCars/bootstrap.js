/* ***** BEGIN LICENSE BLOCK *****
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * The Original Code is SuperCars NewTab Mozilla Extension.
 * 
 * The Initial Developer of the Original Code is
 * Copyright (C)2012 Diego Casorran <dcasorran@gmail.com>
 * All Rights Reserved.
 * 
 * ***** END LICENSE BLOCK ***** */

let {classes: Cc, interfaces: Ci} = Components, ssu, URL, OS, FakeCache = {
	observe: function(s,t,d) {
		if(t == 'http-on-modify-request') {
			let c = s.QueryInterface(Ci.nsIHttpChannel);
			
			if(URL == c.originalURI.spec) {
				OS.removeObserver(this,'http-on-modify-request',false);
				OS = null;
				c.loadFlags |= Ci.nsIRequest.LOAD_FROM_CACHE|Ci.nsIRequest.VALIDATE_NEVER;
			}
		}
	}
};

function startup(aData, aReason) {
	let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	
	xhr.addEventListener('load',function(){
		if(xhr.status == 200) {
			let m = xhr.responseText.match(/<center><img SRC="([^"]+day=\d+)"/);
			URL = m && xhr.channel.URI.resolve(m[1]) || null;
			
			if(URL) {
				
				xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
				try {
					xhr.open('GET', URL, true);
					xhr.overrideMimeType('image/jpeg');
					xhr.setRequestHeader('Connection','close');
					xhr.send();
				} catch(e) {
					Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService)
						.logStringMessage(e.message+' ~ '+aData.id+' ~ '+URL);
					return;
				}
				
				let css = 'data:text/css;charset=utf-8,'
					+ encodeURIComponent('@-moz-document url(about:newtab){#newtab-scrollbox{'
					+ (function(c){
						let p = Cc["@mozilla.org/preferences-service;1"]
							.getService(Ci.nsIPrefService).getBranch('extensions.'+aData.id+'.');
						try {	c = p.getBoolPref('center');	}
						catch(e) {	p.setBoolPref('center', c);	}
						return c ? 'background-position:50% 50%;' : '';
					})(true)
					+ 'background-size:cover;background-image:url("'+URL+'") !important}}');
				
				let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService),
					uri = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(css, null, null);
				sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
				ssu = uri;
				
				OS = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
				OS.addObserver(FakeCache,'http-on-modify-request',false);
			}
		}
	},false);
	
	xhr.open('GET', 'http://www.supercars.net/PD?displayPotd=y', true);
	xhr.send();
}

function shutdown(aData, aReason) {
	if(aReason == APP_SHUTDOWN)
		return;
	
	if(ssu) {
		let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
		sss.unregisterSheet(ssu, sss.USER_SHEET);
	}
	if(OS) OS.removeObserver(FakeCache,'http-on-modify-request',false);
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
