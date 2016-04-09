$ = document.getElementById.bind(document)
Function::property = (prop, desc) ->
	Object.defineProperty @prototype, prop, desc

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
	return f + if g then a[g-1] else ''
class UpgradeState
	constructor: (@item, @n) ->
		@all = @item.type.upgrades
		@active = @all[0...@n]
		@dom = new UpgradeDom(@)
	calc_o_factor: () ->
		product(x.o_factor for x in @active)
	calc_i_factor: () ->
		product(x.i_factor for x in @active)
	n_active: ->
		@active.length
	set: (@n) ->
		@active = @all[0...@n]
	buy: ->
		next = @all[@n]
		if @item.game.cupcakes < next.price then return false
		@item.game.cupcakes -= next.price
		@active.push(next)
		@n++
		@dom.update()
	update: ->
		@dom.update()
class UpgradeDom
	constructor: (@us) ->
		@el = $('upgradetemplate').children[0].cloneNode(true)
		@els = 
			name: @el.getElementsByClassName('upgradename')[0]
			upgrades: []
		for i in [1..5]
			@els.upgrades[i-1] = @el.getElementsByClassName('upgrade' + i)[0]
		
		@visible = false
		$('upgrades').appendChild(@el)
		@init()
	init: () ->
		@name = @us.item.type.name
		udom = @
		@el.addEventListener 'mouseover', =>
			@us.item.game.tooltip(@us.item.type.caption)
		for v, i in @els.upgrades
			v.addEventListener 'click', () ->
				if (! @classList.contains('disabled')) and (! @classList.contains('checked'))
					udom.us.buy()
			u = @us.all[i]
			do (u) =>
				v.addEventListener 'mouseover', () =>
					@us.item.game.tooltip(u.caption(@us.item.type.name)+"<br/>Cost: <span>#{format_number(u.price)}</span><br/>Requires <span>#{u.req}</span> #{@us.item.type.name}")
					spans = $('caption').getElementsByTagName('span')
					if ! (u in @us.active)
						spans[0].style.color = if u.price <= @us.item.game.cupcakes then 'green' else 'red'
						spans[1].style.color = if u.req <= @us.item.n_items then 'green' else 'red'
						return
		@update()
	update: () ->
		if @us.item.n_items == 0
			@el.style.display = "none"
			return
		else
			@el.style.display = ""
		for v, i in @els.upgrades
			act = @us.active[i]
			all = @us.all[i]
			if act
				v.style.display = ""
				v.classList.add('checked')
				v.classList.remove('disabled')
			else if @us.active[i-1] or i == 0
				v.style.display = ""
				if all.price <= @us.item.game.cupcakes and all.req <= @us.item.n_items
					v.classList.remove('checked')
					v.classList.remove('disabled')
				else
					v.classList.remove('checked')
					v.classList.add('disabled')
			else
				v.style.display = "none"
		return
	@property 'visible',
		get: () -> @_visible
		set: (val) ->
			@_visible = val
			@el.style.display = if val then "" else "none"
			return
	@property 'name',
		get: () -> @els.name.textContent
		set: (val) -> @els.name.textContent = val

class ItemDom
	constructor: (@item) ->
		@el = $('storetemplate').children[0].cloneNode(true)
		@els =
			img: @el.getElementsByTagName('img')[0]
			name: @el.getElementsByClassName('storename')[0]
			number: @el.getElementsByClassName('storenumber')[0]
			button: @el.getElementsByTagName('button')[0]
			progress: @el.getElementsByTagName('progress')[0]
		@_number = 0
		@visible = false
		$('inventory').appendChild(@el)
		@int = Infinity
		@init()
	init: () ->
		@img = "images/items/#{@item.type.img}"
		@name = @item.type.name
		@els.button.addEventListener 'click', =>
			@item.buy()
		@el.addEventListener 'mouseover', =>
			@item.game.tooltip(@item.type.caption)
		@update()
	update: () ->
		@button_text = "Buy (#{format_number(@item.calc_price())})"
		@number = @item.n_items
		@int = @item.calc_interval()
		if @int != Infinity and @number
			@els.progress.max = @int
			@els.progress.style.display = ""
		else
			@els.progress.style.display = "none"
		o = format_number(@item.calc_output())
		@els.progress.setAttribute('data-text', if o.length < 10 then o + " cupcakes" else o)
	animate: (elapsed) ->
		if @int != Infinity then @progress = (@progress + elapsed) % @int
	a_reset: () ->
		#if @int != Infinity then @progress -= @int
		@progress = 0
	@property 'visible',
		get: () -> @_visible
		set: (val) ->
			@_visible = val
			@el.style.display = if val then "" else "none"
			return
	@property 'name',
		get: () -> @els.name.textContent
		set: (val) -> @els.name.textContent = val
	@property 'img',
		get: () -> @els.img.src
		set: (val) -> @els.img.src = val
	@property 'progress',
		get: () -> @els.progress.value
		set: (val) -> @els.progress.value = val
	@property 'number',
		get: () -> @_number
		set: (val) ->
			@_number = val
			@els.number.textContent = val
	@property 'button_text',
		get: () -> @els.button.textContent
		set: (val) -> @els.button.textContent = val
class ItemState
	constructor: (@game, type) ->
		@type = items[type]
		if @type.interval == null then @update = () -> 0
		@n_items = 0
		@upgrades = new UpgradeState(@, 0)
		@ms_left = Infinity
		@dom = new ItemDom(@)
	load: (save) ->
		@upgrades.set(save.u)
		@n_items = save.n
		@ms_left = @calc_interval()
		@dom.update()
		@dom.a_reset()
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
		if @n_items == 0
			@first_update = true
			@upgrades.dom.update()
		@game.items[order[@type.idx+1]].dom.visible = true
		@n_items += n
		@game.interrupt_tick()
		@dom.update()
		@upgrades.update()
		return true
	update: (elapsed) ->
		if @n_items == 0 then return 0
		if @first_update
			@ms_left = 0
			@first_update = false
		else
			@ms_left -= elapsed;
		#if @type.idx == 1 then console.log(elapsed, @ms_left)
		if @ms_left <= 0
			#console.log("#{@type.name} output")
			@dom.a_reset()
			@ms_left += @calc_interval()
			return @calc_output()
		return 0

	animate: (elapsed) ->
		if @n_items > 0 then @dom.animate(elapsed)

class Game
	constructor: () ->
		@items = {}
		@cc = $('cimage')
		@cn = $('cupcake_number')
		@cupcakes = 0
		@cc.addEventListener 'click', @click.bind(@)
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

		
		@animate(null)
		@load({c: 0, i: {}})
	animate: (prev) ->
		n = window.performance.now()
		if prev != null
			elapsed = n - prev
			for _, v of @items
				v.animate(elapsed)
		requestAnimationFrame () => @animate(n)
	click: () ->
		@cupcakes += @items.helpers.calc_output() + 1
		#@interrupt_tick()
	tick: (elapsed) ->
		#console.log("Tick " + elapsed)
		x = for _, i of @items
			@cupcakes += i.update(elapsed)
			i.ms_left
		
		#console.log x
		return Math.min x...
	loop: (elapsed) ->
		t = @tick(elapsed)
		#console.log(t)
		@last_tick = window.performance.now()
		if t != Infinity then @last_interval = setTimeout (() => @loop(t)), t
	interrupt_tick: () ->
		clearTimeout @last_interval
		@loop(window.performance.now() - @last_tick)
	update_upgrades: () ->
		for _, i of @items
			i.upgrades.update()
	tooltip: (s) ->
		$('tooltip').innerHTML = s
	@property 'cupcakes',
		get: () -> @_cupcakes
		set: (val) ->
			@_cupcakes = val
			if @active_tab == 'upgrades' then @update_upgrades()
			@cn.textContent = "#{format_number @_cupcakes} Cupcakes"
	load: (save) ->
		clearTimeout @last_interval
		@cupcakes = save.c
		t = true
		for v, i in order
			if ! @items[v]? then @items[v] = new ItemState(@, v)
			@items[v].load(if save.i[i] then save.i[i] else {n: 0, u: 0})
			@items[v].dom.visible = t
			t = !! @items[v].n_items
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
				game.active_tab = q.id
				if q.id == 'upgrades' then game.update_upgrades()
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