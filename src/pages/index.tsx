import { useState } from 'react';

export default function Home() {
  const [word, setWord] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string[][]>([]);

  const fetchWord = async () => {
    const res = await fetch('/api/get-word');
    const data = await res.json();
    setWord(data.word);
  };

  const checkGuess = (guess: string) => {
    let feedback: string[] = [];
    for (let i = 0; i < 5; i++) {
      if (guess[i] === word[i]) {
        feedback.push('green'); // Correct position
      } else if (word.includes(guess[i])) {
        feedback.push('yellow'); // Correct letter, wrong position
      } else {
        feedback.push('gray'); // Incorrect letter
      }
    }
    setFeedback((prev) => [...prev, feedback]);
  };

  const handleSubmit = () => {
    if (currentGuess.length === 5) {
      checkGuess(currentGuess);
      setGuesses((prev) => [...prev, currentGuess]);
      setCurrentGuess('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-4 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl text-center font-bold mb-4">Dejny Wordle Game</h1>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {guesses.map((guess, rowIndex) => (
            <div key={rowIndex} className="flex">
              {guess.split('').map((letter, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-12 h-12 flex items-center justify-center text-white p-2 m-0.5 rounded-lg ${
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
        <input
          type="text"
          value={currentGuess}
          onChange={(e) => setCurrentGuess(e.target.value.toLowerCase())}
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
        {guesses.length >= 6 && !guesses.includes(word) && (
          <div className="text-center mt-4 text-red-500">Game Over! The word was: {word}</div>
        )}
      </div>
    </div>
  );
}
