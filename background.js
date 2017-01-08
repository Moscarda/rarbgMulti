/**
 * Created by hank on 1/6/2017.
 * https://momane.com
 */
chrome.browserAction.onClicked.addListener(function (){
	chrome.tabs.create({url:"https://rarbg.to/torrents.php"});
});