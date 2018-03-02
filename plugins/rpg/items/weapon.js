const Item = require( './item.js');
const DamageSrc = require( '../damage.js').DamageSrc;

module.exports = class Weapon extends Item.Item {

	toJSON() {

		let json = super.toJSON();
		json.material = this._material;
		json.dmg = this.damage;

		return json;

	}

	static FromJSON( json ) {

		let w = new Weapon();

		if ( json.dmg ) {
			w.damage = DamageSrc.FromJSON( json.dmg );
			delete json.dmg;
		} else w.damage = new DamageSrc();

		return Object.assign( w, json );

	}

	/**
	 * Create a new weapon from a base weapon object.
	 * @param {Object} tmp 
	 * @param {Material} mat 
	 */
	static FromData( tmp, mat ) {

		if ( tmp == null ) return null;

		let name = mat.name + ' ' + tmp.name;
		let w = new Weapon( name );

		w.mat = mat.name;
		w.cost = mat.priceMod ? tmp.cost*mat.priceMod : tmp.cost;

		if ( tmp.hands ) w.hands = tmp.hands;

		w.damage = DamageSrc.FromString( tmp.dmg );
		w.damage.type = tmp.type;

		if ( mat.bonus ) w.damage.bonus += mat.bonus;

		return w;

	}

	set material(m) { this._material = m;}
	get material() { return this._material; }

	get bonus() { return this.damage.bonus; }
	set bonus( v ) { if ( v < 0 )v = 0; this.damage.bonus = v;}

	constructor( name, desc ) {

		super( name, desc, 'weapon' );

	}

	getDetails() {
		return this._name + '\t base damage: ' + this.damage + '\t price: ' + this.cost + '\n' + super.getDetails();
	}

	/**
	 * roll weapon damage.
	*/
	roll() { return this.damage.roll(); }


}