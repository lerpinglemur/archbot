const jimp = require( 'jimp' );
const Discord = require( 'discord.js');

/**
 * {Jimp}
 */
var imgBoard;
var imgPieces;
var tSize;
var imagesLoaded = false;

// tiled piece positions.
//const teamRow = { 'W':1, 'B':0 };

const pieceCol = { 'Q':0, 'K':1, 'R':2, 'N':3, 'B':4, 'P': 5};

/**
 * Maps chess letters to unicode characters.
 * Black pieces are lowercase.
 */
const to_unicode = { 'K':'\u2654', 'Q':'\u2655', 'R':'\u2656',
						'B':'\u2657', 'N':'\u2658', 'P':'\u2659',
						'k':'\u265A', 'q':'\u265B', 'r':'\u265C',
						'b':'\u265D', 'n':'\u265E', 'p':'\u265F' };

/**
* @async
* @returns {Promise}
*/
exports.loadImages = async function() {

	try {

		imgBoard = await jimp.read( __dirname + '/images/board.png' );
		imgPieces = await jimp.read( __dirname + '/images/pieces.png');

		tSize = Math.floor( imgBoard.bitmap.width / 8 );

		imagesLoaded = true;

	} catch(e) {
		console.error(e);
	}

}

/**
 * @async
 * @param {Channel} chan
 * @param {ChessGame} game
 * @returns {Promise}
 */
exports.showBoard = async function( chan, game ) {

	if ( imagesLoaded ) {

		try {

			let buff = await getBoardImg(game);
			if ( buff ) {

				//let attach =
				return chan.send( game.getStatusString(), new Discord.MessageAttachment( buff ) );

			}

		} catch ( e ) {
			console.error(e);
		}

	}

	return chan.send( getBoardStr(game));

}

/**
 * @asyn
 * @param {Game} game
 * @returns {Promise<Buffer>}
 */
async function getBoardImg( game ) {

	let img = imgBoard.clone();
	let pieces = imgPieces;

	let b = game.getBoard();

	let sqr, srcR, srcC;
	let i = 0, destRow = 7, destCol = 0;

	while ( i < 64 ) {

		sqr = b[i];
		if ( sqr != null ) {

			srcR = sqr.side == 'W' ? 1 : 0;
			srcC = pieceCol[ sqr.type ];

			img.blit( pieces, destCol*tSize, destRow*tSize, srcC*tSize, srcR*tSize, tSize, tSize );

		}
		destCol++; i++;
		if ( destCol === 8 ) {
			destCol=0;
			destRow--;
		}

	} // while

	return imageBuffer( img );

}

/**
 * Wraps image.getBuffer() in a promise to make awaitable.
 * @param {Jimp} img
 * @returns {Promise<Buffer|null>}
 */
async function imageBuffer( img ) {

	return new Promise( (res)=>{
		img.getBuffer( jimp.MIME_PNG, (err, buff)=>{

			res( err ? null : buff );
		} );
	});

}

/**
 *
 * @param {Game} game
 * @returns {string}
 */
function getBoardStr( game ) {

	let b = game.getBoard();
	let i = 0;
	let sqr;
	let row = [];
	let rows = [];

	let wasPiece = false;

	while ( i < 64 ) {

		sqr = b[i];
		if ( sqr == null ) {
			if ( wasPiece) row.push('. ')
			else row.push( '. ');
			wasPiece = false;
		} else {
			if ( sqr.side == 'B') row.push( to_unicode[sqr.type.toLowerCase()] );
			else row.push( to_unicode[sqr.type] );
			wasPiece = true;
		}


		if ( ++i % 8 === 0 ) {

			rows.unshift( row.join(' ') );
			row = [];
			wasPiece = false;
		}

	} //

	let res = '```';
	if ( game.lastMove != null ) res += ' ' + game.lastMove;

	return res + '\n' + rows.join( '\n') + '\n' + game.getStatusString() + '```';

}