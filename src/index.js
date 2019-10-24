import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import * as serviceWorker from './serviceWorker';
import {cardValue, cardSuit, cardType} from './card';

const imageDir = '../public/assets/PNG/';

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

const images = importAll(require.context('../public/assets/PNG/', false, /\.(png|jpe?g|svg)$/));

console.log(images);

function createCardPack(){
	let cardPack = []
	for (let i = 0; i < 52; i++){
			cardPack.push(i);
	}
	return cardPack;
}

function PlayerDisplay(props) {
	const cards = props.playerCards;
	let cardUrls = [];
	const getImages = () => {
		console.log(cards);
		cards.forEach(card => {
			console.log(card);
			let type = Math.floor(card / 4);
			let suit = card % 4;

			console.log(`type: ${type}`);
			console.log(`suit: ${suit}`);
			cardUrls.push(images[`${cardType[type]}${cardSuit[suit]}.png`]); 
		})
	}

	const renderImage = (url) => {
		return (
			<div key={url}>
				<img src={url}/>
			</div>
		)
	}

	getImages();
	console.log(cardUrls);
	return (
		<div>Player
			<div>
				<p>{props.player}</p>	
			</div>
			<div className="player">
				{cardUrls.map(imageUrl => renderImage(imageUrl))}	
			</div>
		</div>
	)
}

function BlackJack(props){
	const [cardPack, setCardPack] = useState(createCardPack());
	const [dealer, setDealer] = useState(0);
	const [player, setPlayer] = useState(0);
	const [dealerCards, setDealerCards] = useState([]);
	const [playerCards, setPlayerCards] = useState([]);
	const [winner, setWinner] = useState("");
	const [gameEnds, setGameEnds] = useState(false);

	const getWinner = () => {
		if (player > 21) {
			setWinner("dealer wins!");
		}
		else if (dealer > 21) {
			setWinner("player wins!");
		}
		else {
			if (dealer > player){
				setWinner("dealer wins!");
			}
			else if (player > dealer){
				setWinner("player wins!");
			}
			else {
				setWinner("tie!");
			}
		}
		setGameEnds(true);
	}

	const calculateValue = (card, currentValue) => {
		// card pack comes in groups of four. Every 4 cards is a new value, 
		// starting from ace (0-3) to king (48-51)
		let num = Math.floor(card / 4);
		const type = cardType[num];
		if (type === "A"){
			if ((22 - currentValue) >= 11) {
				return 11;
			} 
			return 1;
		}
		else {
			return cardValue[type];
		}
	}

	const dealDealer = (playerStands) => {
		// if the player stands, dealer deals cards until either he busts or stops.
		let curr = dealer;
		let prob = (21 - curr) / 10;
		if (playerStands){
			while (Math.random() < prob){
				let rand_index = Math.floor(Math.random()*cardPack.length);
				let card = cardPack[rand_index];
				cardPack.splice(rand_index, 1);
				dealerCards.push(card);
				const value = calculateValue(card, curr);
				curr += value;
				prob = (21 - curr) / 10;
			}
			setDealer(curr);
		}
		// else dealer deals one card to himself or stops
		else {
			if (Math.random() < prob){
				let rand_index = Math.floor(Math.random()*cardPack.length);
				let card = cardPack[rand_index];
				cardPack.splice(rand_index, 1);
				dealerCards.push(card);
				const value = calculateValue(card, curr);
				setDealer(curr + value);
			}
		}
	}

	const hit = () => {
		// deal first to player, calculate its value, display the card
		let rand_index = Math.floor(Math.random()*cardPack.length);
		let card = cardPack[rand_index];
		cardPack.splice(rand_index, 1);
		playerCards.push(card);
		const value = calculateValue(card, player);
		if ((value + player) > 21) {
			setPlayer(player+value);
			setGameEnds(true);		
		}
		else {
			setPlayer(player + value);
			// deal to the dealer once.
			dealDealer(false);
		}

	}

	const stand = () => {
		dealDealer(true);
		setGameEnds(true);
	}

	const reset = () => {
		setCardPack(createCardPack());
		setDealer(0);
		setPlayer(0);
		setDealerCards([]);
		setPlayerCards([]);
		setWinner("");
		setGameEnds(false);
	}

	useEffect(() => {
		if (gameEnds){
			getWinner();	
		}
	}, [gameEnds])

	return (
		<div className="container">
			<h1>Blackjack</h1>
			<p>Hello!</p>

			<div>Dealer
				<p>{dealer}</p>
			</div>

			<PlayerDisplay player={player} playerCards={playerCards}>
			</PlayerDisplay>

			<div>
				<button disabled={gameEnds} onClick={hit}>Hit</button>
				<button disabled={gameEnds} onClick={stand}>Stand</button>
			</div>

			<button onClick={reset}>Reset</button>

			<p className="winner">{winner}</p>
		</div>
	)
}


ReactDOM.render(<BlackJack />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
