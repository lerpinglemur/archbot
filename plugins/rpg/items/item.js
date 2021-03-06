exports.WEAPON = "weapon";
exports.ARMOR = "armor";
exports.POTION = "potion";
exports.FOOD = 'food';
exports.DRINK = 'drink';
exports.SCROLL = 'scroll';
exports.UNIQUE = 'unique';

var UNKNOWN = exports.UNKNOWN = "unknown";

exports.Item = class Item {

	/**
	 * @property {string} name
	 */
	get name() { return this._name; }
	set name(v) { this._name = v; }

	/**
	 * @property {string} type
	 */
	get type() { return this._type; }
	set type(v) { this._type = v;}

	get cost() { return this._cost; }
	set cost(v) { this._cost = v;}

	get desc() { return this._desc; }
	set desc( v) { this._desc = v; }

	/**
	 * @property {string} inscription
	 */
	get inscription() { return this._inscript; }
	set inscription(v) { this._inscript = v; }

	get level() { return this._level; }
	set level( v ) { this._level = v;}

	get attach() { return this._attach; }
	set attach(v) { this._attach = v;}

	/**
	 * @returns {string} discord id of crafter.
	 */
	get crafter() { return this._crafter; }
	set crafter(s) { this._crafter = s; }

	/**
	 * @property {number} time - creation timestamp.
	 */
	get time() { return this._time; }
	set time(t) { this._time = t;}

	/**
	 * Since Item is subclassed, the sub item created
	 * is passed as a param.
	 * @param {Object} json
	 * @param {Item} it
	 */
	static FromJSON( json, it=null ) {

		if ( !it) it = new Item( json.name, json.desc, json.type );
		else {
			it.name = json.name;
		}

		if ( json.cost) it._cost = json.cost;
		if ( json.attach ) it._attach = json.attach;
		if ( json.maker ) this._crafter = json.maker;
		if ( json.inscrip ) this._inscript = json.inscript;
		if ( !isNaN(json.level) ) it._level = json.level;

		return it;

	}

	toJSON() {

		let json = {
			name:this._name,
			desc:this._desc,
			type:this._type,
			cost:this._cost
		}

		if ( this._level ) json.level = this._level;
		if ( this._attach ) json.attach = this._attach;
		if ( this._crafter ) json.maker = this._crafter;
		if ( this._inscript ) json.inscrip = this._inscript;

		return json;

	}

	constructor( name, desc, type ) {

		this._name = name;
		this._type = type || UNKNOWN;
		this._desc = desc || '';

	}

	getView() {
		return [ this.getDetails(false), this._attach ];
	}

	/**
	 * @returns {string} detailed string description of item.
	*/
	getDetails( imgTag=true ) {

		let s = this._name;
		if ( this._desc ) s += ': ' + this._desc;
		if ( this._inscript ) s += ' { ' + this._inscript + ' }';
		if ( this._attach && imgTag ) s += ' [img]';
		if ( this._crafter ) s += '\ncreated by ' + this._crafter;

		return s;
	}

	static ItemMenu( a, start=1) {

		let len = a.length;
		if ( len === 0 ) return 'nothing';
		else if ( len === 1 ) return (start) + ') ' + a[0]._name + ( a[0].attach ? '\t[img]' : '');

		let it = a[0];
		let res = (start++) + ') ' + it._name;
		if ( it.attach ) res += '\t[img]';

		for( let i = 1; i < len; i++ ) {

			it = a[i];
			res += '\n' + (start++) + ') ' + it._name;
			if ( it.attach ) res += '\t[img]';
		}

		return res;

	}

	/**
	 *
	 * @param {Item[]} a
	 */
	static DetailsList( a ) {

		console.log('DETAILS LIST');

		let len = a.length;
		if ( len === 0 ) return 'nothing';
		else if ( len === 1 ) return a[0].getDetails();

		let it = a[0];
		let res = it.getDetails();

		for( let i = 1; i < len; i++ ) {
			it = a[i];
			res += ', ' + it.getDetails();
		}

		return res;

	}

	/**
	 *
	 * @param {Item[]} a
	 */
	static ItemList( a ) {

		let len = a.length;
		if ( len === 0 ) return 'nothing';
		else if ( len === 1 ) return a[0]._name + ( a[0].attach ? '\t[img]' : '' );

		let it = a[0];
		let res = it._name;
		if ( it.attach ) res += ' [img]';

		for( let i = 1; i < len; i++ ) {
			it = a[i];
			res += ', ' + it._name;
			if ( it.attach ) res += ' [img]';

		}

		return res;

	}

	static Cook( it ) {

		let cooking = require( '../data/cooking.json' );
		let adjs = cooking.adjectives;

		let adj = adjs[ Math.floor( adjs.length*Math.random() )];

		if ( it.type === exports.ARMOR ) {
			it.armor -= 10;
		} else if ( it.type === exports.WEAPON ) {
			it.bonus -= 10;
		}
		it.type = exports.FOOD;

		it.name = adj + ' ' + it.name;

		let desc = cooking.descs[ Math.floor( cooking.descs.length*Math.random())];
		it.desc += ' ' + desc;

	}

}

exports.Craft = function( char, name, desc, attach ) {

	let item = new exports.Item( name, desc );

	if ( attach) item._attach = attach;

	item.crafter = char.name;
	item.time = Date.now();

	let maxBonus = char.level + char.getModifier('int') + 1;
	if ( maxBonus < 2 ) maxBonus = 2;
	item.cost = Math.floor( maxBonus * Math.random() );

	char.addHistory( 'crafted');
	char.addExp( 2 );
	return char.addItem( item );

}