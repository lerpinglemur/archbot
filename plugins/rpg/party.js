const loc = require( './world/loc.js');
module.exports = class Party {

	get names() { return this._names; }
	get invites() { return this.pending; }

	get leader() { return this._leader; }
	set leader(n) { this._leader = n; }

	get name() { return this._leader + "'s Party ";}

	get loc() { return this._loc; }
	set loc(v) { this._loc.setTo(v); }

	async getState() {

		let char;
		for( let i = this._names.length-1; i >= 0; i-- ) {

			char = await this._cache.fetch( this._names[i]);
			if ( char && char.state === 'alive' ) return 'alive';

		} //
		return 'dead';

	}

	constructor( leader, cache ) {

		this._cache = cache;

		this._names = [ leader.name ];
		this.pending = [];

		this._leader = leader.name;
		this._loc = new loc.Coord( leader.loc.x, leader.loc.y );

	}

	/**
	 * 
	 * @param {string} name 
	 */
	async getChar( name ) {
		return await this._cache.fetch( name );
	}

	/**
	 * 
	 * @param {Loc.Coord} coord 
	 */
	async move( coord ) {

		this.loc = coord;

		let char;
		for( let i = this._names.length-1; i >= 0; i-- ) {

			char = await this._cache.fetch( this._names[i]);
			console.log( 'moving char: ' + char.name + ' to: ' + coord.toString() );
			if ( char ) char.loc = coord;

		} //

	}

	getList() {
		return this._leader + "'s Party:\n" + this._names.join('\n');
	}

	setLeader(char) { this._leader = char.name; }
	isLeader( char ) { return this._leader === char.name; }

	/**
	 * 
	 * @param {string|Char} char 
	 */
	includes( char ) {
		if ( typeof(char)==='string') return this._names.includes(char);
		return this._names.includes(char.name);
	}

	async addExp( exp ) {

		let count = this._names.length;

		// add exp bonus for party members.
		exp = exp*( 1 + count*0.2 ) / count;

		for( let i = count-1; i>= 0; i-- ) {

			var c = await this._cache.fetch( this._names[i] );
			if ( c ) c.addExp( exp)

		}

	}

	/**
	 * Returns a random character from the group which is still alive.
	 */
	async randAlive() {

		let len = this._names.length;
		let ind = Math.floor( Math.random()*len );
		let start = ind;

		do {

			var c = await this._cache.fetch( this._names[ind] );
			if ( c && c.state === 'alive' ) return c;

			if ( ++ind >= len ) ind = 0;

		} while ( ind != start );

		return null;

	}


	/**
	 * A valid target must be alive and have positive hitpoints.
	 */
	async randTarget() {

		let len = this._names.length;
		let ind = Math.floor( Math.random()*len );
		let start =ind;

		do {

			var c = await this._cache.fetch( this._names[ind] );
			if ( c && c.curHp > 0 && c.state === 'alive' ) return c;

			console.log( this._names[ind] + ' NOT A VALID TARGEt.');
			if ( ++ind >= len ) ind = 0;

		} while ( ind != start );

		return null;

	}

	async randChar() {
		return await this._cache.fetch( this._names[ Math.floor( this._names.length*Math.random() )] );
	}

	randName() {
		return this._names[ Math.floor( this._names.length*Math.random() )];
	}

	invite(char) {

		let name = char.name;

		if ( this.pending.includes(name) || this._names.includes(name ) ) return;
		this.pending.push(name);

	}

	accept( char ) {

		let name = char.name;
		let ind = this.pending.indexOf( name );
		if ( ind < 0 ) return false;

		this.pending.splice(ind, 1);
		this._names.push( name );

		return true;

	}

	/**
	 * 
	 * @param {string} name
	 * @returns true if the party should be removed. false otherwise. 
	 */
	leave( char ) {

		let name = char.name;
		let ind = this._names.indexOf( name );
		if ( ind >= 0 ) {

			this._names.splice(ind, 1);
			if ( this._names.length === 0 ||
				(this._names.length === 1 && this.invites.length === 0) ) return true;

			if ( this._leader === name ) this._leader = this._names[0];

		}
		return false;
	}

}