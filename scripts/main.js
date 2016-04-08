$ = document.getElementById.bind(document);

function convert_save(fs){
	var r = {cupcakes: fs.Cupcakes, items: {}};
	for(var i = 0; i < 8; i++){
		var n = fs['Inventory' + i];
		if(n == 0) continue;
		var name = order[i];
		var upgrades = fs.Upgrades[i] ? fs.Upgrades[i].length : 0;
		r.items[name] = {number: n, upgrades: upgrades};
	}
	return r;
}



document.addEventListener('DOMContentLoaded', function(){
	var picker = $('savepicker')
	picker.addEventListener('change', function(){
		if(picker.files[0]){
			var blob = picker.files[0];
			var fileReader = new FileReader();
			fileReader.addEventListener('load', function() {
				picker.value = '';
				var buf = this.result;
				var u8a = new Uint8Array(buf);
				window.x = convert_save(decodeLSO(u8a));
			});
			fileReader.readAsArrayBuffer(blob);
		}
	});
	function load_cc_save(){
		picker.click();
	}
	window.lccs = load_cc_save;
});

