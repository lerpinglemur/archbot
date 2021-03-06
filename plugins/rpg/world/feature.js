const itemjs = require( '../items/item.js' );
const actionjs = require( '../magic/action.js' );

module.exports = class Feature extends itemjs.Item {

	get action() { return this._action; }
	set action(v) { this._action = v; }

	get fb() { return this._fb; }
	set fb(b){this._fb = b;}

	static FromJSON( json ) {

		let f = new Feature( json.name, json.desc );

		if ( json.action ) {
			f.action = actionjs.GetAction(json.action);
		}
		if ( json.fb ) f.fb = json.fb;

		return itemjs.Item.FromJSON( json, f );

	}

	toJSON() {

		let ob = super.toJSON();

		if ( this.action ) ob.action = this.action.name;
		if ( this.fb ) ob.fb = this.fb;

		return ob;

	}

	constructor( name, desc ) {
		super( name, desc, 'feature' );
	}

	use( char ) {

		let res = '';
		if ( this._fb ) {
			res += this._fb.replace( '%c', char.name ) + ' ';
		}

		if ( this._action ) {
			return res + this._action.tryApply(char);
		}
		return res + "Nothing happens.";

	}

}