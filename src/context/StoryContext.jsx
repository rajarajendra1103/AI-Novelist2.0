import React, { createContext, useState, useEffect, useContext } from 'react';

const StoryContext = createContext();

export const useStory = () => useContext(StoryContext);

export const StoryProvider = ({ children }) => {
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

  const value = {
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
