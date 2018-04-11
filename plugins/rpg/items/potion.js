const itemjs = require( './item.js');
const forms = require( '../formulas.js');

exports.Potion = class Potion extends itemjs.Item  {

	static FromJSON( json ) {

		let p = new Potion();

		if ( json.effect ) {

			if ( typeof(json.effect )=== 'string') {
				p.effect = forms.Formula.TryParse( json.effect);
			} else console.log('ERR: formula could not parse: ' + json.effect );

		}

		itemjs.Item.FromJSON( json, p );

		return p;

	}

	/**
	 * @param {object} tmp - potion template. 
	 */
	static FromData( tmp ) {
	}

	toJSON() {

		let s = super.toJSON();

		if ( this._spell ) s.spell = this._spell;
		if ( this._effect ) s.effect = this._effect;

		return s;

	}

	get effect() { return this._effect; }
	set effect(v) { this._effect = v; }

	get spell() { return this._spell; }
	set spell() { return this._spell; }

	constructor() {

		super( '', '', 'potion');

	}

	quaff( char ) {

		if ( this._effect ) {

			if ( this._effect instanceof forms.Formula ) this._effect.eval( char );

		}

	}

}