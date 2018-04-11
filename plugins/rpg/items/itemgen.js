const Weapon = require( './weapon.js' );
const Armor = require( './armor.js');
const Item = require( './item.js');
const Material = require( './material.js');
const Feature = require( '../world/feature.js');

exports.fromJSON = fromJSON;
exports.genWeapon = genWeapon;
exports.genArmor = genArmor;
exports.genItem = genItem;
exports.genFeature = randFeature;
exports.genLoot = genLoot;

exports.randItem = randItem;

var miscItems, allItems;
var allPots;

var featureByName;
var featureList;

var baseWeapons = require( '../data/weapons.json');
var baseArmors = require( '../data/armors.json');
var armorBySlot;
var weaponByType;

initItems();
initArmors();
initPots();

initFeatures();

Material.LoadMaterials();

function initItems() {

	var items = require( '../data/items.json');
	miscItems = items.misc;
	var spec = items.special;

	allItems = {};
	for( let i = spec.length-1; i>=0; i--) {
		allItems[ spec[i].name.toLowerCase() ] = spec[i];
	}

}

function initPots() {

	allPots = {};
	let pots = require( '../data/potions.json' );

	let p;
	for( let i = pots.length-1; i>=0; i-- ) {

		p = pots[i];
		allPots[p.name] = p;

	}

}

function getPot(name) {

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
		return Armor.FromJSON( json );
		break;

		case 'weapon':
		return Weapon.FromJSON(json);
		break;

		case 'feature':
		return Feature.FromJSON(json);
		break;

		default:
			return Item.Item.FromJSON( json );
	}

	return null;

}

function genWeapon( lvl ) {

	let mat = Material.Random( lvl );
	if ( mat === null ) { console.log( 'material is null'); return null; }

	console.log( 'weaps len: ' + baseWeapons.length );
	let tmp = baseWeapons[ Math.floor( baseWeapons.length*Math.random() )];

	if ( tmp == null) console.log( 'weapon template is null.');

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

	return Armor.FromData( tmp, mat );

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
		let itms = getDrops(mons);
		if ( itms ) loot.items = loot.items.concat( itms );
	}


	return loot;

}

function getDrops( mons ) {

	let drops = mons.drops;
	if ( !drops ) return;

	if ( drops instanceof Array ) {

		console.log( 'RETURNING RANDOM DROP');
		let it = drops[ Math.floor( Math.random()*drops.length ) ];
		if ( it) return allItems[ it ];

	} else if ( typeof(drops) === 'string') {

		return Math.random() < 0.5 ? allItems[drops] : null;

	} else {

		let it, itms = [];
		for( let k in drops ) {

			console.log('ROLLING FOR DROP: ' + k );
			if ( 100*Math.random() < drops[k]) {
				it = allItems[k];
				if ( it ) itms.push( it );
			}

		}
		return itms;

	}

}

function randItem() {

	let it = miscItems[ Math.floor( miscItems.length*Math.random() )];
	let item = new Item.Item( it.name, it.desc );

	return item;

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

	console.log('INIT FEATURES');
	featureList = require( '../data/world/features.json');
	featureByName = {};

	for( let i = featureList.length-1; i>= 0; i-- ) {
		featureByName[ featureList[i].name ] = featureList[i]; 
	}
	console.log('INIT FEATURES DONE');

}