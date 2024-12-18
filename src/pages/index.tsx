import { useState, useEffect } from 'react';
import { MdWbSunny, MdNightsStay } from 'react-icons/md'; // Material Design Icons

export default function Home() {
  // State for the game
  const [word, setWord] = useState<string>(''); // Word to guess
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string[][]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [keyboardState, setKeyboardState] = useState<{ [key: string]: string }>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Default to false

  // On client-side mount, check localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    if (savedMode !== null) {
      setIsDarkMode(JSON.parse(savedMode));
    }
  }, []);

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

  useEffect(() => {
    // Apply dark or light mode to the html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark'); // Add the 'dark' class to the html element
    } else {
      document.documentElement.classList.remove('dark'); // Remove the 'dark' class
    }
    // Save the dark mode preference in localStorage
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]); // Re-run when dark mode state changes

  const restartGame = () => {
    setGuesses([]);
    setFeedback([]);
    setShowModal(false);
    setCurrentGuess('');
    setKeyboardState({});
    fetchWord();
  };
  const checkGuess = (guess: string) => {
    if (!guess || guess.length !== 5) {
      console.error('Invalid guess: Guess must be a 5-letter string.');
      return;
    }
  
    const targetWord = word.toLowerCase();
    const guessLower = guess.toLowerCase();
    let newFeedback: string[] = Array(5).fill('gray');
    const targetLetterCount: { [key: string]: number } = {};
  
    for (let letter of targetWord) {
      targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
    }
  
    // Green check
    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i]; // Access the letter
    
      // Check if letter and targetWord[i] are defined before proceeding
      if (letter !== undefined && targetWord[i] !== undefined) {
        if (letter === targetWord[i]) {
          newFeedback[i] = 'green';
          targetLetterCount[letter] = (targetLetterCount[letter] || 0) - 1;
          setKeyboardState((prev) => ({ ...prev, [letter]: 'green' }));
        }
      }
    }
    
    
  
    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i]; // Access the letter
    
      // Check if letter is defined and valid
      if (
        newFeedback[i] === 'gray' &&
        letter !== undefined &&
        targetWord.includes(letter) &&
        targetLetterCount[letter] !== undefined &&
        targetLetterCount[letter] > 0
      ) {
        newFeedback[i] = 'yellow';
        targetLetterCount[letter] -= 1;
    
        // Update keyboard state safely
        if (!keyboardState[letter]) {
          setKeyboardState((prev) => ({ ...prev, [letter]: 'yellow' }));
        }
      }
    }
    
  
    // Gray check
    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i]; // Access the letter safely
    
      // Check if letter is defined and newFeedback is gray
      if (newFeedback[i] === 'gray' && letter !== undefined && !keyboardState[letter]) {
        setKeyboardState((prev) => ({ ...prev, [letter]: 'gray' }));
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
          disabled
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
    <div
      className={`w-full max-w-sm p-4 shadow-md rounded-lg ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
      }`}
    >
       {/* Light/Dark Mode Toggle Emoji */}
        <span
  onClick={() => setIsDarkMode(!isDarkMode)}
  className="absolute top-4 right-4 text-4xl cursor-pointer p-2 rounded-full transition-all duration-300"
  
>
  {isDarkMode ? <MdNightsStay className="text-blue-500" /> : <MdWbSunny className="text-yellow-400" /> }
</span>

        <h1 className="text-4xl text-center bg-gradient-to-br from-yellow-400 via-pink-600 to-purple-600 text-transparent bg-clip-text font-bold mb-4">
          Dejny's Wordly
        </h1>

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
          onKeyDown={handleKeyDown}
          className={`w-full p-2 text-center border border-gray-300 rounded mb-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} `}
          maxLength={5}
          onChange={(e) => {
            const input = e.target.value;
            // Allow only letters a-z and A-Z
            if (/^[a-zA-Z]*$/.test(input)) {
              setCurrentGuess(input.toUpperCase());
            }
          }}
          placeholder="Type your guess..."
        />
        <button
  onClick={handleSubmit}
  disabled={currentGuess.length !== 5}
  className={`w-full p-2 bg-gradient-to-br mb-4 from-yellow-400 via-pink-600 to-purple-600 text-white font-bold rounded 
    transition-all duration-300 ${
      currentGuess.length !== 5 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
    }`}
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
          <div className="bg-white p-6 pt-4 w-1/4 rounded-lg shadow-lg relative dark:bg-gray-800 dark:text-white">
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
                  <span
                    className="bg-gradient-to-br from-yellow-400 via-pink-600 to-purple-600 bg-clip-text text-transparent font-extrabold"
                    style={{ display: 'inline-block' }}
                  >
                    {guesses.length} attempts!
                  </span>
                </>
              ) : (
                `The word was: ${word}`
              )}
            </p>

            <button
              onClick={restartGame}
              className="p-2 bg-gradient-to-br from-yellow-400 via-pink-600  to-purple-600 text-white rounded w-full"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
