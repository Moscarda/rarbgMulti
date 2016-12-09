var body = $("body");
$("tr.lista2").each(function (){
	var td = $(this).find("td").eq(1);
	td.prepend("<input style='height: 13px;' class='rarbgcheck' type='checkbox'>");
});
body.append("<div class='momane_wrapper'>" +
	"<div class='momane_title'><img src='"+chrome.extension.getURL("logo.png") + "'></div> " +
	"<button class='rarbgdownload'>Download Selected</button> " +
	"<button  class='rarbgcheckall'>Check All</button>" +
	"<button  class='rarbguncheck'>UnCheck All</button>" +
	"<label for='downloadMagnet' title='Check this if you want to download the magnet link too'>" +
	"<input style='height: 13px;' type='checkbox' id='downloadMagnet'>Download Magnet</label>" +
	"</div>"
);
$(".rarbgcheckall").click(function (){
	$(".rarbgcheck").prop("checked", true);
});

$(".rarbguncheck").click(function (){
	$(".rarbgcheck").prop("checked", false);
});
$(".rarbgdownload").click(function (){
	var checked = $(".rarbgcheck:checked"),
		downloadMagnet = $("#downloadMagnet").is(":checked");
	var urls = [];
	checked.each(function (){
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
				downloadFile("rar" + this.i, link);
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

});
var textFile = null;
function makeTextFile (text){
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

function downloadFile (classIndex, fileStr){
	body.append("<a id='" + classIndex + "' download href='" + fileStr + "'>download</a>");
	$("a#" + classIndex)[0].click();
	$("a#" + classIndex).remove();
}