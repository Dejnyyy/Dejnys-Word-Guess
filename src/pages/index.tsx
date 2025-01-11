import { useState, useEffect, useCallback } from 'react';
import { MdWbSunny, MdNightsStay, MdRefresh } from 'react-icons/md';
import Link from 'next/link';

export default function Home() {
  const [word, setWord] = useState<string>(''); // Word to guess
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string[][]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [keyboardState, setKeyboardState] = useState<Record<string, string>>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    setIsDarkMode(savedMode === 'true');
  }, []);

  const fetchWord = useCallback(async () => {
    try {
      const response = await fetch('https://api.datamuse.com/words?sp=?????');
      const data = (await response.json()) as { word: string }[];

      const words: string[] = data.map((item) => item.word);

      if (words.length > 0) {
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];
        if (randomWord) {
          setWord(randomWord.toUpperCase());
        }
      } else {
        console.error('No words found from the Datamuse API');
      }
    } catch (error) {
      console.error('Error fetching word:', error);
    }
  }, []);

  useEffect(() => {
    void fetchWord();
  }, [fetchWord]);

  const restartGame = () => {
    setGuesses([]);
    setFeedback([]);
    setShowModal(false);
    setCurrentGuess('');
    setKeyboardState({});
    void fetchWord();
  };

  const checkGuess = (guess: string) => {
    if (!guess || guess.length !== 5) {
      console.error('Invalid guess: Guess must be a 5-letter string.');
      return;
    }
    const targetWord = word.toLowerCase();
    const guessLower = guess.toLowerCase();
    const newFeedback: string[] = Array<string>(5).fill('gray');
    const targetLetterCount: Record<string, number> = {};

    for (const letter of targetWord) {
      targetLetterCount[letter] = (targetLetterCount[letter] ?? 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i];
      if (letter && letter === targetWord[i]) {
        newFeedback[i] = 'green';
        if (targetLetterCount[letter] !== undefined) {
          targetLetterCount[letter] -= 1;
        }
        setKeyboardState((prev) => ({ ...prev, [letter]: 'green' }));
      }
    }

    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i];
      if (
        letter &&
        newFeedback[i] === 'gray' &&
        targetLetterCount[letter] !== undefined &&
        targetLetterCount[letter] > 0
      ) {
        newFeedback[i] = 'yellow';
        targetLetterCount[letter] -= 1;
        setKeyboardState((prev) =>
          prev[letter] === 'green' ? prev : { ...prev, [letter]: 'yellow' }
        );
      }
    }

    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i];
      if (letter && newFeedback[i] === 'gray' && !keyboardState[letter]) {
        setKeyboardState((prev) => ({ ...prev, [letter]: 'gray' }));
      }
    }

    setFeedback((prev) => [...prev, newFeedback]);
  };

  const handleKeyInput = (key: string) => {
    if (key === 'ENTER') {
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
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key)) {
      setCurrentGuess((prev) => (prev.length < 5 ? prev + key : prev));
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    handleKeyInput(key);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, guesses]);

  const renderKeyboardRow = (letters: string) => (
    <div className="flex space-x-1 justify-center">
      {letters.split('').map((letter) => (
        <button
          key={letter}
          className={`w-8 h-10 flex items-center justify-center font-bold rounded ${
            keyboardState[letter.toLowerCase()] === 'green'
              ? 'bg-green-500'
              : keyboardState[letter.toLowerCase()] === 'yellow'
              ? 'bg-yellow-500'
              : keyboardState[letter.toLowerCase()] === 'gray'
              ? 'bg-gray-400'
              : isDarkMode
              ? 'bg-gray-700 text-white'
              : 'bg-gray-200 text-black'
          }`}
          onClick={() => handleKeyInput(letter.toUpperCase())}
        >
          {letter}
        </button>
      ))}
    </div>
  );

  return (
    <div
      className={`flex items-center justify-center h-screen transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      <Link
        href="https://dejny.eu"
        target="_blank"
        className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg font-bold text-transparent bg-gradient-to-br from-yellow-400 via-pink-600 to-purple-600 bg-clip-text hover:opacity-90 transition-all duration-300"
      >
        Dejny.eu
      </Link>
      <span
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 right-4 text-2xl cursor-pointer p-2 rounded-full transition-all duration-300"
      >
        {isDarkMode ? (
          <MdNightsStay className="text-blue-500" />
        ) : (
          <MdWbSunny className="text-yellow-400" />
        )}
      </span>
      <div
        className={`w-full max-w-sm p-4 shadow-md rounded-lg mt-12 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
        }`}
      >
        <h1 className="text-4xl text-center bg-gradient-to-br from-yellow-400 via-pink-600 to-purple-600 text-transparent bg-clip-text font-bold mb-4">
          Dejny&apos;s Wordly
        </h1>
        <span
          onClick={restartGame}
          className={`absolute top-4 left-4 text-4xl cursor-pointer p-2 rounded-full transition-all duration-300 ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-500'
              : 'text-gray-700 hover:bg-gray-300'
          }`}
        >
          <MdRefresh
            className={isDarkMode ? 'text-gray-300 text-2xl' : 'text-gray-700 text-2xl'}
          />
        </span>

        <div className="space-y-2 mb-4">
          {Array.from({ length: 6 }, (_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length;
            const attemptsLeft = 6 - rowIndex; // Countdown from 6

            return (
              <div key={rowIndex} className="flex items-center">
                <span className="w-6 text-right pr-2 font-bold text-gray-500">
                  {attemptsLeft}
                </span>

                <div className="flex justify-center w-full">
                  {Array.from({ length: 5 }, (_, colIndex) => {
                    const letter =
                      guesses[rowIndex]?.[colIndex] ??
                      (isCurrentRow ? currentGuess[colIndex] : '');
                    const feedbackColor =
                      feedback[rowIndex]?.[colIndex] === 'green'
                        ? 'bg-green-500'
                        : feedback[rowIndex]?.[colIndex] === 'yellow'
                        ? 'bg-yellow-500'
                        : guesses[rowIndex]
                        ? 'bg-gray-400'
                        : 'bg-gray-500';

                    return (
                      <div
                        key={colIndex}
                        className={`w-12 h-12 flex items-center justify-center font-bold text-white m-0.5 rounded-lg ${feedbackColor}`}
                      >
                        {letter?.toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {renderKeyboardRow('QWERTYUIOP')}
          {renderKeyboardRow('ASDFGHJKL')}
          <div className="flex space-x-1 justify-center">
            <button
              className="w-16 h-10 flex text-white items-center justify-center font-bold bg-gradient-to-br from-yellow-400 via-pink-600 to-purple-600 rounded"
              onClick={() => handleKeyInput('BACKSPACE')}
            >
              Del
            </button>
            {renderKeyboardRow('ZXCVBNM')}
            <button
              className="w-16 h-10 flex items-center text-white justify-center font-bold bg-gradient-to-br from-yellow-400 via-pink-600 to-purple-600 rounded"
              onClick={() => handleKeyInput('ENTER')}
              disabled={currentGuess.length !== 5}
            >
              Enter
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 w-5/6 md:w-1/4 rounded-lg shadow-lg relative dark:bg-gray-800 dark:text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 font-bold text-gray-600 dark:text-gray-200 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">
              {guesses.includes(word) ? 'Congratulations!' : 'Better luck next time!'}
            </h2>
            <p className="text-lg mb-4">
              {guesses.includes(word) ? (
                <>
                  You guessed the word in{' '}
                  <span className="bg-gradient-to-br from-yellow-400 via-pink-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
                    {guesses.length} attempts!
                  </span>
                </>
              ) : (
                `The word was: ${word}`
              )}
            </p>
            <button
              onClick={restartGame}
              className="p-2 bg-gradient-to-br from-yellow-400 via-pink-600 to-purple-600 text-white rounded w-full"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
