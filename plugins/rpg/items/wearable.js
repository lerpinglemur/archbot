const Item = require( './item.js');

module.exports = class Wearable extends Item.Item {

	/**
	 * @property {number} armor - armor added. replace with defense?
	 */
	get armor() {return this._armor; }
	set armor(v) { if ( v < 0 ) v = 0; this._armor = v; }

	/**
	 * @property {string} slot - equip slot used.
	 */
	get slot() { return this._slot; }
	set slot(v) { this._slot = v; }

	/**
	 * @property {string} material - armor material.
	 */
	get material() { return this._material; }
	set material(m) { this._material = m; }

	get mods() { return this._mods; }
	set mods(v) { this._mods = v;}

	/**
	 * From template data.
	 * @param {*} base
	 * @param {*} material
	 */
	static FromData( base, material ) {

		let name = material.name + ' ' + base.name;
		let armor = new Wearable( name );

		armor.material = material.name;
		armor.cost = material.priceMod ? base.cost*material.priceMod : base.cost;

		armor.armor = material.bonus ? base.armor + material.bonus : base.armor;
		armor.slot = base.slot;

		if ( base.mods ) this.mods = Object.assign( {}, base.mods );

		return armor;
	}

	static FromJSON( json) {

		let a = new Wearable( json.name, json.desc );
		a.material = json.material;
		a.slot = json.slot;
		a.armor = json.armor;

		if ( json.mods ) this.mods = json.mods;

		return Item.Item.FromJSON( json, a );
	}

	toJSON() {

		let json = super.toJSON();

		json.armor = this._armor;
		json.slot = this._slot;
		json.material = this._material;
		if ( this._mods ) json.mods = this._mods;

		return json;

	}

	constructor( name, desc ) {

		super( name, desc, 'armor' );
		this._armor = 0;

	}

	getDetails() {
		return this._name + '\t armor: ' + this.armor + '\t price: ' + this.cost + '\n' + super.getDetails();
	}


}