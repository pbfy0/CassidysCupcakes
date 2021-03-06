$ = document.getElementById.bind(document)
$$ = document.querySelector.bind(document)
Function::property = (prop, desc) ->
	Object.defineProperty @prototype, prop, desc

# this is pointless. I have no idea why I made it so complicated.
u_mod = (a, b) ->
        a - Math.floor(a/b)*b

class Obfuscator
	constructor: (@a, @b) ->
		@f = {}
		@r = {}
		for i in [0...@a.length]
			@f[@a[i]] = i
			@r[@b[i]] = i
	obf: (s) ->
		r = (Math.random()*@b.length) | 0
		@b[r] + (@b[u_mod(@f[x]+i+r, @b.length)] for x, i in s.split("")).join("")
	deobf: (s) ->
		r = @r[s[0]]
		(@a[u_mod(@r[x]-i-r, @a.length)] for x, i in s.substr(1).split("")).join("")
ob_v1 = new Obfuscator('ci"4.n293{10u:65,}87z', 'dnjgpkmhbstfrwlqcyxvz')
# 0.123456789{}:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()`~-=_+[];',./<>?
# but was that comment about the obfuscation or the game as a whole

g_shift = false

product = (list) ->
	o = 1
	for el in list
		o *= el
	return o
sum = (list) ->
	o = 0
	for el in list
		o += el
	return o
add_commas = (s) ->
	a_ = s.split('').reverse().join('')
	return (x.split("").reverse().join("") for x in a_.match(/.{1,3}/g)).reverse().join(',')
a_format_number = (n) ->
	a = ['K', 'M', 'B', 'T', 'QD', 'QN', 'SX']
	g = 0
	d = n >= 10000
	while n >= 10000000 and a[g]?
		g++
		n /= 1000
	f = Math.round(n)
	if d then f = add_commas(f.toString())
	return f + if g then a[g-1] else ''
g_format_number = (n) ->
	n = Math.round(n)
	if n < 10000 then return n.toString()
	a = ['', 'K', 'M', 'B', 'T', 'QD', 'QN', 'SX']
	b_10_3 = (Math.log10(n) / 3) | 0
	nn = n / Math.pow(10, b_10_3 * 3)
	return nn.toPrecision(4) + a[b_10_3]

g_settings = {}
has_localstorage = true
try
	has_localstorage = localStorage && true
catch e
	has_localstorage = false
console.log(has_localstorage)
do ->
	ss = if has_localstorage then (localStorage.getItem('ccSettings') ? '{}') else '{}'
	g_settings = JSON.parse(ss)
	_settings = {
		g_format: true
	}
	g_settings = Object.assign(_settings, g_settings)
format_number = if g_settings.g_format then g_format_number else a_format_number
class UpgradeState
	_proxy:
		blacklist: true
		accessible:
			set: 1
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
		@update()
		@item.dom.update()
	update: ->
		@dom.update()
class UpgradeDom
	_proxy:
		blacklist: true
		accessible:
			init: 1
			update: 1
			
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
		@el.addEventListener 'mouseenter', =>
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
	_proxy:
		blacklist: true
		accessible:
			init: 1
			update: 1
			update_buyable: 1
			animate: 1
			
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
			@item.buy(if g_shift then 10 else 1)
		@el.addEventListener 'mouseover', =>
			@item.game.tooltip(@item.type.caption)
		@update()
	update: () ->
		@button_text = "Buy#{if g_shift then " 10" else "\xa0\xa0\xa0"}\xa0\xa0\xa0\xa0#{format_number(@item.calc_price_s())}"
		@number = @item.n_items
		@int = @item.calc_interval()
		if @int != Infinity and @number
			@els.progress.max = @int
			@els.progress.style.display = ""
		else
			@els.progress.style.display = "none"
		o = format_number(@item.calc_output())
		@els.progress.setAttribute('data-text', if o.length < 10 then o + " cupcakes" else o)
		@update_buyable()
	update_buyable: () ->
		@els.button.disabled = @item.calc_price_s() > @item.game.cupcakes
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
			@item.game.items._proxy.accessible[@item.name] = val
			return
	@property 'name',
		get: () -> @els.name.textContent
		set: (val) -> @els.name.textContent = val
	@property 'img',
		get: () -> @els.img.src
		set: (val) -> @els.img.src = val
	@property 'progress',
		get: () -> @els.progress.value
		set: (val) -> @els.progress.value = Math.round(val)
	@property 'number',
		get: () -> @_number
		set: (val) ->
			@_number = val
			@els.number.textContent = val
	@property 'button_text',
		get: () -> @els.button.textContent
		set: (val) -> @els.button.textContent = val
class ItemState
	_proxy:
		blacklist: true
		accessible:
			animate: 1
			load: 1
			save: 1
			update: 1
			dom: 1
			ms_left: 1
	constructor: (@game, @name) ->
		@type = items[@name]
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
	calc_price: (n=@n_items) ->
		pm = @type.price_mult
		if n < 10 then pm *= 1
		else if n < 50 then pm *= 1.2
		else if n < 100 then pm *= 1.4
		else if n < 500 then pm *= 1.6
		else if n < 1000 then pm *= 3.3
		else if n < 6000 then pm *= 6.5
		else pm *= 10
		
		pmg = @type.margin_price
		if n > 400
			if pmg == 1 then pmg = 50
			if pmg == 5 then pmg = 75
		else if n > 500 # wtf
			0
		
		extra = pmg * n * pm
		return @type.base_price + extra
	calc_output: () ->
		@n_items * @type.output * @upgrades.calc_o_factor()
	calc_interval: () ->
		if @type.interval == null then return Infinity
		@type.interval * @upgrades.calc_i_factor() * 1000
	calc_price_n: (n) ->
		sum(@calc_price(i + @n_items) for i in [0...n]) * if n < 0 then -0.5 else 1
	calc_price_s: ->
		if g_shift then @calc_price_n(10) else @calc_price()
	buy: (n=1) ->
		pr = @calc_price_n(n)
		if @game.cupcakes < pr then return false
		@game.cupcakes -= pr
		if @n_items == 0
			@first_update = true
			@upgrades.dom.update()
		if @type.idx + 1 < order.length
			@game.items[order[@type.idx+1]].dom.visible = true
		@n_items += n
		@game.interrupt_tick()
		@dom.update()
		@upgrades.update()
		return true
	update: (elapsed) ->
		#console.log(@type.name, @ms_left)
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
	_proxy:
		blacklist: true
		accessible:
			cc: 1
			ce: 1
			cn: 1
			last_interval: 1
			last_tick: 1
			picker: 1
			update_doms: 1
			close_settings: 1
			animate: 1
			click: 1
			tick: 1
			loop: 1
			interrupt_tick: 1
			update_upgrades: 1
			update_buyable: 1
			tooltip: 1
			fix_tooltip: 1
			_load: 1
			_save: 1
			active_tab: 1
			browser_load: 1
			dev: 1
			ipr: 1
			_items: 1
			
	constructor: () ->
		@pr = proxy_object(@)
		#@_proxy = deep_merge({}, @_proxy)
		@_items = {_proxy: {accessible: {}}}
		@items = hide_pr(@_items)
		@dev = false
		@cc = $('cimage')
		@ce = $('cupcake')
		@cn = $('cupcake_number')
		@cupcakes = 0
		@cc.addEventListener 'click', (event) =>
			event.stopPropagation()
			@click()
		@ce.addEventListener 'click', =>
			if document.querySelector('#cimage:hover')
				@click()
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
		#key 'shift', (=> @update_doms()), (=> @update_doms(); console.log('test'))
		document.addEventListener 'keydown', (ev) =>
			if ev.key == 'Shift'
				g_shift = true
				@update_doms()
		document.addEventListener 'keyup', (ev) =>
			if ev.key == 'Shift'
				g_shift = false
				@update_doms()
		g_fmt_checkbox = $$('#numberformat input')
		g_fmt_checkbox.checked = g_settings.g_format
		g_fmt_checkbox.addEventListener 'click', (ev) =>
			format_number = if ev.target.checked then g_format_number else a_format_number
			@update_doms()
			@cupcakes = @cupcakes
			g_settings.g_format = ev.target.checked
		$$('#importcc button').addEventListener 'click', () =>
			if prompt('Browse to the following location', '%APPDATA%\\BrawlhallaAir\\Local Store\\#SharedObjects\\ccSave.sol')
				@prompt_load()
			@close_settings()
		$$('#import button').addEventListener 'click', () =>
			pr = prompt('Paste save here')
			if pr?
				@load(pr)
			@close_settings()
		$$('#export button').addEventListener 'click', () =>
			prompt('Save this somewhere safe', @save())
			@close_settings()
		$$('#reset button').addEventListener 'click', () =>
			if confirm('Are you sure you want to wipe your save?')
				@reset()
			@close_settings()
		$('settingsclose').addEventListener 'click', () =>
			@close_settings()
		$('opensettings').addEventListener 'click', () =>
			$('settings').style.display = ''
		@animate(null)
		@reset()
	update_doms: () ->
		for k, i of @items
			i.dom.update()
		return
	close_settings: () ->
		$('settings').style.display = 'none'
	reset: () ->
		@_load({c: 0, i: {}})
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
		return
	update_buyable: () ->
		for _, i of @items
			i.dom.update_buyable()
		return
	tooltip: (s) ->
		$('tooltip').innerHTML = s
		@fix_tooltip()
	fix_tooltip: () ->
		x = $('tooltip')
		x.style.marginLeft = x.clientHeight * 275 / 318 + "px"
	@property 'cupcakes',
		get: () -> @_cupcakes
		set: (val) ->
			@_cupcakes = val
			if @active_tab == 'upgrades' then @update_upgrades()
			if @active_tab == 'inventory' then @update_buyable()
			@cn.textContent = "#{format_number @_cupcakes} Cupcakes"
	_load: (save) ->
		clearTimeout @last_interval
		if save[''] == 123
			@dev = true
			window.game = @
		@cupcakes = save.c
		t = true
		for v, i in order
			if ! @items[v]? then @items[v] = new ItemState(@, v)
			@items[v].load(save.i[i] ? {n: 0, u: 0})
			@items[v].dom.visible = t
			t = !! @items[v].n_items
		@loop(0)
		return
	_save: () ->
		o = {c: @cupcakes, i: {}}
		if @dev then o[''] = 123
		for k, v of @items
			t = v.save()
			if t then o.i[v.type.idx] = t
		return o
	load: (save) ->
		@_load(JSON.parse(ob_v1.deobf(save)))
	save: () ->
		ob_v1.obf(JSON.stringify(@_save()))
	browser_save: () ->
		localStorage.setItem('ccSave', @save())
	browser_load: () ->
		if ! localStorage? then return false
		ss = localStorage.getItem('ccSave')
		if ! ss then return false
		if ss.startsWith('{') then @_load(JSON.parse(ss))
		else @load(localStorage.getItem('ccSave'))
		return true
	prompt_load: () ->
		$('savepicker').click()

document.addEventListener 'DOMContentLoaded', () ->
	game = new Game()
	game.active_tab = 'inventory'
	game.browser_load()
	ch = $('tabs').children
	toggles = ($(x.getAttribute('data-toggle')) for x in ch)
	for i in ch
		q = $(i.getAttribute('data-toggle'))
		do (q, i) ->
			i.addEventListener 'click', () ->
				game.active_tab = q.id
				if q.id == 'upgrades' then game.update_upgrades()
				if q.id == 'inventory' then game.update_buyable()
				for j in toggles
					if j != q then j.style.display = "none"
				q.style.display = ""
				for j in ch
					if j != i then j.classList.remove('active')
				i.classList.add('active')
	window.addEventListener 'beforeunload', (ev) ->
		if has_localstorage
			game.browser_save()
			localStorage.setItem('ccSettings', JSON.stringify(g_settings))
		else
			ev.preventDefault()
			return ev.returnValue = 'Warning! Export save before leaving the page or else your progress will be lost'
	window.addEventListener 'resize', () ->
		game.fix_tooltip()
		
	setInterval (() -> game.browser_save()), 30000
	window.addEventListener 'load', () ->
		game.fix_tooltip()
	#$('inventory').appendChild $('storetemplate').children[0].cloneNode(true)
	if ! window.game then window.game = game.pr
	return