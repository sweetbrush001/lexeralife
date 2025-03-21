// ...existing code...

// Store both the current word and original word
const [currentWord, setCurrentWord] = useState('starfish');
const [originalWord, setOriginalWord] = useState('starfish');

const changeWord = (newWord) => {
    // Only update the current word, keep original for container count
    setCurrentWord(newWord);
};

// ...existing code...

return (
    <div className="game-container">
        {/* ...existing code... */}

        <WordDisplay
            currentWord={currentWord}
            originalWord={originalWord}
        />

        {/* ...existing code... */}
    </div>
);

// ...existing code...
