import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {cardValue, cardSuit, cardType} from './card';

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => {images[item.replace('./', '')] = r(item);});
  return images;
}

const images = importAll(require.context('../public/assets/PNG/', false, /\.(png|jpe?g|svg)$/));
const facedown = "red_back.png";

function createCardPack(){
	let cardPack = []
	for (let i = 0; i < 52; i++){
			cardPack.push(i);
	}
	return cardPack;
}

function DealerDisplay(props) {
	const cards = props.dealerCards;
	let cardUrls = [];
	const getImages = () => {
		cards.forEach(card => {
			let type = Math.floor(card / 4);
			let suit = card % 4;
			cardUrls.push(images[`${cardType[type]}${cardSuit[suit]}.png`]); 
		})
	}

	const renderImage = (url) => {
		return (
			<div className="container flip-container" key={url}
			onClick={(event) => {
				event.currentTarget.classList.toggle("flip");
			}} >
				<div className="flipper">
					<div className="back">
						<img className="cardImage" src={url}/>
					</div>
					<div className="front">
						<img className="cardImage" src={images[facedown]}/>
					</div>
				</div>
			</div>
		)
	}

	const revealHand = () => {
		const dealerCards = document.querySelectorAll('.flip-container');
		dealerCards.forEach(card => {
			card.classList.toggle("flip");
		})
	}

	getImages();

	if (props.gameEnds){
		revealHand();
	}

	return (
		<div className="dealer">
			<div className="d-inline-flex flex-row justify-content mb-4">Dealer
				{cardUrls.map(imageUrl => renderImage(imageUrl))}	
			</div>
		</div>
	);
}

function PlayerDisplay(props) {
	const cards = props.playerCards;
	let cardUrls = [];
	const getImages = () => {
		cards.forEach(card => {
			let type = Math.floor(card / 4);
			let suit = card % 4;
			cardUrls.push(images[`${cardType[type]}${cardSuit[suit]}.png`]); 
		})
	}

	const renderImage = (url) => {
		return (
			<div className="container" key={url}>
				<img className="cardImage" src={url}/>
			</div>
		)
	}

	getImages();
	return (
		<div>Player
			<div className="d-inline-flex flex-row mt-2 mb-4">
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
		if (player > 21 && dealer > 21){
			setWinner("tie");
		}
		else if (player > 21) {
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
		<div className="container m-5 p-4 rounded-top border text-center">
			<h1>Blackjack</h1>

			<DealerDisplay dealer={dealer} dealerCards={dealerCards} gameEnds={gameEnds}>
			</DealerDisplay>

			<PlayerDisplay player={player} playerCards={playerCards}>
			</PlayerDisplay>

			<div className="btn-group mr-2">
				<button className="btn btn-lg btn-outline-primary" disabled={gameEnds} onClick={hit}>Hit</button>
				<button className="btn btn-lg btn-outline-primary" disabled={gameEnds} onClick={stand}>Stand</button>
				<button className="btn btn-lg btn-outline-danger" onClick={reset}>Reset</button>
			</div>

			<div>
				<p className="winner">{winner}</p>
			</div>
		</div>
	)
}


ReactDOM.render(<BlackJack />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
