import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API_BASE_URL = "http://deckofcardsapi.com/api/deck";

/* Deck: uses deck API, allows drawing card at a time. */

function Deck() {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null);

  /* At mount: load deck from API into state. */
  useEffect(() => {
    async function getData() {
      let d = await axios.get(`${API_BASE_URL}/new/shuffle/`);
      setDeck(d.data);
    }

    console.log('Deck Component Mounted');  // the component mounts
    getData();
  }, [setDeck]);

  /* Draw one card every second if autoDraw is true */
  useEffect(() => {
    /* Draw a card via API, add card to state "drawn" list */
    async function getCard() {
      let { deck_id } = deck;

      try {
        let drawRes = await axios.get(`${API_BASE_URL}/${deck_id}/draw/`);

        console.log('API Response:', drawRes.data);  // useEffects for fetching data runs

        if (drawRes.data.remaining === 0) {
          setAutoDraw(false);
          throw new Error("no cards remaining!");
        }

        const card = drawRes.data.cards[0];

        setDrawn(d => [
          ...d,
          {
            id: card.code,
            name: card.suit + " " + card.value,
            image: card.image
          }
        ]);
      } catch (err) {
        alert(err);
      }
    }

    console.log('AutoDraw:', autoDraw); 
    console.log('Deck:', deck);

    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await getCard();
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoDraw, setAutoDraw, deck]);

  console.log('Drawn Cards:', drawn);

  const toggleAutoDraw = () => {
    setAutoDraw(auto => !auto);
  };

  const cards = drawn.map(c => (
    <Card key={c.id} name={c.name} image={c.image} />
  ));

  return (
    <div className="Deck">
      {deck ? (
        <button className="Deck-gimme" onClick={toggleAutoDraw}>
          {autoDraw ? "STOP" : "KEEP"} DRAWING FOR ME!
        </button>
      ) : null}
      <div className="Deck-cardarea">{cards}</div>
    </div>
  );
}

export default Deck;
