product = (list) ->
	o = 1
	for el in list
		o *= el
	return o

class ItemState
	constructor: (@game, type) ->
		@type = items[type]
		if @type.interval == null then @update = () -> 0
		@n_items = 0
		@upgrades = []
		@s_left = Infinity
	load: (save) ->
		@upgrades = @type.upgrades[0...save.upgrades]
		@n_items = save.number
		@s_left = @calc_interval()
	save: () ->
		if @n_items then {number: @n_items, upgrades: @upgrades.length}
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
		@n_items * @type.output * product(x.o_factor for x in @upgrades)
	calc_interval: () ->
		if @type.interval == null then return Infinity
		@type.interval * product(x.i_factor for x in @upgrades)
	buy: (n=1) ->
		if @game.cupcakes < @calc_price() * n then return false
		@game.cupcakes -= @calc_price() * n
		@n_items += n
		@game.interrupt_tick()
		return true
	update: (elapsed) ->
		@s_left -= elapsed;
		if @s_left <= 0
			@s_left += @calc_interval()
			return @calc_output()
		return 0
class Game
	constructor: () ->
		@items = {}
		@cupcakes = 0
		@cc = $('cimage')
		@cn = $('cupcake_number')
		@cc.addEventListener 'click', @click.bind(@)
		@load({cupcakes: 0, items: {}})
		@last_tick = undefined
		@last_interval = undefined
		
		@loop(0)
	click: () ->
		@cupcakes += @items.helpers.calc_output() + 1
		@interrupt_tick()
	tick: (elapsed) ->
		x = for _, i of @items
			@cupcakes += i.update(elapsed)
			i.s_left
		@cn.textContent = "#{Math.round @cupcakes} Cupcakes"
		return Math.min x...
	loop: (elapsed) ->
		t = @tick(elapsed)
		#console.log(t)
		@last_tick = window.performance.now()
		if t != Infinity then @last_interval = setTimeout (() => @loop(t)), t * 1000
	interrupt_tick: () ->
		clearTimeout @last_interval
		@loop((window.performance.now() - @last_tick) / 1000)
	load: (save) ->
		clearTimeout @last_interval
		@cupcakes = save.cupcakes
		for i in order
			@items[i] = new ItemState(@, i)
			if save.items[i]?
				@items[i].load(save.items[i])
		@loop(0)
		return
	save: () ->
		o = {cupcakes: @cupcakes, items: {}}
		for k, v of @items
			t = v.save()
			if t then o.items[k] = t
		return o
	prompt_load: () ->
		$('savepicker').click()

document.addEventListener 'DOMContentLoaded', () ->
	window.game = new Game()
	
	picker = $('savepicker')
	picker.addEventListener 'change', () ->
		if picker.files[0]?
			blob = picker.files[0];
			fileReader = new FileReader();
			fileReader.addEventListener 'load', () ->
				picker.value = '';
				buf = this.result;
				u8a = new Uint8Array(buf);
				game.load(convert_save(decodeLSO(u8a)));
				console.log('Loaded ccSave.sol')
			fileReader.readAsArrayBuffer(blob);
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