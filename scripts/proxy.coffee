class ProxyError extends TypeError
	# pass
window.hide_pr = (obj) ->
	return new Proxy obj,
		ownKeys: (obj) ->
			x for x in Object.getOwnPropertyNames(obj) when x != '_proxy'
window.deep_merge = (first, second) ->
	pcs = {}
	return new Proxy first,
		get: (first, name) ->
			a = first[name]
			b = second[name]
			if typeof(a) == "object"
				if typeof(b) == "object"
					q = pcs[name]
					if !q? or q.f != a or q.s != b
						q = 
							f: a
							s: b
							v: deep_merge(a, b)
						pcs[name] = q
					return q.v
				return a
			return a ? b
		ownKeys: (first) ->
			k = {}
			for x in Object.getOwnPropertyNames(first)
				k[x] = true
			for x in Object.getOwnPropertyNames(second)
				k[x] = true
			for k of k
				k
window.proxy_object = (obj, pro) ->
	pcs = {}
	pro = pro ? obj._proxy ? {blacklist: true}
	new_call = (class_, args...) ->
		new Function::bind.apply(class_, args)
	is_accessible = (name) ->
		pro.blacklist ^ (pro.accessible and pro.accessible[name])
	is_unfiltered = (name) ->
		pro.unfiltered and pro.unfiltered[name]
	is_writeable = (name) ->
		pro.readwrite ^ (pro.writeable and pro.writeable[name])
	return pr = new Proxy obj, 
		get: (obj, name) ->
			if name == '__proto__' then return Object.getPrototypeOf(pr)
			if is_accessible(name)
				v = obj[name]
				if is_unfiltered(name)
					return v
				t = typeof(v)
				if t in ["function", "object"]
					pc = pcs[name]
					if ! pc? then pc = pcs[name] = {}
					if pc.o == v then return pc.p
					pc.o = v
					if t == "object" then return pc.p = proxy_object(v)
					if t == "function" then return pc.p = new Proxy v,
						apply: (v, this_, args) ->
							if this_ == pr then return v.apply(obj, args)
							return v.apply(this_, args)
				return v
			throw new ProxyError("Tried to read non-accessible property")
		set: (obj, name, val) ->
			if name == '__proto__'
				Object.setPrototypeOf(pr, val)
				return
			if is_writeable(name)
				obj[name] = val
				return
			throw new ProxyError("Tried to write non-writeable property")
		has: (obj, name) ->
			name of obj and pro.accessible[name]?
		ownKeys: (obj) ->
			#prn = Object.getOwnPropertyNames(obj)
			#if pro.blacklist and !pro.accessible then return prn
			#if !pro.blacklist and !pro.accessible then return []
			x for x in Object.getOwnPropertyNames(obj) when is_accessible(x)
		apply: (obj, this_, args) ->
			if pro.special? and pro.special.callable then return pro.apply(this_, args)
			throw new ProxyError("Tried to call non-callable object")
		construct: (obj, this_, args) ->
			if pro.special? and pro.special.constructable then return new_call(this_, args...)
			throw new ProxyError("Tried to construct non-constructable object")
		deleteProperty: (obj, name) ->
			if is_writeable(name)
				delete obj[name]
			throw new ProxyError("Tried to delete non-deleteable property")
		preventExtensions: (obj) ->
			if pro.special.can_prevent_extension
				Object.preventExtensions(obj)
			throw new ProxyError("Tried to prevent extensions when not allowed")
		# isExtensible
		setPrototypeOf: (obj, val) ->
			if is_accessible('__proto__')
				Object.setPrototypeOf(obj, val)	
			throw new ProxyError("Tried to set prototype when not allowed")
		getPrototypeOf: (obj) ->
			if is_writeable('__proto__')
				throw new ProxyError("Tried get prototype when not allowed")
			if pro.special? and pro.special.hasOwnProperty('override_prototype')
				return pro.special.override_prototype
			return Object.getPrototypeOf(obj)