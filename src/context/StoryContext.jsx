import React, { createContext, useState, useEffect, useContext } from 'react';

const StoryContext = createContext();

export const useStory = () => useContext(StoryContext);

export const StoryProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState("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");
  const [novelData, setNovelData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [worldData, setWorldData] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [scenes, setScenes] = useState([]); // Array of { chapterId, scenes: [...] }
  const [visualDNA, setVisualDNA] = useState("Cinematic, High Contrast, Dark Fantasy, 8k, Unreal Engine 5 render");
  const [storyboardPrompts, setStoryboardPrompts] = useState([]);
  const [productionSettings, setProductionSettings] = useState({ aspect: '16:9', res: '4K', motion: 'High' });
  const [frameVisuals, setFrameVisuals] = useState({}); // { frameId: { type: 'image'|'video', url: '...' } }

  // Save API key                     
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  const value = {
    apiKey,
    setApiKey,
    novelData,
    setNovelData,
    chapters,
    setChapters,
    characters,
    setCharacters,
    worldData,
    setWorldData,
    timelineEvents,
    setTimelineEvents,
    scenes,
    setScenes,
    visualDNA,
    setVisualDNA,
    storyboardPrompts,
    setStoryboardPrompts,
    productionSettings,
    setProductionSettings,
    frameVisuals,
    setFrameVisuals
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};
