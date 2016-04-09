// Generated by CoffeeScript 1.10.0
var $, Game, ItemDom, ItemState, UpgradeDom, UpgradeState, a, add_commas, convert_save, format_number, product,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$ = document.getElementById.bind(document);

Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};

convert_save = function(fs) {
  var i, l, n, r, upgrades;
  r = {
    c: fs.Cupcakes,
    i: {}
  };
  for (i = l = 0; l <= 7; i = ++l) {
    n = fs['Inventory' + i];
    if (n === 0) {
      continue;
    }
    upgrades = fs.Upgrades[i] ? fs.Upgrades[i].length : 0;
    r.i[i] = {
      n: n,
      u: upgrades
    };
  }
  return r;
};

product = function(list) {
  var el, l, len, o;
  o = 1;
  for (l = 0, len = list.length; l < len; l++) {
    el = list[l];
    o *= el;
  }
  return o;
};

a = ['K', 'M', 'B', 'T', 'QD', 'QN', 'SX'];

add_commas = function(s) {
  var a_, x;
  a_ = s.split('').reverse().join('');
  return ((function() {
    var l, len, ref, results;
    ref = a_.match(/.{1,3}/g);
    results = [];
    for (l = 0, len = ref.length; l < len; l++) {
      x = ref[l];
      results.push(x.split("").reverse().join(""));
    }
    return results;
  })()).reverse().join(',');
};

format_number = function(n) {
  var d, f, g;
  g = 0;
  d = n >= 10000;
  while (n >= 10000000) {
    g++;
    n /= 1000;
  }
  f = Math.round(n);
  if (d) {
    f = add_commas(f.toString());
  }
  return f + (g ? a[g - 1] : '');
};

UpgradeState = (function() {
  function UpgradeState(item, n1) {
    this.item = item;
    this.n = n1;
    this.all = this.item.type.upgrades;
    this.active = this.all.slice(0, this.n);
    this.dom = new UpgradeDom(this);
  }

  UpgradeState.prototype.calc_o_factor = function() {
    var x;
    return product((function() {
      var l, len, ref, results;
      ref = this.active;
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        x = ref[l];
        results.push(x.o_factor);
      }
      return results;
    }).call(this));
  };

  UpgradeState.prototype.calc_i_factor = function() {
    var x;
    return product((function() {
      var l, len, ref, results;
      ref = this.active;
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        x = ref[l];
        results.push(x.i_factor);
      }
      return results;
    }).call(this));
  };

  UpgradeState.prototype.n_active = function() {
    return this.active.length;
  };

  UpgradeState.prototype.set = function(n1) {
    this.n = n1;
    return this.active = this.all.slice(0, this.n);
  };

  UpgradeState.prototype.buy = function() {
    var next;
    next = this.all[this.n];
    if (this.item.game.cupcakes < next.price) {
      return false;
    }
    this.item.game.cupcakes -= next.price;
    this.active.push(next);
    this.n++;
    return this.dom.update();
  };

  UpgradeState.prototype.update = function() {
    return this.dom.update();
  };

  return UpgradeState;

})();

UpgradeDom = (function() {
  function UpgradeDom(us) {
    var i, l;
    this.us = us;
    this.el = $('upgradetemplate').children[0].cloneNode(true);
    this.els = {
      name: this.el.getElementsByClassName('upgradename')[0],
      upgrades: []
    };
    for (i = l = 1; l <= 5; i = ++l) {
      this.els.upgrades[i - 1] = this.el.getElementsByClassName('upgrade' + i)[0];
    }
    this.visible = false;
    $('upgrades').appendChild(this.el);
    this.init();
  }

  UpgradeDom.prototype.init = function() {
    var fn, i, l, len, ref, u, udom, v;
    this.name = this.us.item.type.name;
    udom = this;
    this.el.addEventListener('mouseenter', (function(_this) {
      return function() {
        return _this.us.item.game.tooltip(_this.us.item.type.caption);
      };
    })(this));
    ref = this.els.upgrades;
    fn = (function(_this) {
      return function(u) {
        return v.addEventListener('mouseover', function() {
          var spans;
          _this.us.item.game.tooltip(u.caption(_this.us.item.type.name) + ("<br/>Cost: <span>" + (format_number(u.price)) + "</span><br/>Requires <span>" + u.req + "</span> " + _this.us.item.type.name));
          spans = $('caption').getElementsByTagName('span');
          if (!(indexOf.call(_this.us.active, u) >= 0)) {
            spans[0].style.color = u.price <= _this.us.item.game.cupcakes ? 'green' : 'red';
            spans[1].style.color = u.req <= _this.us.item.n_items ? 'green' : 'red';
          }
        });
      };
    })(this);
    for (i = l = 0, len = ref.length; l < len; i = ++l) {
      v = ref[i];
      v.addEventListener('click', function() {
        if ((!this.classList.contains('disabled')) && (!this.classList.contains('checked'))) {
          return udom.us.buy();
        }
      });
      u = this.us.all[i];
      fn(u);
    }
    return this.update();
  };

  UpgradeDom.prototype.update = function() {
    var act, all, i, l, len, ref, v;
    if (this.us.item.n_items === 0) {
      this.el.style.display = "none";
      return;
    } else {
      this.el.style.display = "";
    }
    ref = this.els.upgrades;
    for (i = l = 0, len = ref.length; l < len; i = ++l) {
      v = ref[i];
      act = this.us.active[i];
      all = this.us.all[i];
      if (act) {
        v.style.display = "";
        v.classList.add('checked');
        v.classList.remove('disabled');
      } else if (this.us.active[i - 1] || i === 0) {
        v.style.display = "";
        if (all.price <= this.us.item.game.cupcakes && all.req <= this.us.item.n_items) {
          v.classList.remove('checked');
          v.classList.remove('disabled');
        } else {
          v.classList.remove('checked');
          v.classList.add('disabled');
        }
      } else {
        v.style.display = "none";
      }
    }
  };

  UpgradeDom.property('visible', {
    get: function() {
      return this._visible;
    },
    set: function(val) {
      this._visible = val;
      this.el.style.display = val ? "" : "none";
    }
  });

  UpgradeDom.property('name', {
    get: function() {
      return this.els.name.textContent;
    },
    set: function(val) {
      return this.els.name.textContent = val;
    }
  });

  return UpgradeDom;

})();

ItemDom = (function() {
  function ItemDom(item) {
    this.item = item;
    this.el = $('storetemplate').children[0].cloneNode(true);
    this.els = {
      img: this.el.getElementsByTagName('img')[0],
      name: this.el.getElementsByClassName('storename')[0],
      number: this.el.getElementsByClassName('storenumber')[0],
      button: this.el.getElementsByTagName('button')[0],
      progress: this.el.getElementsByTagName('progress')[0]
    };
    this._number = 0;
    this.visible = false;
    $('inventory').appendChild(this.el);
    this.int = Infinity;
    this.init();
  }

  ItemDom.prototype.init = function() {
    this.img = "images/items/" + this.item.type.img;
    this.name = this.item.type.name;
    this.els.button.addEventListener('click', (function(_this) {
      return function() {
        return _this.item.buy();
      };
    })(this));
    this.el.addEventListener('mouseover', (function(_this) {
      return function() {
        return _this.item.game.tooltip(_this.item.type.caption);
      };
    })(this));
    return this.update();
  };

  ItemDom.prototype.update = function() {
    var o;
    this.button_text = "Buy\xa0\xa0\xa0\xa0\xa0\xa0\xa0" + (format_number(this.item.calc_price()));
    this.number = this.item.n_items;
    this.int = this.item.calc_interval();
    if (this.int !== Infinity && this.number) {
      this.els.progress.max = this.int;
      this.els.progress.style.display = "";
    } else {
      this.els.progress.style.display = "none";
    }
    o = format_number(this.item.calc_output());
    return this.els.progress.setAttribute('data-text', o.length < 10 ? o + " cupcakes" : o);
  };

  ItemDom.prototype.update_buyable = function() {
    return this.els.button.disabled = this.item.calc_price() > this.item.game.cupcakes;
  };

  ItemDom.prototype.animate = function(elapsed) {
    if (this.int !== Infinity) {
      return this.progress = (this.progress + elapsed) % this.int;
    }
  };

  ItemDom.prototype.a_reset = function() {
    return this.progress = 0;
  };

  ItemDom.property('visible', {
    get: function() {
      return this._visible;
    },
    set: function(val) {
      this._visible = val;
      this.el.style.display = val ? "" : "none";
    }
  });

  ItemDom.property('name', {
    get: function() {
      return this.els.name.textContent;
    },
    set: function(val) {
      return this.els.name.textContent = val;
    }
  });

  ItemDom.property('img', {
    get: function() {
      return this.els.img.src;
    },
    set: function(val) {
      return this.els.img.src = val;
    }
  });

  ItemDom.property('progress', {
    get: function() {
      return this.els.progress.value;
    },
    set: function(val) {
      return this.els.progress.value = val;
    }
  });

  ItemDom.property('number', {
    get: function() {
      return this._number;
    },
    set: function(val) {
      this._number = val;
      return this.els.number.textContent = val;
    }
  });

  ItemDom.property('button_text', {
    get: function() {
      return this.els.button.textContent;
    },
    set: function(val) {
      return this.els.button.textContent = val;
    }
  });

  return ItemDom;

})();

ItemState = (function() {
  function ItemState(game1, type) {
    this.game = game1;
    this.type = items[type];
    if (this.type.interval === null) {
      this.update = function() {
        return 0;
      };
    }
    this.n_items = 0;
    this.upgrades = new UpgradeState(this, 0);
    this.ms_left = Infinity;
    this.dom = new ItemDom(this);
  }

  ItemState.prototype.load = function(save) {
    this.upgrades.set(save.u);
    this.n_items = save.n;
    this.ms_left = this.calc_interval();
    this.dom.update();
    return this.dom.a_reset();
  };

  ItemState.prototype.save = function() {
    if (this.n_items) {
      return {
        n: this.n_items,
        u: this.upgrades.n_active()
      };
    }
  };

  ItemState.prototype.calc_price = function() {
    var extra, pm, pmg;
    pm = this.type.price_mult;
    if (this.n_items < 10) {
      pm *= 1;
    } else if (this.n_items < 50) {
      pm *= 1.2;
    } else if (this.n_items < 100) {
      pm *= 1.4;
    } else if (this.n_items < 500) {
      pm *= 1.6;
    } else if (this.n_items < 1000) {
      pm *= 3.3;
    } else if (this.n_items < 6000) {
      pm *= 6.5;
    }
    pmg = this.type.margin_price;
    if (this.n_items > 400) {
      if (pmg === 1) {
        pmg = 50;
      }
      if (pmg === 5) {
        pmg = 75;
      }
    } else if (this.n_items > 500) {
      0;
    }
    extra = pmg * this.n_items * pm;
    return this.type.base_price + extra;
  };

  ItemState.prototype.calc_output = function() {
    return this.n_items * this.type.output * this.upgrades.calc_o_factor();
  };

  ItemState.prototype.calc_interval = function() {
    if (this.type.interval === null) {
      return Infinity;
    }
    return this.type.interval * this.upgrades.calc_i_factor() * 1000;
  };

  ItemState.prototype.buy = function(n) {
    if (n == null) {
      n = 1;
    }
    if (this.game.cupcakes < this.calc_price() * n) {
      return false;
    }
    this.game.cupcakes -= this.calc_price() * n;
    if (this.n_items === 0) {
      this.first_update = true;
      this.upgrades.dom.update();
    }
    if (this.type.idx + 1 < order.length) {
      this.game.items[order[this.type.idx + 1]].dom.visible = true;
    }
    this.n_items += n;
    this.game.interrupt_tick();
    this.dom.update();
    this.upgrades.update();
    return true;
  };

  ItemState.prototype.update = function(elapsed) {
    if (this.n_items === 0) {
      return 0;
    }
    if (this.first_update) {
      this.ms_left = 0;
      this.first_update = false;
    } else {
      this.ms_left -= elapsed;
    }
    if (this.ms_left <= 0) {
      this.dom.a_reset();
      this.ms_left += this.calc_interval();
      return this.calc_output();
    }
    return 0;
  };

  ItemState.prototype.animate = function(elapsed) {
    if (this.n_items > 0) {
      return this.dom.animate(elapsed);
    }
  };

  return ItemState;

})();

Game = (function() {
  function Game() {
    var scope;
    this.items = {};
    this.cc = $('cimage');
    this.cn = $('cupcake_number');
    this.cupcakes = 0;
    this.cc.addEventListener('click', this.click.bind(this));
    this.last_tick = void 0;
    this.last_interval = void 0;
    this.picker = $('savepicker');
    scope = this;
    this.picker.addEventListener('change', function() {
      var blob, fileReader;
      if (scope.picker.files[0] != null) {
        blob = scope.picker.files[0];
        fileReader = new FileReader();
        fileReader.addEventListener('load', function() {
          var buf, u8a;
          scope.picker.value = '';
          buf = this.result;
          u8a = new Uint8Array(buf);
          scope.load(convert_save(decodeLSO(u8a)));
          return console.log('Loaded ccSave.sol');
        });
        return fileReader.readAsArrayBuffer(blob);
      }
    });
    this.animate(null);
    this.load({
      c: 0,
      i: {}
    });
  }

  Game.prototype.animate = function(prev) {
    var _, elapsed, n, ref, v;
    n = window.performance.now();
    if (prev !== null) {
      elapsed = n - prev;
      ref = this.items;
      for (_ in ref) {
        v = ref[_];
        v.animate(elapsed);
      }
    }
    return requestAnimationFrame((function(_this) {
      return function() {
        return _this.animate(n);
      };
    })(this));
  };

  Game.prototype.click = function() {
    return this.cupcakes += this.items.helpers.calc_output() + 1;
  };

  Game.prototype.tick = function(elapsed) {
    var _, i, x;
    x = (function() {
      var ref, results;
      ref = this.items;
      results = [];
      for (_ in ref) {
        i = ref[_];
        this.cupcakes += i.update(elapsed);
        results.push(i.ms_left);
      }
      return results;
    }).call(this);
    return Math.min.apply(Math, x);
  };

  Game.prototype.loop = function(elapsed) {
    var t;
    t = this.tick(elapsed);
    this.last_tick = window.performance.now();
    if (t !== Infinity) {
      return this.last_interval = setTimeout(((function(_this) {
        return function() {
          return _this.loop(t);
        };
      })(this)), t);
    }
  };

  Game.prototype.interrupt_tick = function() {
    clearTimeout(this.last_interval);
    return this.loop(window.performance.now() - this.last_tick);
  };

  Game.prototype.update_upgrades = function() {
    var _, i, ref, results;
    ref = this.items;
    results = [];
    for (_ in ref) {
      i = ref[_];
      results.push(i.upgrades.update());
    }
    return results;
  };

  Game.prototype.update_buyable = function() {
    var _, i, ref, results;
    ref = this.items;
    results = [];
    for (_ in ref) {
      i = ref[_];
      results.push(i.dom.update_buyable());
    }
    return results;
  };

  Game.prototype.tooltip = function(s) {
    return $('tooltip').innerHTML = s;
  };

  Game.property('cupcakes', {
    get: function() {
      return this._cupcakes;
    },
    set: function(val) {
      this._cupcakes = val;
      if (this.active_tab === 'upgrades') {
        this.update_upgrades();
      }
      if (this.active_tab === 'inventory') {
        this.update_buyable();
      }
      return this.cn.textContent = (format_number(this._cupcakes)) + " Cupcakes";
    }
  });

  Game.prototype.load = function(save) {
    var i, l, len, t, v;
    clearTimeout(this.last_interval);
    this.cupcakes = save.c;
    t = true;
    for (i = l = 0, len = order.length; l < len; i = ++l) {
      v = order[i];
      if (this.items[v] == null) {
        this.items[v] = new ItemState(this, v);
      }
      this.items[v].load(save.i[i] ? save.i[i] : {
        n: 0,
        u: 0
      });
      this.items[v].dom.visible = t;
      t = !!this.items[v].n_items;
    }
    this.loop(0);
  };

  Game.prototype.save = function() {
    var k, o, ref, t, v;
    o = {
      c: this.cupcakes,
      i: {}
    };
    ref = this.items;
    for (k in ref) {
      v = ref[k];
      t = v.save();
      if (t) {
        o.i[v.type.idx] = t;
      }
    }
    return o;
  };

  Game.prototype.browser_save = function() {
    return localStorage.setItem('ccSave', JSON.stringify(this.save()));
  };

  Game.prototype.browser_load = function() {
    if (!localStorage.getItem('ccSave')) {
      return false;
    }
    game.load(JSON.parse(localStorage.getItem('ccSave')));
    return true;
  };

  Game.prototype.prompt_load = function() {
    return $('savepicker').click();
  };

  return Game;

})();

document.addEventListener('DOMContentLoaded', function() {
  var ch, fn, i, l, len, q, toggles, x;
  window.game = new Game();
  game.active_tab = 'inventory';
  game.browser_load();
  ch = $('tabs').children;
  toggles = (function() {
    var l, len, results;
    results = [];
    for (l = 0, len = ch.length; l < len; l++) {
      x = ch[l];
      results.push($(x.getAttribute('data-toggle')));
    }
    return results;
  })();
  fn = function(q, i) {
    return i.addEventListener('click', function() {
      var j, len1, len2, m, p;
      game.active_tab = q.id;
      if (q.id === 'upgrades') {
        game.update_upgrades();
      }
      if (q.id === 'iventory') {
        game.update_buyable();
      }
      for (m = 0, len1 = toggles.length; m < len1; m++) {
        j = toggles[m];
        if (j !== q) {
          j.style.display = "none";
        }
      }
      q.style.display = "";
      for (p = 0, len2 = ch.length; p < len2; p++) {
        j = ch[p];
        if (j !== i) {
          j.classList.remove('active');
        }
      }
      return i.classList.add('active');
    });
  };
  for (l = 0, len = ch.length; l < len; l++) {
    i = ch[l];
    q = $(i.getAttribute('data-toggle'));
    fn(q, i);
    continue;
  }
  window.addEventListener('beforeunload', function() {
    return game.browser_save();
  });
  setInterval((function() {
    return game.browser_save();
  }), 30000);
});
