/* ***** BEGIN LICENSE BLOCK *****
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * The Original Code is NewTab Background Shuffler Mozilla Extension.
 * 
 * The Initial Developer of the Original Code is
 * Copyright (C)2012 Diego Casorran <dcasorran@gmail.com>
 * All Rights Reserved.
 * 
 * ***** END LICENSE BLOCK ***** */

function startup(aData, aReason) {
	let tmp = {};
	Components.utils.import('resource://gre/modules/AddonManager.jsm', tmp);
	tmp.AddonManager.getAddonsByTypes(['extension'],function(list) {
		let c = list.length, addons = [];
		while(c--) {
			if(/^\{4d4f5a49-4c4c-4100-\d{4}-4e4557544142\}$/.test(list[c].id)) {
				addons.push(list[c]);
			}
		}
		if((c = addons.length)) {
			while(c--) {
				addons[c].userDisabled = true;
			}
			addons.sort(function() 0.5 - Math.random()).pop().userDisabled = false;
			addons = null;
		}
	});
}

function shutdown(aData, aReason) {}
function install(aData, aReason) {}
function uninstall(aData, aReason) {}
