import { useState, useEffect } from 'react';
import { fetchLeetcodeSolution } from '../services/leetcodeService';
import './Solutions.css';

function Solutions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedCount, setLoadedCount] = useState(20);

    // Fetch initial batch of solutions
    useEffect(() => {
        const loadInitialSolutions = async () => {
            setIsLoading(true);
            const initialSolutions = [];
            
            // Load first 20 solutions
            for (let i = 1; i <= 20; i++) {
                const solution = await fetchLeetcodeSolution(i);
                initialSolutions.push(solution);
            }
            
            setItems(initialSolutions);
            setIsLoading(false);
        };
        
        loadInitialSolutions();
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading && loadedCount < 3000) {
                loadMoreSolutions();
            }
        }, { threshold: 0.1 });
        
        const sentinel = document.createElement('div');
        sentinel.style.height = '10px';
        document.querySelector('.solutions-grid')?.appendChild(sentinel);
        observer.observe(sentinel);
        
        return () => {
            observer.disconnect();
            sentinel.parentNode?.removeChild(sentinel);
        };
    }, [isLoading, loadedCount]);

    const loadMoreSolutions = async () => {
        setIsLoading(true);
        const newSolutions = [];
        const end = Math.min(loadedCount + 20, 3000);
        
        for (let i = loadedCount + 1; i <= end; i++) {
            const solution = await fetchLeetcodeSolution(i);
            newSolutions.push(solution);
        }
        
        setItems(prev => [...prev, ...newSolutions]);
        setLoadedCount(end);
        setIsLoading(false);
    };

    // Filter items based on search term
    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle card click
    const handleCardClick = async (item) => {
        if (!item.content || item.content.includes('not available')) {
            const updatedItem = await fetchLeetcodeSolution(item.id);
            setItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
            setSelectedCard(updatedItem);
        } else {
            setSelectedCard(item);
        }
        
        setCurrentIndex(filteredItems.findIndex(i => i.id === item.id));
        setIsFullScreen(false);
    };

    // Handle carousel navigation
    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        setCurrentIndex(newIndex);
        setSelectedCard(filteredItems[newIndex]);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % filteredItems.length;
        setCurrentIndex(newIndex);
        setSelectedCard(filteredItems[newIndex]);
    };

    // Close the flashcard
    const handleClose = () => {
        setSelectedCard(null);
        setIsFullScreen(false);
    };

    // Toggle full screen
    const toggleFullScreen = (e) => {
        e.stopPropagation();
        setIsFullScreen(!isFullScreen);
    };
    
    // Collapse fullscreen mode
    const collapseFullScreen = (e) => {
        e.stopPropagation();
        setIsFullScreen(false);
    };

    // Handle card fullscreen toggle
    const handleCardFullscreen = (e, card) => {
        e.stopPropagation();
        if (card.id !== selectedCard.id) {
            setSelectedCard(card);
            setCurrentIndex(filteredItems.findIndex(i => i.id === card.id));
        }
        setIsFullScreen(!isFullScreen);
    };

    // Get adjacent cards for the carousel
    const getAdjacentCards = () => {
        const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        const nextIndex = (currentIndex + 1) % filteredItems.length;
        
        return {
            prev: filteredItems[prevIndex],
            current: filteredItems[currentIndex],
            next: filteredItems[nextIndex]
        };
    };

    return (
        <div className="solutions-container">
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="Search solutions..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            
            {isLoading && items.length === 0 ? (
                <div className="loading-indicator">Loading solutions...</div>
            ) : (
                <div className="solutions-grid">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div 
                                key={item.id} 
                                className="solution-card"
                                onClick={() => handleCardClick(item)}
                            >
                                <h3>LeetCode #{item.id}</h3>
                                <p className="solution-description">{item.description}</p>
                                {item.content.includes('not available') && (
                                    <div className="solution-error">Click to try loading again</div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <h3>No solutions found</h3>
                            <p>Try a different search term</p>
                        </div>
                    )}
                    {isLoading && items.length > 0 && (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Flashcard Carousel */}
            {selectedCard && (
                <div className="flashcard-overlay">
                    <div className="flashcard-container">
                        <button className="close-button" onClick={handleClose}>×</button>
                        <div className="carousel-wrapper">
                            <div className="carousel-track">
                                {(() => {
                                    const { prev, current, next } = getAdjacentCards();
                                    return (
                                        <>
                                            <div className="carousel-card prev-card" onClick={handlePrev}>
                                                <button className="fullscreen-button" onClick={(e) => handleCardFullscreen(e, prev)}>
                                                    {isFullScreen && selectedCard.id === prev.id ? '⤓' : '⤢'}
                                                </button>
                                                <h3>LeetCode #{prev.id}</h3>
                                                <p className="solution-description">{prev.description}</p>
                                            </div>
                                            <div className={`carousel-card active-card ${isFullScreen ? 'fullscreen' : ''}`}>
                                                {isFullScreen ? (
                                                    <button className="collapse-button" onClick={collapseFullScreen}>⤢</button>
                                                ) : (
                                                    <button className="fullscreen-button" onClick={toggleFullScreen}>⤢</button>
                                                )}
                                                <h2>LeetCode #{current.id}</h2>
                                                <p className="flashcard-description">{current.description}</p>
                                                <div 
                                                    className="flashcard-detail"
                                                    dangerouslySetInnerHTML={{ __html: current.content }}
                                                />
                                            </div>
                                            <div className="carousel-card next-card" onClick={handleNext}>
                                                <button className="fullscreen-button" onClick={(e) => handleCardFullscreen(e, next)}>
                                                    {isFullScreen && selectedCard.id === next.id ? '⤓' : '⤢'}
                                                </button>
                                                <h3>LeetCode #{next.id}</h3>
                                                <p className="solution-description">{next.description}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="carousel-indicator">
                            <button className="indicator-arrow" onClick={handlePrev}>❮</button>
                            <span className="indicator-text">{currentIndex + 1} / {filteredItems.length}</span>
                            <button className="indicator-arrow" onClick={handleNext}>❯</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Solutions;