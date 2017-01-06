var getI18N = chrome.i18n.getMessage;
var body = $("body");
$("tr.lista2").each(function (){
	var td = $(this).find("td").eq(1);
	td.prepend("<input style='height: 13px;' class='rarbgcheck' type='checkbox'>");
});

$(".lista2 td:nth-child(2) a").click(function (e){
	if (e.ctrlKey) {
		e.preventDefault();
		downloadTorrents($(this).prev(), false);
	}
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
);
$("#searchinput").parents("tr").eq(0).after("<tr class='momane_searchOpt'><td>" +
	"<label><input type='radio' name='searchOpt' id='date_ASC'>" + getI18N("dateASC") + "</label>" +
	"<label><input type='radio' name='searchOpt' id='size_DESC'>" + getI18N("sizeDESC") + "</label>" +
	"<label><input type='radio' name='searchOpt' id='seeders_DESC'>" + getI18N("seedersDESC") + "</label>" +
	"<label><input type='radio' name='searchOpt' id='leechers_DESC'>" + getI18N("leechersDESC") + "</label>" +
	"</td></tr>");
$(".rarbgcheckall").click(function (){
	$(".rarbgcheck").prop("checked", true);
});

$(".rarbguncheck").click(function (){
	$(".rarbgcheck").prop("checked", false);
});
$(".rarbgdownload").click(function (){
	var checked = $(".rarbgcheck:checked"),
		downloadTorrent = $("#downloadTorrent").is(":checked");
	downloadMagnet = $("#downloadMagnet").is(":checked");
	downloadTorrents(checked, downloadTorrent, downloadMagnet);

});

$("#searchTorrent").find("button.btn-primary").click(function (e){
	if ($("input[name='searchOpt']").is(":checked")) {
		e.preventDefault();
		var url = "https://rarbg.to/torrents.php?search=";
		url += "" + $("#searchinput").val().trim();
		var searchOpt = $("input[name='searchOpt']:checked").attr("id").split("_");
		url += "&order=" + searchOpt[0] + "&by" + searchOpt[1];
		var officialOpt = $(".inputadvscat:checked");
		if (officialOpt.length !== 0) {
			var officialOpts = "";
			officialOpt.each(function (i, opt){
				var that = $(this);
				officialOpts += "&" + encodeURI(that.attr("name")) + "=" + that.attr("value");
			});
			url += officialOpts;
		}
		window.location.href = url;
	}
});

function downloadTorrents(sel, downloadTorrent, downloadMagnet){
	var urls = [];
	sel.each(function (){
		var that = $(this);
		urls.push("https://rarbg.to" + that.next().attr("href"));
	});
	var requests = [], magnites = [];
	$.each(urls, function (i, url){
		requests.push($.ajax({
			url:url,
			i:i,
			success:function (data){
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
		$.when.apply($, requests).then(function (){
			var magStr = magnites.join("\t\n");
			var fileUrl = makeTextFile(magStr);
			body.append("<a class='rarbgmag' download='magnet_links_" + $("#searchinput").val() + ".txt' href='" + fileUrl + "'>download</a>");
			$(".rarbgmag")[0].click();
			$(".rarbgmag").remove();		// downloadFile(fileUrl);

		});
	}
}


var textFile = null;
function makeTextFile(text){
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

