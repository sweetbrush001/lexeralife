import React from 'react';

const WordDisplay = ({ currentWord, originalWord }) => {
    // Use originalWord for determining container count
    // but display letters from currentWord
    const containerCount = originalWord.length;

    return (
        <div className="word-container">
            {/* Display containers based on original word length */}
            {[...Array(containerCount)].map((_, index) => (
                <div key={index} className="letter-container">
                    {index < currentWord.length ? currentWord[index] : ''}
                </div>
            ))}
        </div>
    );
};

export default WordDisplay;
