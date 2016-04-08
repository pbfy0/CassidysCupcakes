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