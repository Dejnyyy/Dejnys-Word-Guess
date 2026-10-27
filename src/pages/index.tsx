import { useState, useEffect, useCallback } from "react";
import { MdWbSunny, MdNightsStay, MdRefresh } from "react-icons/md";
import Link from "next/link";
import Head from "next/head";

const SITE_URL = "https://wordly.dejny.eu";
const SITE_TITLE = "Dejny's Wordly – Guess the 5-Letter Word";
const SITE_DESCRIPTION =
  "Challenge yourself with Dejny's Wordly! A fun word-guessing game where you have 6 tries to find the hidden 5-letter word. Play now for free!";
const OG_IMAGE = `${SITE_URL}/dejnyswordle.png`;

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://dejny.eu/#organization",
      name: "Dejny",
      url: "https://dejny.eu",
      logo: { "@type": "ImageObject", url: "https://dejny.eu/icon.png", width: 512, height: 512 },
      email: "dejny@dejny.eu",
      address: { "@type": "PostalAddress", addressLocality: "Praha", addressCountry: "CZ" },
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "dejny@dejny.eu", availableLanguage: ["cs", "en"] },
      sameAs: [
        "https://github.com/Dejnyyy",
        "https://linkedin.com/in/dejny",
        "https://www.instagram.com/_dejny",
        "https://www.tiktok.com/@dejnyyy",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Dejny's Wordly",
      url: SITE_URL,
      inLanguage: "en",
      publisher: { "@id": "https://dejny.eu/#organization" },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Dejny's Wordly",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      image: OG_IMAGE,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      inLanguage: "en",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      author: { "@id": "https://dejny.eu/#organization" },
      publisher: { "@id": "https://dejny.eu/#organization" },
    },
  ],
};

export default function Home() {
  const [word, setWord] = useState<string>(""); // Word to guess
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [feedback, setFeedback] = useState<string[][]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [keyboardState, setKeyboardState] = useState<Record<string, string>>(
    {},
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("isDarkMode");
    setIsDarkMode(savedMode === "true");
  }, []);

  const fetchWord = useCallback(async () => {
    try {
      const response = await fetch("https://api.datamuse.com/words?sp=?????");
      const data = (await response.json()) as { word: string }[];

      const words: string[] = data.map((item) => item.word);

      if (words.length > 0) {
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];
        if (randomWord) {
          setWord(randomWord.toUpperCase());
        }
      } else {
        console.error("No words found from the Datamuse API");
      }
    } catch (error) {
      console.error("Error fetching word:", error);
    }
  }, []);

  useEffect(() => {
    void fetchWord();
  }, [fetchWord]);

  const restartGame = () => {
    setGuesses([]);
    setFeedback([]);
    setShowModal(false);
    setCurrentGuess("");
    setKeyboardState({});
    void fetchWord();
  };

  const checkGuess = (guess: string) => {
    if (!guess || guess.length !== 5) {
      console.error("Invalid guess: Guess must be a 5-letter string.");
      return;
    }
    const targetWord = word.toLowerCase();
    const guessLower = guess.toLowerCase();
    const newFeedback: string[] = Array<string>(5).fill("gray");
    const targetLetterCount: Record<string, number> = {};

    for (const letter of targetWord) {
      targetLetterCount[letter] = (targetLetterCount[letter] ?? 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i];
      if (letter && letter === targetWord[i]) {
        newFeedback[i] = "green";
        if (targetLetterCount[letter] !== undefined) {
          targetLetterCount[letter] -= 1;
        }
        setKeyboardState((prev) => ({ ...prev, [letter]: "green" }));
      }
    }

    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i];
      if (
        letter &&
        newFeedback[i] === "gray" &&
        targetLetterCount[letter] !== undefined &&
        targetLetterCount[letter] > 0
      ) {
        newFeedback[i] = "yellow";
        targetLetterCount[letter] -= 1;
        setKeyboardState((prev) =>
          prev[letter] === "green" ? prev : { ...prev, [letter]: "yellow" },
        );
      }
    }

    for (let i = 0; i < 5; i++) {
      const letter = guessLower[i];
      if (letter && newFeedback[i] === "gray" && !keyboardState[letter]) {
        setKeyboardState((prev) => ({ ...prev, [letter]: "gray" }));
      }
    }

    setFeedback((prev) => [...prev, newFeedback]);
  };

  const handleKeyInput = (key: string) => {
    if (key === "ENTER") {
      if (currentGuess.length === 5) {
        checkGuess(currentGuess);
        setGuesses((prev) => [...prev, currentGuess]);
        if (currentGuess.toUpperCase() === word) {
          setShowModal(true);
        } else if (guesses.length + 1 >= 6) {
          setShowModal(true);
        }
        setCurrentGuess("");
      }
    } else if (key === "BACKSPACE") {
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
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, guesses]);

  const renderKeyboardRow = (letters: string) => (
    <div className="flex justify-center gap-1.5">
      {letters.split("").map((letter) => {
        const state = keyboardState[letter.toLowerCase()];
        let bgClass = isDarkMode
          ? "bg-gray-700 text-white"
          : "bg-gray-200 text-gray-900";

        if (state === "green")
          bgClass = "bg-emerald-500 text-white shadow-md shadow-emerald-500/30";
        else if (state === "yellow")
          bgClass = "bg-amber-500 text-white shadow-md shadow-amber-500/30";
        else if (state === "gray")
          bgClass = "bg-gray-500/50 text-white dark:bg-gray-600/50";

        return (
          <button
            key={letter}
            className={`flex h-12 w-9 items-center justify-center rounded-lg font-bold transition-all active:scale-95 ${bgClass}`}
            onClick={() => handleKeyInput(letter.toUpperCase())}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden transition-all duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Head>
        {/* Primary Meta Tags */}
        <title>{SITE_TITLE}</title>
        <meta name="title" content={SITE_TITLE} />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="author" content="Dejny" />
        <meta name="theme-color" content={isDarkMode ? "#111827" : "#f9fafb"} />
        <link rel="canonical" href={SITE_URL} />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="943" />
        <meta property="og:site_name" content="Dejny's Wordly" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Additional */}
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </Head>
      {/* Background Gradient Animation */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
          backgroundSize: "400% 400%",
          animation: "moveGradient 15s ease infinite",
        }}
      />

      <Link
        href="https://dejny.eu"
        target="_blank"
        className="absolute left-1/2 top-6 z-10 -translate-x-1/2 transform bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 bg-clip-text text-2xl font-extrabold text-transparent transition-opacity hover:opacity-80"
      >
        Dejny.eu
      </Link>

      <div className="absolute right-6 top-6 z-10">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="rounded-full bg-white/20 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-white/30"
        >
          {isDarkMode ? (
            <MdNightsStay className="text-xl text-blue-300" />
          ) : (
            <MdWbSunny className="text-xl text-amber-400" />
          )}
        </button>
      </div>

      <div className="absolute left-6 top-6 z-10">
        <button
          onClick={restartGame}
          className="group rounded-full bg-white/20 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-white/30"
        >
          <MdRefresh
            className={`text-xl transition-transform group-hover:rotate-180 ${isDarkMode ? "text-white" : "text-gray-800"}`}
          />
        </button>
      </div>

      <div
        className={`glass-panel mx-4 w-full max-w-md rounded-2xl p-8 transition-colors duration-300`}
      >
        <h1 className="mb-8 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 bg-clip-text text-center text-5xl font-black text-transparent drop-shadow-sm">
          Wordly
        </h1>

        <div className="mb-8 select-none space-y-2">
          {Array.from({ length: 6 }, (_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length;

            return (
              <div key={rowIndex} className="flex justify-center gap-2">
                {Array.from({ length: 5 }, (_, colIndex) => {
                  const letter =
                    guesses[rowIndex]?.[colIndex] ??
                    (isCurrentRow ? currentGuess[colIndex] : "");
                  const feedbackVal = feedback[rowIndex]?.[colIndex];

                  let bgColor = isDarkMode
                    ? "bg-gray-700/50"
                    : "bg-gray-200/50";
                  let borderColor = isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300";
                  let textColor = isDarkMode ? "text-white" : "text-gray-900";

                  if (feedbackVal === "green") {
                    bgColor = "bg-emerald-500";
                    borderColor = "border-emerald-600";
                    textColor = "text-white";
                  } else if (feedbackVal === "yellow") {
                    bgColor = "bg-amber-500";
                    borderColor = "border-amber-600";
                    textColor = "text-white";
                  } else if (guesses[rowIndex]) {
                    // Incorrect letter already guessed
                    bgColor = isDarkMode ? "bg-gray-600" : "bg-gray-500";
                    borderColor = "border-transparent";
                    textColor = "text-white";
                  }

                  // Animation classes
                  const isFilled = !!letter && isCurrentRow;
                  const popClass = isFilled ? "animate-pop" : "";
                  const flipClass = feedbackVal ? "animate-flip" : "";
                  const delayStyle = feedbackVal
                    ? { animationDelay: `${colIndex * 100}ms` }
                    : {};

                  return (
                    <div
                      key={colIndex}
                      style={delayStyle}
                      className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl font-bold shadow-sm transition-all duration-300 ${bgColor} ${borderColor} ${textColor} ${popClass} ${flipClass} `}
                    >
                      {letter?.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {renderKeyboardRow("QWERTYUIOP")}
          {renderKeyboardRow("ASDFGHJKL")}
          <div className="flex justify-center space-x-1.5">
            <button
              className="flex h-12 items-center justify-center rounded-lg bg-red-500/80 px-4 font-bold text-white shadow-sm transition hover:bg-red-600/80 active:scale-95"
              onClick={() => handleKeyInput("BACKSPACE")}
            >
              Del
            </button>
            {renderKeyboardRow("ZXCVBNM")}
            <button
              className="flex h-12 items-center justify-center rounded-lg bg-emerald-500/90 px-4 font-bold text-white shadow-sm transition hover:bg-emerald-600/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => handleKeyInput("ENTER")}
              disabled={currentGuess.length !== 5}
            >
              Enter
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div
            className={`glass-panel animate-pop relative w-full max-w-sm rounded-2xl p-8 shadow-2xl ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-black/10"
            >
              &times;
            </button>

            <h2 className="mb-6 text-center text-3xl font-black">
              {guesses.includes(word) ? (
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                  You Won!
                </span>
              ) : (
                <span className="text-red-500">Game Over</span>
              )}
            </h2>

            <div className="mb-8 text-center">
              {guesses.includes(word) ? (
                <p className="text-lg opacity-90">
                  You guessed the word in{" "}
                  <strong className="text-xl text-emerald-500">
                    {guesses.length}
                  </strong>{" "}
                  attempts.
                </p>
              ) : (
                <p className="text-lg opacity-90">
                  The word was{" "}
                  <strong className="text-xl text-amber-500">{word}</strong>.
                </p>
              )}
            </div>

            <button
              onClick={restartGame}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>

    <section
      className={`px-4 py-16 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-300" : "bg-gray-50 text-gray-700"
      }`}
    >
      <div className="mx-auto max-w-2xl space-y-4 leading-relaxed">
        <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          How to play Wordly
        </h2>
        <p>
          Wordly is a free word-guessing game inspired by Wordle. Every round hides a random five-letter English
          word and you have six attempts to find it. Type a guess on your keyboard or tap the letters on the
          on-screen keyboard, then press Enter to submit it.
        </p>
        <p>
          After each guess the tiles change colour. A green tile means the letter is in the word and in the right
          spot. A yellow tile means the letter is in the word but in a different position. A grey tile means the
          letter is not in the word at all. The on-screen keyboard keeps track of the letters you have already
          tried, so you can narrow down the answer step by step.
        </p>
        <p>
          Unlike the daily original, Wordly lets you play as many rounds as you like. Hit the restart button or
          Play Again to get a new word straight away. You can switch between light and dark mode with the sun and
          moon button. No account is needed and the game works on phones, tablets and desktop browsers.
        </p>
      </div>
    </section>

    <footer
      className={`px-4 py-8 text-sm ${
        isDarkMode ? "bg-gray-950 text-gray-400" : "bg-white text-gray-600"
      }`}
    >
      <nav className="mx-auto flex max-w-2xl flex-wrap gap-x-6 gap-y-2">
        <span>
          Made by <a className="underline" href="https://dejny.eu">Dejny</a>
        </span>
        <a className="underline" href="https://roulette.dejny.eu">Roulette</a>
        <a className="underline" href="https://moodify.dejny.eu">Moodify</a>
        <a className="underline" href="https://calculator.dejny.eu">Calculator</a>
        <a className="underline" href="https://github.com/Dejnyyy/Dejnys-Word-Guess">Source on GitHub</a>
      </nav>
    </footer>
    </>
  );
}
