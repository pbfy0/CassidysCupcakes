(function(){
var o = function(price){ return {price: price, o_factor: 2, i_factor: 1, caption: function(name){return 'Increase ' + name + ' Output by 100%'}} };
var O = function(price){ return {price: price, o_factor: 6, i_factor: 1, caption: function(name){return 'Increase ' + name + ' Output by 500%'}} };
var t = function(price){ return {price: price, o_factor: 1, i_factor: 0.5, caption: function(name){return name + ' Production time reduced 50%'}} };

var items = {
	helpers: {
		name: "Helpful Bakers",
		output: 1,
		interval: null,
		base_price: 10,
		margin_price: 1,
		price_mult: 2.6,
		caption: "Your Greatest Fans. Bakes when you bake.",
		upgrades: [o(100), o(1500), o(8500), o(35000), o(150000)]
	},
	scarlet: {
		name: "Scarlethalla Oven",
		output: 5,
		interval: 5,
		base_price: 15,
		margin_price: 5,
		price_mult: 1.9,
		caption: "Discounted from Lady Scarlet herself.",
		upgrades: [o(300), t(1500), o(4500), t(75000), O(100000)]
	},
	orion: {
		name: "Orion's Lance",
		output: 100,
		interval: 10,
		base_price: 150,
		margin_price: 145,
		price_mult: 1.8,
		caption: "Automatic cupcake maker in each one.",
		upgrades: [o(900), t(45000), o(105000), t(360000), O(2000000)]
	},
	grimm: {
		name: "Grimm",
		output: 7000,
		interval: 20,
		base_price: 5000,
		margin_price: 8000,
		price_mult: 1.7,
		caption: "Unknownst to many, Grimm has been known to bake a cupcake or two.",
		upgrades: [o(50000), t(150000), o(450000), t(1200000), O(4000000)]
	},
	kitchen: {
		name: "The Kitchen",
		output: 45000,
		interval: 30,
		base_price: 75000,
		margin_price: 35000,
		price_mult: 1.6,
		caption: "Donated and paid for by MBFC",
		upgrades: [o(200000), t(1000000), o(5000000), t(10000000), O(50000000)]
	},
	ivaldi: {
		name: "Sons Of Ivaldi",
		output: 100000,
		interval: 40,
		base_price:890000,
		margin_price: 150000,
		price_mult: 1.5,
		caption: "Surely there couldn't have been THIS many sons.",
		upgrades: [o(50000000), t(450000000), o(3000000000), t(15000000000), O(65000000000)]
	},
	farms: {
		name: "Cupcake Farms",
		output: 320000,
		interval: 50,
		base_price: 5000000,
		margin_price: 400000,
		price_mult: 1.4,
		caption: "Plant one, Harvest two. Or a few billion",
		upgrades: [o(450000000), t(3000000000), o(15000000000), t(65000000000), O(150000000000)]
	},
	celestial: {
		name: "Celestial Beings",
		output: 4500000,
		interval: 60,
		base_price: 15000000,
		margin_price: 6000000,
		price_mult: 1.3,
		caption: "Might as well make use of their celestial-ness",
		upgrades: [o(5000000000), t(55500000000), o(660000000000), t(7500000000000), O(6600000000000)]
	}
}
var reqs = [10, 50, 150, 250, 500];
for(var xi in items){
	var x = items[xi];
	for(var i = 0; i < 5; i++){
		x.upgrades[i].req = reqs[i];
	}
}

var order = ["helpers", "scarlet", "orion", "grimm", "kitchen", "ivaldi", "farms", "celestial"]
for(var i = 0; i < order.length; i++){
	items[order[i]].idx = i;
	items[order[i]].img = i + '.svg'
}
window.items = items;
window.order = order;
})();