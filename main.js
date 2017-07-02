var getI18N = chrome.i18n.getMessage;
var body = $("body");
var magnetIcon = "https://dyncdn.me/static/20/img/magnet.gif";
var torrentIcon = "https://dyncdn.me/static/20/img/16x16/download.png";
addControls();


$("body").on("click", ".momane_torrent", function(){
	downloadTorrents($(this).prev().prev(), true);
}).on("click", ".momane_magnet", function(){
	downloadTorrents($(this).prev().prev().prev(), false, true, true);
}).on("click", ".momane_expandall", function () {
	$(this).parent().next().find(".tvshowClick").each(function () {
		$(this)[0].click();
    });
});

body.append("<div class='momane_wrapper'>" +
	"<div class='momane_title'><img src='" + chrome.extension.getURL("logo.png") + "'></div> " +
	"<button class='rarbgdownload'>" + getI18N("downloadSelected") + "</button> " +
	"<button  class='rarbgcheckall'>" + getI18N("checkAll") + "</button>" +
	"<button  class='rarbguncheck'>" + getI18N("unCheckAll") + "</button>" +
	"<label for='downloadTorrent'>" +
	"<input style='height: 13px;' checked type='checkbox' id='downloadTorrent'>" + getI18N("downloadTorrents") + "</label>" +
	"<label for='downloadMagnet'><input style='height: 13px;' type='checkbox' id='downloadMagnet'>" + getI18N("downloadMagnet") + "</label>" +
	"<div class='momne_note'>" + getI18N("note") + "</div>" +
	"</div>"
).append("<div class='momane_notification'></div>");
$("#searchinput").parents("tr").eq(0).after("<tr class='momane_searchOpt'><td>" +
	"<label><input type='radio' name='searchOpt' id='date_ASC'>" + getI18N("dateASC") + "</label>" +
	"<label><input type='radio' name='searchOpt' id='size_DESC'>" + getI18N("sizeDESC") + "</label>" +
	"<label><input type='radio' name='searchOpt' id='seeders_DESC'>" + getI18N("seedersDESC") + "</label>" +
	"<label><input type='radio' name='searchOpt' id='leechers_DESC'>" + getI18N("leechersDESC") + "</label>" +
	"</td></tr>");

$("h1.black").append(`<button class='momane_expandall'>${getI18N("expandAll")}</button>`);
$(".rarbgcheckall").click(function(){
	$(".rarbgcheck").prop("checked", true);
});

$(".rarbguncheck").click(function(){
	$(".rarbgcheck").prop("checked", false);
});
$(".rarbgdownload").click(function(){
	var checked = $(".rarbgcheck:checked"),
		downloadTorrent = $("#downloadTorrent").is(":checked");
	downloadMagnet = $("#downloadMagnet").is(":checked");
	downloadTorrents(checked, downloadTorrent, downloadMagnet);

});

$("#searchTorrent").find("button.btn-primary").click(function(e){
	if ($("input[name='searchOpt']").is(":checked")) {
		e.preventDefault();
		var url = "https://rarbg.to/torrents.php?search=";
		url += "" + $("#searchinput").val().trim();
		var searchOpt = $("input[name='searchOpt']:checked").attr("id").split("_");
		url += "&order=" + searchOpt[0] + "&by" + searchOpt[1];
		var officialOpt = $(".inputadvscat:checked");
		if (officialOpt.length !== 0) {
			var officialOpts = "";
			officialOpt.each(function(i, opt){
				var that = $(this);
				officialOpts += "&" + encodeURI(that.attr("name")) + "=" + that.attr("value");
			});
			url += officialOpts;
		}
		window.location.href = url;
	}
});

var target = document.querySelector(".lista-rounded");
var observer = new MutationObserver(function(mutations){
	mutations.forEach(function(mutation){
		if (mutation.removedNodes.length > 0) {
			addControls($(mutation.target));
		}
		console.log(mutation);
	});

});

var config = {childList:true, subtree:true};

observer.observe(target, config);


function downloadTorrents(sel, downloadTorrent, downloadMagnet, copy){
	var urls = [];
	sel.each(function(){
		var that = $(this);
		urls.push("https://rarbg.to" + that.next().attr("href"));
	});
	var requests = [], magnites = [];
	$.each(urls, function(i, url){
		requests.push($.ajax({
			url:url,
			i:i,
			success:function(data){
				var html = $($.parseHTML(data));
				var a = html.find("a[onmouseover^='return overlib']").eq(0),
					link = a.attr("href");
				if (downloadTorrent) {
					downloadFile("rar" + this.i, link);
				}
				var maglink = a.next().attr("href");
				magnites.push(maglink);
			}
		}));
	});
	if (downloadMagnet) {
		$.when.apply($, requests).then(function(){
			magnites.sort(function(x, y){
				x = x.replace(/.*&dn=/, "");
				y = y.replace(/.*&dn=/, "");
				if(x>y){
					return 1;
				}else if(x<y){
					return -1;
				}else {
					return 0;
				}
			});
			var magStr = magnites.join("\t\n");
			var fileUrl = makeTextFile(magStr);
			if (!copy) {
				body.append("<a class='rarbgmag' download='magnet_links_" + $("#searchinput").val() + ".txt' href='" + fileUrl + "'>download</a>");
				$(".rarbgmag")[0].click();
				$(".rarbgmag").remove();
			} else {
				copyTextToClipboard(magStr.trim());
				$(".momane_notification").show().text(getI18N("magnetCopied"));
				setTimeout(function(){
					$(".momane_notification").fadeOut();
				}, 2000);
			}
		});
	}
}

function addControls(sel){
	var downloadControlStr = "tr.lista2";
	var ctrlDownloadStr = ".lista2 td:nth-child(2) a";
	var downloadControl = sel ? sel.find(downloadControlStr):$(downloadControlStr);
	var ctrlDownload = sel ? sel.find(ctrlDownloadStr):$(ctrlDownloadStr);
	downloadControl.each(function(){
		var td = $(this).find("td").eq(1);
		td.prepend("<input style='height: 13px;' class='rarbgcheck' type='checkbox'>")
			.find("a").eq(0).after("<img title='" + getI18N("downloadTorrents") + "' class='momane_icon momane_torrent' src='" + torrentIcon + "'>" +
			"<img title='" + getI18N("copyMagnet") + "'  class='momane_icon momane_magnet' src='" + magnetIcon + "'>");
	});

	ctrlDownload.click(function(e){
		if (e.ctrlKey) {
			e.preventDefault();
			downloadTorrents($(this).prev(), false);
		}
	});
}


function makeTextFile(text){
	var textFile = null;
	var data = new Blob([text], {type:'text/plain'});

	// If we are replacing a previously generated file we need to
	// manually revoke the object URL to avoid memory leaks.
	if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
	}

	textFile = window.URL.createObjectURL(data);

	// returns a URL you can use as a href
	return textFile;
}

function downloadFile(classIndex, fileStr){
	body.append("<a id='" + classIndex + "' download href='" + fileStr + "'>download</a>");
	$("a#" + classIndex)[0].click();
	$("a#" + classIndex).remove();
}

function copyTextToClipboard(text){
	var copyFrom = $('<textarea id="testt"/>');
	copyFrom.val(text);
	$('body').append(copyFrom);
	copyFrom.select();
	document.execCommand('copy', true);
	copyFrom.remove();
}

