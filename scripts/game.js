// Generated by CoffeeScript 2.3.1
(function() {
  var $, $$, Game, ItemDom, ItemState, Obfuscator, UpgradeDom, UpgradeState, add_commas, format_number, g_shift, ob_v1, product, sum, u_mod,
    indexOf = [].indexOf;

  $ = document.getElementById.bind(document);

  $$ = document.querySelector.bind(document);

  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

  // this is pointless. I have no idea why I made it so complicated.
  u_mod = function(a, b) {
    return a - Math.floor(a / b) * b;
  };

  Obfuscator = class Obfuscator {
    constructor(a1, b1) {
      var i, l, ref;
      this.a = a1;
      this.b = b1;
      this.f = {};
      this.r = {};
      for (i = l = 0, ref = this.a.length; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
        this.f[this.a[i]] = i;
        this.r[this.b[i]] = i;
      }
    }

    obf(s) {
      var i, r, x;
      r = (Math.random() * this.b.length) | 0;
      return this.b[r] + ((function() {
        var l, len, ref, results;
        ref = s.split("");
        results = [];
        for (i = l = 0, len = ref.length; l < len; i = ++l) {
          x = ref[i];
          results.push(this.b[u_mod(this.f[x] + i + r, this.b.length)]);
        }
        return results;
      }).call(this)).join("");
    }

    deobf(s) {
      var i, r, x;
      r = this.r[s[0]];
      return ((function() {
        var l, len, ref, results;
        ref = s.substr(1).split("");
        results = [];
        for (i = l = 0, len = ref.length; l < len; i = ++l) {
          x = ref[i];
          results.push(this.a[u_mod(this.r[x] - i - r, this.a.length)]);
        }
        return results;
      }).call(this)).join("");
    }

  };

  ob_v1 = new Obfuscator('ci"4.n293{10u:65,}87z', 'dnjgpkmhbstfrwlqcyxvz');

  // 0.123456789{}:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()`~-=_+[];',./<>?
  // but was that comment about the obfuscation or the game as a whole
  g_shift = false;

  product = function(list) {
    var el, l, len, o;
    o = 1;
    for (l = 0, len = list.length; l < len; l++) {
      el = list[l];
      o *= el;
    }
    return o;
  };

  sum = function(list) {
    var el, l, len, o;
    o = 0;
    for (l = 0, len = list.length; l < len; l++) {
      el = list[l];
      o += el;
    }
    return o;
  };

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
    var a, d, f, g;
    a = ['K', 'M', 'B', 'T', 'QD', 'QN', 'SX'];
    g = 0;
    d = n >= 10000;
    while (n >= 10000000 && (a[g] != null)) {
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
    class UpgradeState {
      constructor(item, n1) {
        this.item = item;
        this.n = n1;
        this.all = this.item.type.upgrades;
        this.active = this.all.slice(0, this.n);
        this.dom = new UpgradeDom(this);
      }

      calc_o_factor() {
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
      }

      calc_i_factor() {
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
      }

      n_active() {
        return this.active.length;
      }

      set(n1) {
        this.n = n1;
        return this.active = this.all.slice(0, this.n);
      }

      buy() {
        var next;
        next = this.all[this.n];
        if (this.item.game.cupcakes < next.price) {
          return false;
        }
        this.item.game.cupcakes -= next.price;
        this.active.push(next);
        this.n++;
        this.update();
        return this.item.dom.update();
      }

      update() {
        return this.dom.update();
      }

    };

    UpgradeState.prototype._proxy = {
      blacklist: true,
      accessible: {
        set: 1
      }
    };

    return UpgradeState;

  }).call(this);

  UpgradeDom = (function() {
    class UpgradeDom {
      constructor(us) {
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

      init() {
        var i, l, len, ref, u, udom, v;
        this.name = this.us.item.type.name;
        udom = this;
        this.el.addEventListener('mouseenter', () => {
          return this.us.item.game.tooltip(this.us.item.type.caption);
        });
        ref = this.els.upgrades;
        for (i = l = 0, len = ref.length; l < len; i = ++l) {
          v = ref[i];
          v.addEventListener('click', function() {
            if ((!this.classList.contains('disabled')) && (!this.classList.contains('checked'))) {
              return udom.us.buy();
            }
          });
          u = this.us.all[i];
          ((u) => {
            return v.addEventListener('mouseover', () => {
              var spans;
              this.us.item.game.tooltip(u.caption(this.us.item.type.name) + `<br/>Cost: <span>${format_number(u.price)}</span><br/>Requires <span>${u.req}</span> ${this.us.item.type.name}`);
              spans = $('caption').getElementsByTagName('span');
              if (!(indexOf.call(this.us.active, u) >= 0)) {
                spans[0].style.color = u.price <= this.us.item.game.cupcakes ? 'green' : 'red';
                spans[1].style.color = u.req <= this.us.item.n_items ? 'green' : 'red';
              }
            });
          })(u);
        }
        return this.update();
      }

      update() {
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
      }

    };

    UpgradeDom.prototype._proxy = {
      blacklist: true,
      accessible: {
        init: 1,
        update: 1
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

  }).call(this);

  ItemDom = (function() {
    class ItemDom {
      constructor(item) {
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
        this.int = 2e308;
        this.init();
      }

      init() {
        this.img = `images/items/${this.item.type.img}`;
        this.name = this.item.type.name;
        this.els.button.addEventListener('click', () => {
          return this.item.buy(g_shift ? 10 : 1);
        });
        this.el.addEventListener('mouseover', () => {
          return this.item.game.tooltip(this.item.type.caption);
        });
        return this.update();
      }

      update() {
        var o;
        this.button_text = `Buy${(g_shift ? " 10" : "\xa0\xa0\xa0")}\xa0\xa0\xa0\xa0${format_number(this.item.calc_price_s())}`;
        this.number = this.item.n_items;
        this.int = this.item.calc_interval();
        if (this.int !== 2e308 && this.number) {
          this.els.progress.max = this.int;
          this.els.progress.style.display = "";
        } else {
          this.els.progress.style.display = "none";
        }
        o = format_number(this.item.calc_output());
        this.els.progress.setAttribute('data-text', o.length < 10 ? o + " cupcakes" : o);
        return this.update_buyable();
      }

      update_buyable() {
        return this.els.button.disabled = this.item.calc_price_s() > this.item.game.cupcakes;
      }

      animate(elapsed) {
        if (this.int !== 2e308) {
          return this.progress = (this.progress + elapsed) % this.int;
        }
      }

      a_reset() {
        //if @int != Infinity then @progress -= @int
        return this.progress = 0;
      }

    };

    ItemDom.prototype._proxy = {
      blacklist: true,
      accessible: {
        init: 1,
        update: 1,
        update_buyable: 1,
        animate: 1
      }
    };

    ItemDom.property('visible', {
      get: function() {
        return this._visible;
      },
      set: function(val) {
        this._visible = val;
        this.el.style.display = val ? "" : "none";
        this.item.game.items._proxy.accessible[this.item.name] = val;
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
        return this.els.progress.value = Math.round(val);
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

  }).call(this);

  ItemState = (function() {
    class ItemState {
      constructor(game1, name) {
        this.game = game1;
        this.name = name;
        this.type = items[this.name];
        if (this.type.interval === null) {
          this.update = function() {
            return 0;
          };
        }
        this.n_items = 0;
        this.upgrades = new UpgradeState(this, 0);
        this.ms_left = 2e308;
        this.dom = new ItemDom(this);
      }

      load(save) {
        this.upgrades.set(save.u);
        this.n_items = save.n;
        this.ms_left = this.calc_interval();
        this.dom.update();
        return this.dom.a_reset();
      }

      save() {
        if (this.n_items) {
          return {
            n: this.n_items,
            u: this.upgrades.n_active()
          };
        }
      }

      calc_price(n = this.n_items) {
        var extra, pm, pmg;
        pm = this.type.price_mult;
        if (n < 10) {
          pm *= 1;
        } else if (n < 50) {
          pm *= 1.2;
        } else if (n < 100) {
          pm *= 1.4;
        } else if (n < 500) {
          pm *= 1.6;
        } else if (n < 1000) {
          pm *= 3.3;
        } else if (n < 6000) {
          pm *= 6.5;
        } else {
          pm *= 10;
        }
        pmg = this.type.margin_price;
        if (n > 400) {
          if (pmg === 1) {
            pmg = 50;
          }
          if (pmg === 5) {
            pmg = 75;
          }
        } else if (n > 500) { // wtf
          0;
        }
        extra = pmg * n * pm;
        return this.type.base_price + extra;
      }

      calc_output() {
        return this.n_items * this.type.output * this.upgrades.calc_o_factor();
      }

      calc_interval() {
        if (this.type.interval === null) {
          return 2e308;
        }
        return this.type.interval * this.upgrades.calc_i_factor() * 1000;
      }

      calc_price_n(n) {
        var i;
        return sum((function() {
          var l, ref, results;
          results = [];
          for (i = l = 0, ref = n; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
            results.push(this.calc_price(i + this.n_items));
          }
          return results;
        }).call(this)) * (n < 0 ? -0.5 : 1);
      }

      calc_price_s() {
        if (g_shift) {
          return this.calc_price_n(10);
        } else {
          return this.calc_price();
        }
      }

      buy(n = 1) {
        var pr;
        pr = this.calc_price_n(n);
        if (this.game.cupcakes < pr) {
          return false;
        }
        this.game.cupcakes -= pr;
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
      }

      update(elapsed) {
        //console.log(@type.name, @ms_left)
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
          //console.log("#{@type.name} output")
          this.dom.a_reset();
          this.ms_left += this.calc_interval();
          return this.calc_output();
        }
        return 0;
      }

      animate(elapsed) {
        if (this.n_items > 0) {
          return this.dom.animate(elapsed);
        }
      }

    };

    ItemState.prototype._proxy = {
      blacklist: true,
      accessible: {
        animate: 1,
        load: 1,
        save: 1,
        update: 1,
        dom: 1,
        ms_left: 1
      }
    };

    return ItemState;

  }).call(this);

  Game = (function() {
    class Game {
      constructor() {
        var scope;
        this.pr = proxy_object(this);
        //@_proxy = deep_merge({}, @_proxy)
        this._items = {
          _proxy: {
            accessible: {}
          }
        };
        this.items = hide_pr(this._items);
        this.dev = false;
        this.cc = $('cimage');
        this.ce = $('cupcake');
        this.cn = $('cupcake_number');
        this.cupcakes = 0;
        this.cc.addEventListener('click', (event) => {
          event.stopPropagation();
          return this.click();
        });
        this.ce.addEventListener('click', () => {
          if (document.querySelector('#cimage:hover')) {
            return this.click();
          }
        });
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
        document.addEventListener('keydown', (ev) => {
          if (ev.key === 'Shift') {
            g_shift = true;
            return this.update_doms();
          }
        });
        document.addEventListener('keyup', (ev) => {
          if (ev.key === 'Shift') {
            g_shift = false;
            return this.update_doms();
          }
        });
        $$('#importcc button').addEventListener('click', () => {
          if (prompt('Browse to the following location', '%APPDATA%\\BrawlhallaAir\\Local Store\\#SharedObjects\\ccSave.sol')) {
            this.prompt_load();
          }
          return this.close_settings();
        });
        $$('#import button').addEventListener('click', () => {
          var pr;
          pr = prompt('Paste save here');
          if (pr != null) {
            this.load(pr);
          }
          return this.close_settings();
        });
        $$('#export button').addEventListener('click', () => {
          prompt('Save this somewhere safe', this.save());
          return this.close_settings();
        });
        $$('#reset button').addEventListener('click', () => {
          if (confirm('Are you sure you want to wipe your save?')) {
            this.reset();
          }
          return this.close_settings();
        });
        $('settingsclose').addEventListener('click', () => {
          return this.close_settings();
        });
        $('opensettings').addEventListener('click', () => {
          return $('settings').style.display = '';
        });
        this.animate(null);
        this.reset();
      }

      update_doms() {
        var i, k, ref;
        ref = this.items;
        for (k in ref) {
          i = ref[k];
          i.dom.update();
        }
      }

      close_settings() {
        return $('settings').style.display = 'none';
      }

      reset() {
        return this._load({
          c: 0,
          i: {}
        });
      }

      animate(prev) {
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
        return requestAnimationFrame(() => {
          return this.animate(n);
        });
      }

      click() {
        return this.cupcakes += this.items.helpers.calc_output() + 1;
      }

      //@interrupt_tick()
      tick(elapsed) {
        var _, i, x;
        //console.log("Tick " + elapsed)
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
        
        //console.log x
        return Math.min(...x);
      }

      loop(elapsed) {
        var t;
        t = this.tick(elapsed);
        //console.log(t)
        this.last_tick = window.performance.now();
        if (t !== 2e308) {
          return this.last_interval = setTimeout((() => {
            return this.loop(t);
          }), t);
        }
      }

      interrupt_tick() {
        clearTimeout(this.last_interval);
        return this.loop(window.performance.now() - this.last_tick);
      }

      update_upgrades() {
        var _, i, ref;
        ref = this.items;
        for (_ in ref) {
          i = ref[_];
          i.upgrades.update();
        }
      }

      update_buyable() {
        var _, i, ref;
        ref = this.items;
        for (_ in ref) {
          i = ref[_];
          i.dom.update_buyable();
        }
      }

      tooltip(s) {
        $('tooltip').innerHTML = s;
        return this.fix_tooltip();
      }

      fix_tooltip() {
        var x;
        x = $('tooltip');
        return x.style.marginLeft = x.clientHeight * 275 / 318 + "px";
      }

      _load(save) {
        var i, l, len, ref, t, v;
        clearTimeout(this.last_interval);
        if (save[''] === 123) {
          this.dev = true;
          window.game = this;
        }
        this.cupcakes = save.c;
        t = true;
        for (i = l = 0, len = order.length; l < len; i = ++l) {
          v = order[i];
          if (this.items[v] == null) {
            this.items[v] = new ItemState(this, v);
          }
          this.items[v].load((ref = save.i[i]) != null ? ref : {
            n: 0,
            u: 0
          });
          this.items[v].dom.visible = t;
          t = !!this.items[v].n_items;
        }
        this.loop(0);
      }

      _save() {
        var k, o, ref, t, v;
        o = {
          c: this.cupcakes,
          i: {}
        };
        if (this.dev) {
          o[''] = 123;
        }
        ref = this.items;
        for (k in ref) {
          v = ref[k];
          t = v.save();
          if (t) {
            o.i[v.type.idx] = t;
          }
        }
        return o;
      }

      load(save) {
        return this._load(JSON.parse(ob_v1.deobf(save)));
      }

      save() {
        return ob_v1.obf(JSON.stringify(this._save()));
      }

      browser_save() {
        return localStorage.setItem('ccSave', this.save());
      }

      browser_load() {
        var ss;
        if (typeof localStorage === "undefined" || localStorage === null) {
          return false;
        }
        ss = localStorage.getItem('ccSave');
        if (!ss) {
          return false;
        }
        if (ss.startsWith('{')) {
          this._load(JSON.parse(ss));
        } else {
          this.load(localStorage.getItem('ccSave'));
        }
        return true;
      }

      prompt_load() {
        return $('savepicker').click();
      }

    };

    Game.prototype._proxy = {
      blacklist: true,
      accessible: {
        cc: 1,
        ce: 1,
        cn: 1,
        last_interval: 1,
        last_tick: 1,
        picker: 1,
        update_doms: 1,
        close_settings: 1,
        animate: 1,
        click: 1,
        tick: 1,
        loop: 1,
        interrupt_tick: 1,
        update_upgrades: 1,
        update_buyable: 1,
        tooltip: 1,
        fix_tooltip: 1,
        _load: 1,
        _save: 1,
        active_tab: 1,
        browser_load: 1,
        dev: 1,
        ipr: 1,
        _items: 1
      }
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
        return this.cn.textContent = `${format_number(this._cupcakes)} Cupcakes`;
      }
    });

    return Game;

  }).call(this);

  document.addEventListener('DOMContentLoaded', function() {
    var ch, game, i, l, len, q, toggles, x;
    game = new Game();
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
    for (l = 0, len = ch.length; l < len; l++) {
      i = ch[l];
      q = $(i.getAttribute('data-toggle'));
      (function(q, i) {
        return i.addEventListener('click', function() {
          var j, len1, len2, m, p;
          game.active_tab = q.id;
          if (q.id === 'upgrades') {
            game.update_upgrades();
          }
          if (q.id === 'inventory') {
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
      })(q, i);
    }
    window.addEventListener('beforeunload', function() {
      return game.browser_save();
    });
    window.addEventListener('resize', function() {
      return game.fix_tooltip();
    });
    setInterval((function() {
      return game.browser_save();
    }), 30000);
    window.addEventListener('load', function() {
      return game.fix_tooltip();
    });
    if (!window.game) {
      window.game = game.pr;
    }
  });

}).call(this);
