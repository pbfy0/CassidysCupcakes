$ = document.getElementById.bind(document)

convert_save = (fs) ->
	r = {c: fs.Cupcakes, i: {}}
	for i in [0..7]
		n = fs['Inventory' + i]
		if n == 0 then continue
		upgrades = if fs.Upgrades[i] then fs.Upgrades[i].length else 0
		r.i[i] = {n: n, u: upgrades}
	return r

product = (list) ->
	o = 1
	for el in list
		o *= el
	return o
a = ['K', 'M', 'B', 'T', 'QD', 'QN', 'SX']
add_commas = (s) ->
	a_ = s.split('').reverse().join('')
	return (x.split("").reverse().join("") for x in a_.match(/.{1,3}/g)).reverse().join(',')
format_number = (n) ->
	g = 0
	d = n >= 10000
	while n >= 10000000
		g++
		n /= 1000
	f = Math.round(n)
	if d then f = add_commas(f.toString())
	return f + if g then (" " + a[g-1]) else ''
class UpgradeState
	constructor: (@item, @n) ->
		@all = @item.type.upgrades
		@active = @all[0...@n]
	calc_o_factor: () ->
		product(x.o_factor for x in @active)
	calc_i_factor: () ->
		product(x.i_factor for x in @active)
	n_active: ->
		@active.length
	buy: ->
		next = @all[@n]
		if @item.game.cupcakes < next.price then return false
		@active.push(next)
		@n++
class ItemState
	constructor: (@game, type) ->
		@type = items[type]
		if @type.interval == null then @update = () -> 0
		@n_items = 0
		@upgrades = new UpgradeState(@, 0)
		@ms_left = Infinity
		@create_dom()
	load: (save) ->
		@upgrades = new UpgradeState(@, save.u)
		@n_items = save.n
		@ms_left = @calc_interval()
	save: () ->
		if @n_items then {n: @n_items, u: @upgrades.n_active()}
	calc_price: () ->
		pm = @type.price_mult
		if @n_items < 10 then pm *= 1
		else if @n_items < 50 then pm *= 1.2
		else if @n_items < 100 then pm *= 1.4
		else if @n_items < 500 then pm *= 1.6
		else if @n_items < 1000 then pm *= 3.3
		else if @n_items < 6000 then pm *= 6.5
		
		pmg = @type.margin_price
		if @n_items > 400
			if pmg == 1 then pmg = 50
			if pmg == 5 then pmg = 75
		else if @n_items > 500 # wtf
			0
		
		extra = pmg * @n_items * pm
		return @type.base_price + extra
	calc_output: () ->
		@n_items * @type.output * @upgrades.calc_o_factor()
	calc_interval: () ->
		if @type.interval == null then return Infinity
		@type.interval * @upgrades.calc_i_factor() * 1000
	buy: (n=1) ->
		if @game.cupcakes < @calc_price() * n then return false
		@game.cupcakes -= @calc_price() * n
		@n_items += n
		@game.interrupt_tick()
		return true
	update: (elapsed) ->
		@ms_left -= elapsed;
		if @ms_left <= 0
			#console.log("#{@type.name} output")
			@ms_left += @calc_interval()
			return @calc_output()
		return 0
	create_dom: () ->
		dom = $('storetemplate').children[0].cloneNode(true)
		dom.getElementsByTagName('img')[0].src = "images/items/#{@type.img}"
		dom.getElementsByClassName('storename')[0].textContent = @type.name
		dom.getElementsByTagName('button')[0].addEventListener 'click', =>
			@buy()
			@update_dom()
		@dom = dom
		@update_dom()
	update_dom: () ->
		@dom.getElementsByClassName('storenumber')[0].textContent = @n_items
		@dom.getElementsByTagName('button')[0].textContent = "Buy (#{@calc_price()})"
		e = @dom.getElementsByTagName('progress')[0]
		if @calc_interval() != Infinity
			e.max = @calc_interval()
		else
			e.style.display = "none"
	hide: () ->
		@dom.parentElement.removeChild(@dom)
	show: () ->
		$('inventory').appendChild(@dom)

class Game
	constructor: () ->
		@items = {}
		@cupcakes = 0
		@cc = $('cimage')
		@cn = $('cupcake_number')
		@cc.addEventListener 'click', @click.bind(@)
		@load({c: 0, i: {}})
		@last_tick = undefined
		@last_interval = undefined
		@picker = $('savepicker')
		scope = @
		@picker.addEventListener 'change', () ->
			if scope.picker.files[0]?
				blob = scope.picker.files[0];
				fileReader = new FileReader();
				fileReader.addEventListener 'load', () ->
					scope.picker.value = '';
					buf = this.result;
					u8a = new Uint8Array(buf);
					scope.load(convert_save(decodeLSO(u8a)));
					console.log('Loaded ccSave.sol')
				fileReader.readAsArrayBuffer(blob);

		
		@loop(0)
	click: () ->
		@cupcakes += @items.helpers.calc_output() + 1
		@interrupt_tick()
	tick: (elapsed) ->
		x = for _, i of @items
			@cupcakes += i.update(elapsed)
			i.ms_left
		@cn.textContent = "#{format_number @cupcakes} Cupcakes"
		return Math.min x...
	loop: (elapsed) ->
		t = @tick(elapsed)
		#console.log(t)
		@last_tick = window.performance.now()
		if t != Infinity then @last_interval = setTimeout (() => @loop(t)), t
	interrupt_tick: () ->
		clearTimeout @last_interval
		@loop(window.performance.now() - @last_tick)
	load: (save) ->
		clearTimeout @last_interval
		@cupcakes = save.c
		for v, i in order
			@items[v] = new ItemState(@, v)
			if save.i[i]?
				@items[v].load(save.i[i])
		@loop(0)
		return
	save: () ->
		o = {c: @cupcakes, i: {}}
		for k, v of @items
			t = v.save()
			if t then o.i[v.type.idx] = t
		return o
	browser_save: () ->
		localStorage.setItem('ccSave', JSON.stringify(@save()))
	browser_load: () ->
		if ! localStorage.getItem('ccSave') then return false
		game.load(JSON.parse(localStorage.getItem('ccSave')))
		return true
	prompt_load: () ->
		$('savepicker').click()

document.addEventListener 'DOMContentLoaded', () ->
	window.game = new Game()
	game.browser_load()
	ch = $('tabs').children
	toggles = ($(x.getAttribute('data-toggle')) for x in ch)
	for i in ch
		q = $(i.getAttribute('data-toggle'))
		do (q, i) ->
			i.addEventListener 'click', () ->
				for j in toggles
					if j != q then j.style.display = "none"
				q.style.display = ""
				for j in ch
					if j != i then j.classList.remove('active')
				i.classList.add('active')
		continue
	window.addEventListener 'beforeunload', () -> game.browser_save()
	setInterval (() -> game.browser_save()), 30000
	#$('inventory').appendChild $('storetemplate').children[0].cloneNode(true)
	return