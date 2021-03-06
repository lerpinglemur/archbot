const promisify = require('../../jsutils').promisify;
const promiseGet = promisify( require('http').get );

/**
 * Allow display of other timezones using world time zone API.
 * @url http://worldtimeapi.org/
 */

const TimeApiUrl = "http://worldtimeapi.org/api/timezone/";

exports.init = function( bot ) {

	bot.dispatch.add( 'time', 'time [place]', cmdGetTime, {maxArgs:1} );

}

async function cmdGetTime( msg, query ) {

	var res = await promiseGet( TimeApiUrl + query );

	if ( res.statusCode !== 200 ) {

		res.resume();
		return msg.reply( 'ERROR ' + res.statusCode + ': ' + res.statusCode );

	} else {

		let data = '';
		res.on('data', chunk=>{
			data+=chunk;
		});

		await promisify( res.on, res )( 'end' );
		return msg.reply( data.slice(0, 1600 ) );

	}

}