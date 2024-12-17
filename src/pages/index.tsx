import { useState, useEffect } from 'react';

export default function Home() {
  // State for the game
  const [word, setWord] = useState<string>(''); // Word to guess
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string[][]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Function to fetch a random 5-letter word
  const fetchWord = async () => {
    try {
      const response = await fetch('https://api.datamuse.com/words?sp=?????'); // Fetch 5-letter words
      const data = await response.json();
      if (data.length > 0) {
        // Randomly select a word from the API response
        const randomWord = data[Math.floor(Math.random() * data.length)].word;
        setWord(randomWord.toUpperCase()); // Set the word in uppercase for consistency
      } else {
        console.error('No words found from the Datamuse API');
      }
    } catch (error) {
      console.error('Error fetching word:', error);
    }
  };

  // Fetch the word when the game starts
  useEffect(() => {
    fetchWord();
  }, []);

  // Restart the game and fetch a new word
  const restartGame = () => {
    setGuesses([]);
    setFeedback([]);
    setShowModal(false);
    setCurrentGuess('');
    fetchWord(); // Fetch a new word
  };

  const checkGuess = (guess: string) => {
    let feedback: string[] = [];
    for (let i = 0; i < 5; i++) {
      if (guess[i] === word[i]) {
        feedback.push('green');
      } else if (word.includes(guess[i])) {
        feedback.push('yellow');
      } else {
        feedback.push('gray');
      }
    }
    setFeedback((prev) => [...prev, feedback]);
  };

  const handleSubmit = () => {
    if (currentGuess.length === 5) {
      checkGuess(currentGuess);
      setGuesses((prev) => [...prev, currentGuess]);
      setCurrentGuess('');
      if (guesses.length >= 5 || currentGuess === word) {
        setShowModal(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentGuess.length === 5) {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-4 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl text-center font-bold mb-4">Dejny Wordle Game</h1>

        {/* Grid layout */}
        <div className="space-y-2 mb-4">
          {guesses.map((guess, rowIndex) => (
            <div key={rowIndex} className="flex justify-center">
              {guess.split('').map((letter, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-12 h-12 flex items-center justify-center text-white rounded-lg ${
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
          onChange={(e) => setCurrentGuess(e.target.value.toLowerCase())}
          onKeyDown={handleKeyDown}
          className="w-full p-2 text-center border border-gray-300 rounded mb-4"
          maxLength={5}
          disabled={guesses.length >= 6 || guesses.includes(word)}
        />
        <button
          onClick={handleSubmit}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={currentGuess.length !== 5 || guesses.length >= 6 || guesses.includes(word)}
        >
          Submit Guess
        </button>

        {/* Restart and Show Word Buttons */}
        {guesses.length >= 6 && (
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setShowModal(true)}
              className="p-2 bg-gray-700 text-white rounded w-1/2 mr-1"
            >
              Show Word
            </button>
            <button
              onClick={restartGame}
              className="p-2 bg-green-500 text-white rounded w-1/2 ml-1"
            >
              Restart Game
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 pt-4 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 font-bold text-gray-600 text-2xl "
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Game Over!</h2>
            <p className="text-lg mb-4">
              The Wordle was: <strong>{word}</strong>
            </p>

            <div className="flex justify-between">
              <button
                onClick={restartGame}
                className="p-2 bg-green-500 text-white rounded w-1/2 mr-1"
              >
                Restart
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-gray-700 text-white rounded w-1/2 ml-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
