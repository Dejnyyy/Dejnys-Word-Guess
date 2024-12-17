import { useState, useEffect } from 'react';

export default function Home() {
  // State for the game
  const [word, setWord] = useState<string>(''); // Word to guess
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string[][]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [keyboardState, setKeyboardState] = useState<{ [key: string]: string }>({});

  // Function to fetch a random 5-letter word
  const fetchWord = async () => {
    try {
      const response = await fetch('https://api.datamuse.com/words?sp=?????'); // Fetch 5-letter words
      const data = await response.json();
      if (data.length > 0) {
        const randomWord = data[Math.floor(Math.random() * data.length)].word;
        setWord(randomWord.toUpperCase());
      } else {
        console.error('No words found from the Datamuse API');
      }
    } catch (error) {
      console.error('Error fetching word:', error);
    }
  };

  useEffect(() => {
    fetchWord();
  }, []);

  const restartGame = () => {
    setGuesses([]);
    setFeedback([]);
    setShowModal(false);
    setCurrentGuess('');
    setKeyboardState({});
    fetchWord();
  };

  const checkGuess = (guess: string) => {
    const targetWord = word.toLowerCase();
    const guessLower = guess.toLowerCase();
    let newFeedback: string[] = Array(5).fill('gray');
    const targetLetterCount: { [key: string]: number } = {};

    for (let letter of targetWord) {
      targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
    }

    // Green check
    for (let i = 0; i < 5; i++) {
      if (guessLower[i] === targetWord[i]) {
        newFeedback[i] = 'green';
        targetLetterCount[guessLower[i]] -= 1;
        setKeyboardState((prev) => ({ ...prev, [guessLower[i]]: 'green' }));
      }
    }

    // Yellow check
    for (let i = 0; i < 5; i++) {
      if (
        newFeedback[i] === 'gray' &&
        targetWord.includes(guessLower[i]) &&
        targetLetterCount[guessLower[i]] > 0
      ) {
        newFeedback[i] = 'yellow';
        targetLetterCount[guessLower[i]] -= 1;
        if (!keyboardState[guessLower[i]]) {
          setKeyboardState((prev) => ({ ...prev, [guessLower[i]]: 'yellow' }));
        }
      }
    }

    // Gray check
    for (let i = 0; i < 5; i++) {
      if (newFeedback[i] === 'gray' && !keyboardState[guessLower[i]]) {
        setKeyboardState((prev) => ({ ...prev, [guessLower[i]]: 'gray' }));
      }
    }

    setFeedback((prev) => [...prev, newFeedback]);
  };

  const handleSubmit = () => {
    if (currentGuess.length === 5) {
      checkGuess(currentGuess);
      setGuesses((prev) => [...prev, currentGuess]);
      if (currentGuess.toUpperCase() === word) {
        setShowModal(true);
      } else if (guesses.length + 1 >= 6) {
        setShowModal(true);
      }
      setCurrentGuess('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentGuess.length === 5) {
      handleSubmit();
    }
  };

  // Helper to render keyboard rows
  const renderKeyboardRow = (letters: string) => (
    <div className="flex space-x-1 justify-center">
      {letters.split('').map((letter) => (
        <button
          key={letter}
          className={`w-8 h-10 flex items-center justify-center font-bold rounded text-white ${
            keyboardState[letter.toLowerCase()] === 'green'
              ? 'bg-green-500'
              : keyboardState[letter.toLowerCase()] === 'yellow'
              ? 'bg-yellow-500'
              : keyboardState[letter.toLowerCase()] === 'gray'
              ? 'bg-gray-400'
              : 'bg-gray-200'
          }`}
          disabled
        >
          {letter}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-4 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl text-center font-bold mb-4">Dejny's Wordly</h1>

        {/* Grid layout */}
        <div className="space-y-2 mb-4">
          {guesses.map((guess, rowIndex) => (
            <div key={rowIndex} className="flex justify-center">
              {guess.split('').map((letter, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-12 h-12 flex items-center justify-center text-white m-0.5 font-bold rounded-lg ${
                    feedback[rowIndex]?.[colIndex] === 'green'
                      ? 'bg-green-500'
                      : feedback[rowIndex]?.[colIndex] === 'yellow'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                >
                  {letter.toUpperCase()}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Input and button */}
        <input
          type="text"
          value={currentGuess}
          onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          className="w-full p-2 text-center border border-gray-300 rounded mb-4"
          maxLength={5}
          placeholder="Type your guess..."
        />
        <button
          onClick={handleSubmit}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400 mb-4"
          disabled={currentGuess.length !== 5}
        >
          Submit Guess
        </button>

        {/* Keyboard */}
        <div className="space-y-2">
          {renderKeyboardRow('QWERTYUIOP')}
          {renderKeyboardRow('ASDFGHJKL')}
          {renderKeyboardRow('ZXCVBNM')}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 pt-4 rounded-lg shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 font-bold text-gray-600 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">
              {guesses.includes(word) ? 'Congratulations!' : 'Better luck next time!'}
            </h2>
            <p className="text-lg mb-4">
              {guesses.includes(word)
                ? `You guessed the word in ${guesses.length} attempts!`
                : `The word was: ${word}`}
            </p>
            <button
              onClick={restartGame}
              className="p-2 bg-green-500 text-white rounded w-full"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
