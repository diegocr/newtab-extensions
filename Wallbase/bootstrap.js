/* ***** BEGIN LICENSE BLOCK *****
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * The Original Code is Wallbase NewTab Mozilla Extension.
 * 
 * The Initial Developer of the Original Code is
 * Copyright (C)2012 Diego Casorran <dcasorran@gmail.com>
 * All Rights Reserved.
 * 
 * ***** END LICENSE BLOCK ***** */

let {classes:Cc, interfaces:Ci,utils:Cu} = Components, ssu, sst;
let { atob } = Cu.import("resource://gre/modules/Services.jsm");

function startup(aData, aReason) {
	let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	
	xhr.addEventListener('load',function(){
		if(xhr.status == 200) {
			let m = xhr.responseText.match(/<a class="preview".*?wallpaper\/(\d+)/),
			URL = m ? 'http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-'+m[1]+'.jpg' : null;
			
			// if(URL) {
				// xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
				// xhr.addEventListener('load',function(){
					// let m = xhr.responseText.match(/<div id="bigwall"[^>]*>[\s\S]+? src="'\+B\('([^']+)'\)\+'"/),
					// URL = m && xhr.channel.URI.resolve(atob(m[1])) || null;
					
					if(URL) {
						let p = Cc["@mozilla.org/preferences-service;1"]
							.getService(Ci.nsIPrefService).getBranch('extensions.'+aData.id+'.');
						
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
								try {	c = p.getBoolPref('center');	}
								catch(e) {	p.setBoolPref('center', c);	}
								return c ? 'background-position:50% 50%;' : '';
							})(false)
							+ 'background-size:cover;background-image:url("'+URL+'") !important}}');
						
						if(ssu) shutdown();
						
						let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService),
							uri = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(URL, null, null);
						sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
						ssu = uri;
						
						let iVal = 20;
						try { iVal = p.getIntPref('interval'); }
						catch(e) { p.setIntPref('interval', iVal); }
						
						if(iVal) {
							let i = Ci.nsITimer, t = Cc["@mozilla.org/timer;1"].createInstance(i);
							t.initWithCallback({notify:startup.bind(this,aData)},iVal*60000,i.TYPE_ONE_SHOT);
							sst = t;
						}
					}
				// },false);
				
				// xhr.open('GET', URL, true);
				// xhr.send();
			// }
		}
	},false);
	
	xhr.open('GET', 'http://alpha.wallhaven.cc/random', true);
	xhr.send();
}

function shutdown(aData, aReason) {
	if(aReason == APP_SHUTDOWN)
		return;
	
	if(ssu) {
		let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
		sss.unregisterSheet(ssu, sss.USER_SHEET);
		ssu = null;
	}
	if(sst) sst.cancel();
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
