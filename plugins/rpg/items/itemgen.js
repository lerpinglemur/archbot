const Weapon = require( './weapon.js' );
const Wearable = require( './wearable.js');
const Item = require( './item.js');
const Material = require( './material.js');
const Potion= require('./potion.js');
const Feature = require( '../world/feature.js');
const Chest = require( './chest.js');
const Grave = require( './grave.js');

exports.fromJSON = fromJSON;
exports.genWeapon = genWeapon;
exports.genArmor = genArmor;
exports.genItem = genItem;
exports.genFeature = randFeature;
exports.genLoot = genLoot;
exports.genPot = genPot;
exports.potsList = potsList;

exports.miscItem = miscItem;

var miscItems, allItems;
var allPots, potsByLevel;

var featureByName;
var featureList;

var baseWeapons = require( '../data/items/weapons.json');
var baseArmors = require( '../data/items/armors.json');
var armorBySlot;
var weaponByType;

initItems();
initArmors();
initPots();
initScrolls();
initChests();

initFeatures();

Material.LoadMaterials();

function initItems() {

	var items = require( '../data/items/items.json');
	var spec = items.special;

	miscItems = items.misc;
	allItems = {};

	for( let i = miscItems.length-1; i>= 0; i--) {
		allItems[ miscItems[i].name.toLowerCase() ] = miscItems[i];
	}

	for( let i = spec.length-1; i>=0; i--) {
		allItems[ spec[i].name.toLowerCase() ] = spec[i];
	}

}

function initPots() {

	allPots = {};
	potsByLevel = [];

	let pots = require( '../data/items/potions.json' );

	let p, name,a;
	for( let i = pots.length-1; i>=0; i-- ) {

		p = pots[i];
		p.type = 'potion';	// assign type.

		name = p.name.toLowerCase();
		allItems[name] = allPots[name ] = p;

		a = potsByLevel[p.level];
		if ( !a ) potsByLevel[ p.level ] = a = [];
		a.push( p);

	}

}

function initChests() {

	let packs = require( '../data/items/chests.json' );

	let p, name,a;
	for( let i = packs.length-1; i>=0; i-- ) {

		p = packs[i];
		p.type = 'chest';	// assign type.

		name = p.name.toLowerCase();
		allItems[name] = p;

	}

}

function initScrolls() {
}

function initArmors() {

	armorBySlot = {};

	let armor, slot, list;
	for( let k = baseArmors.length-1; k >= 0; k-- ) {

		armor = baseArmors[k];
		slot = armor.slot;

		list = armorBySlot[slot];
		if ( !list ) list = armorBySlot[slot] = [];

		list.push( armor );

	}

}

/**
 * revive an item from JSON
*/
function fromJSON( json ) {

	if ( !json ) return null;

	switch ( json.type ) {
		case 'armor':
		return Wearable.FromJSON( json );
		break;

		case 'weapon':
		return Weapon.FromJSON(json);
		break;

		case 'potion':
		return Potion.FromJSON(json);
		break;

		case 'feature':
		return Feature.FromJSON(json);
		break;

		case 'grave':
		return Grave.FromJSON(json);
		break;

		case 'chest':
		return Chest.FromJSON(json);
		break;

		default:
			return Item.Item.FromJSON( json );
	}

	return null;

}

function genPot(name) {

	let pot = allPots[name];
	if ( !pot) return null;
	return Potion.FromJSON( pot );

}

function genWeapon( lvl ) {

	let mat = Material.Random( lvl );
	if ( mat === null ) { console.log( 'material is null'); return null; }

	//console.log( 'weaps len: ' + baseWeapons.length );
	let tmp = baseWeapons[ Math.floor( baseWeapons.length*Math.random() )];

	if ( !tmp ) {
		console.log( 'weapon template is null.');
		return null;
	}

	return Weapon.FromData(tmp, mat);

}

function genArmor( slot=null, lvl=0 ) {

	console.log( 'armor level: ' + lvl );

	let mat = Material.Random( lvl );
	if ( mat === null ) { console.log( 'material is null'); return null; }

	let tmp;
	if ( slot ) {
		tmp = getSlotRand( slot, lvl );
	} else {
		let list = baseArmors.filter( t=>!t.level || t.level <= lvl );
		tmp = list[ Math.floor( list.length*Math.random() )];
	}

	if ( !tmp ) return;

	return Wearable.FromData( tmp, mat );

}

function getSlotRand( slot,lvl=0) {

	let list = armorBySlot[slot];
	if ( !list ) return;
	list = list.filter( t=>!t.level || t.level <= lvl );
	return list[ Math.floor( list.length*Math.random() )];

}

function randFeature() {

	let data = featureList[ Math.floor(featureList.length*Math.random() )];
	return Feature.FromJSON( data );

}

function genItem() {
}

function genLoot( mons ) {

	let lvl = Math.floor(mons.level);

	let loot = { items:[] };
	if ( Math.random() < 0.5 ) loot.gold = Math.floor( 20*lvl*Math.random()+0.1 );

	if ( Math.random() < 0.2 ) {
		loot.items.push( genArmor(null,lvl) );
	}
	if ( Math.random() < 0.1 ) loot.items.push( genWeapon(lvl) );

	if ( mons.drops ) {
		console.log('GETTING MONS DROPS.');
		let itms = getDrops(mons);
		if ( itms ) loot.items = loot.items.concat( itms );
	}


	return loot;

}

function getDrops( mons ) {

	let drops = mons.drops;
	if ( !drops ) return;

	if ( Array.isArray( drops ) ) {

		console.log( 'ARRAY DROP');
		let it = drops[ Math.floor( Math.random()*drops.length ) ];
		return procItem( it );

	} else if ( typeof(drops) === 'string') {

		return Math.random() < 0.7 ? procItem( drops ) : null;

	} else {

		let it, itms = [];
		for( let k in drops ) {

			if ( 100*Math.random() < drops[k]) {
				it = procItem( k );
				if ( it ) itms.push( it );
				else console.log('item not found: ' + k );
			}

		}
		return itms;

	}

}

function procItem( name ) {

	let data = allItems[name];
	if ( !data ) return null;

	return fromJSON( data );

}

/**
 * Returns a useless item.
 */
function miscItem() {

	let it = miscItems[ Math.floor( miscItems.length*Math.random() )];
	return fromJSON( it );

}

/**
 * Create named feature from data.
 * @param {string} s
 */
function getFeature( s ) {
	let d = featureByName[s];
	if ( d ) return Feature.FromJSON(d);
	return null;
}

function initFeatures() {

	//console.log('INIT FEATURES');
	featureList = require( '../data/world/features.json');
	featureByName = {};

	for( let i = featureList.length-1; i>= 0; i-- ) {
		featureByName[ featureList[i].name ] = featureList[i];
	}
	//console.log('INIT FEATURES DONE');

}

function potsList( level ) {

	let a = potsByLevel[level];
	if ( !a ) return 'No potions of level ' + level + '.';

	let len = a.length;
	//let p = a[0];
	let s = `${a[0].name}`;
	for( let i = 1; i < len; i++ ) s += `, ${a[i].name}`;
	s += '.';

	return s;

}