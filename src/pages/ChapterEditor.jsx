import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  PenTool, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  MessageSquare,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Trash2,
  PlusCircle,
  Users,
  Search,
  BookCopy
} from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { generateAIResponse } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const ChapterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    apiKey, 
    chapters, 
    setChapters, 
    characters, 
    setCharacters, 
    novelData,
    worldData,
    setWorldData,
    timelineEvents,
    setTimelineEvents,
    scenes,
    setScenes
  } = useStory();
  
  const currentChapterIndex = parseInt(id);
  const currentChapter = chapters[currentChapterIndex];
  
  const [content, setContent] = useState(currentChapter?.content || "");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExtractingScenes, setIsExtractingScenes] = useState(false);
  const [isGeneratingScreenplay, setIsGeneratingScreenplay] = useState(false);
  const [showScreenplay, setShowScreenplay] = useState(false);
  const [screenplayContent, setScreenplayContent] = useState("");
  const [syncComplete, setSyncComplete] = useState(false);
  const [error, setError] = useState(null);
  const [selection, setSelection] = useState({ start: 0, end: 0, text: "" });
  const [detectedCharacters, setDetectedCharacters] = useState({ new_characters: [], existing_updates: [] });
  const [showCharacterCards, setShowCharacterCards] = useState(false);
  const [scanningCharacters, setScanningCharacters] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    if (currentChapter) {
        setContent(currentChapter.content || "");
    }
  }, [id, chapters]);

  const handleManualContentChange = (e) => {
    setContent(e.target.value);
  };

  const saveChapter = () => {
    setSaving(true);
    const updatedChapters = [...chapters];
    updatedChapters[currentChapterIndex] = { ...currentChapter, content };
    setChapters(updatedChapters);
    setTimeout(() => setSaving(false), 800);
  };

  const syncStoryState = async () => {
    if (!apiKey || !content) return;
    setIsSyncing(true);
    setSyncComplete(false);

    const systemPrompt = "You are a master Archivist and Narrative Continuity AI. Analyze the chapter content to update the story's encyclopedia.";
    const userPrompt = `
      CHAPTER CONTENT:
      ${content.substring(0, 10000)}

      CURRENT STORY DATA:
      - World: ${JSON.stringify(worldData)}
      - Timeline Event Count: ${timelineEvents?.length || 0}
      - Characters: ${JSON.stringify(characters.map(c => ({ id: c.id, name: c.name })))}

      TASK:
      1. Identify new TIMELINE EVENTS (Milestones, historical revelations, major plot points).
      2. Detect WORLD UPDATES (New locations, magic rules discovered, political shifts).
      3. Update CHARACTER ARCS & RELATIONSHIPS (Family, Love, Friendship status changes).

      Format output as JSON:
      {
        "timeline_events": [
          { "title": "...", "description": "...", "category": "Chapter|Major|History|Character", "time": "...", "impact": "..." }
        ],
        "world_updates": {
          "new_features": ["..."],
          "summary_revision": "..."
        },
        "character_updates": [
          { "id": "...", "development": "...", "relationship_shift": { "with_id": "...", "type": "Family|Love|Friendship", "description": "..." } }
        ]
      }
    `;

    try {
      const result = await generateAIResponse(userPrompt, apiKey, systemPrompt, {
        type: "object",
        properties: {
          timeline_events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string", enum: ["Chapter", "Major", "History", "Character"] },
                time: { type: "string" },
                impact: { type: "string" }
              }
            }
          },
          world_updates: {
            type: "object",
            properties: {
              new_features: { type: "array", items: { type: "string" } },
              summary_revision: { type: "string" }
            }
          },
          character_updates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                development: { type: "string" },
                relationship_shift: {
                  type: "object",
                  properties: {
                    with_id: { type: "string" },
                    type: { type: "string", enum: ["Family", "Love", "Friendship"] },
                    description: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      if (result) {
        // 1. Update Timeline
        if (result.timeline_events?.length > 0) {
          const newEvents = result.timeline_events.map(ev => ({ ...ev, chapterId: currentChapterIndex }));
          setTimelineEvents(prev => [...(prev || []), ...newEvents]);
        }

        // 2. Update World
        if (result.world_updates) {
          setWorldData(prev => ({
            ...prev,
            customFeatures: [...(prev?.customFeatures || []), ...(result.world_updates.new_features || [])],
            aiSummary: result.world_updates.summary_revision || prev?.aiSummary
          }));
        }

        // 3. Update Characters & Relationships
        if (result.character_updates?.length > 0) {
          setCharacters(prev => prev.map(char => {
            const update = result.character_updates.find(u => u.id === char.id);
            if (update) {
              const updatedRelationships = [...(char.relationships || [])];
              if (update.relationship_shift) {
                const relIndex = updatedRelationships.findIndex(r => r.targetId === update.relationship_shift.with_id);
                if (relIndex > -1) {
                  updatedRelationships[relIndex] = { ...updatedRelationships[relIndex], type: update.relationship_shift.type, description: update.relationship_shift.description };
                } else {
                  updatedRelationships.push({ targetId: update.relationship_shift.with_id, type: update.relationship_shift.type, description: update.relationship_shift.description });
                }
              }

              return {
                ...char,
                development: [...(char.development || []), `Chapter ${currentChapterIndex + 1}: ${update.development}`],
                relationships: updatedRelationships
              };
            }
            return char;
          }));
        }

        setSyncComplete(true);
        setTimeout(() => setSyncComplete(false), 3000);
      }
    } catch (e) {
      console.error("Narrative sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const extractScenes = async () => {
    if (!apiKey || !content) return;
    setIsExtractingScenes(true);

    const systemPrompt = "You are a cinematic director and environment designer. Segment the chapter into logical scenes and extract visual details.";
    const userPrompt = `
      CHAPTER CONTENT:
      ${content}

      PREVIOUS SCENE CONTEXT (for continuity):
      ${JSON.stringify(scenes.filter(s => s.chapterId < currentChapterIndex).slice(-3))}

      TASK:
      1. Divide this chapter into chronological scenes.
      2. For each scene, provide structured background details.
      
      Format output as JSON:
      {
        "scenes": [
          {
            "name": "Brief Title",
            "location": "...",
            "time": "...",
            "lighting": "...",
            "weather": "...",
            "architecture": "...",
            "atmosphere": "...",
            "characters_present": ["..."],
            "summary": "Key action in this scene"
          }
        ]
      }
    `;

    try {
      const result = await generateAIResponse(userPrompt, apiKey, systemPrompt, {
        type: "object",
        properties: {
          scenes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                location: { type: "string" },
                time: { type: "string" },
                lighting: { type: "string" },
                weather: { type: "string" },
                architecture: { type: "string" },
                atmosphere: { type: "string" },
                characters_present: { type: "array", items: { type: "string" } },
                summary: { type: "string" }
              }
            }
          }
        }
      });

      if (result && result.scenes) {
        setScenes(prev => {
          const filtered = prev.filter(s => s.chapterId !== currentChapterIndex);
          return [...filtered, { chapterId: currentChapterIndex, scenes: result.scenes }];
        });
      }
    } catch (e) {
      console.error("Scene extraction failed", e);
    } finally {
      setIsExtractingScenes(false);
    }
  };

  const generateScreenplay = async () => {
    if (!apiKey || !content) return;
    setIsGeneratingScreenplay(true);
    setShowScreenplay(true);

    const chapterScenes = scenes.find(s => s.chapterId === currentChapterIndex)?.scenes || [];
    
    const systemPrompt = "You are a professional screenwriter. Convert the novel chapter into a cinematic screenplay format (EXT. LOCATION - TIME). Use parentheticals for emotion and action lines for visual flow.";
    const userPrompt = `
      NOVEL CONTENT:
      ${content}

      SCENE BREAKDOWN:
      ${JSON.stringify(chapterScenes)}

      Write a full screenplay version of this chapter. Use standard screenplay formatting:
      SCENE HEADINGS (INT. or EXT.)
      Action lines
      CHARACTER NAMES
      (Parentheticals)
      Dialogue
    `;

    try {
      const screenplay = await generateAIResponse(userPrompt, apiKey, systemPrompt);
      setScreenplayContent(screenplay);
    } catch (e) {
      console.error("Screenplay generation failed", e);
    } finally {
      setIsGeneratingScreenplay(false);
    }
  };

  const handleGenerateChapter = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);

    const prevChapters = chapters.slice(0, currentChapterIndex).map(c => `Chapter ${c.chapter}: ${c.title}\n${c.content?.substring(0, 1000) || ""}`).join('\n\n');
    
    const systemPrompt = `You are a high-level creative writing AI. Your goal is to write a compelling, vivid chapter of a novel. 
    Maintain consistency with the overall story outline and previous chapter contexts. 
    Use the provided Seed Prompt to guide the specific events of this chapter.
    Output the chapter in clear Markdown format.`;

    const userPrompt = `
      Novel Title: ${novelData.title}
      Overall Outline: ${JSON.stringify(novelData.outline)}
      
      Current Chapter: ${currentChapterIndex + 1}
      Chapter Title: ${currentChapter.title}
      Chapter Goal/Summary: ${currentChapter.summary}
      
      Previous Chapter Context: 
      ${prevChapters || "This is the start of the novel."}
      
      (Proceed with writing the chapter following the established plot and character arcs)
      
      Write the full content of this chapter now (~1000-1500 words). 
      Focus on sensory details, dialogue, and advancing the plot toward the chapter goal.
    `;

    try {
      const text = await generateAIResponse(userPrompt, apiKey, systemPrompt);
      setContent(text);
      handleDetectCharacters(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDetectCharacters = async (text) => {
    if (!apiKey || !text) return;

    setScanningCharacters(true);
    setShowCharacterCards(true); // Show the section so user sees something is happening

    const systemPrompt = "You are a literary analysis AI. Identify characters and their developments in the provided text.";
    const userPrompt = `Analyze this chapter text and identify characters involved. 
    
    Current Characters in Hub: ${JSON.stringify(characters.map(c => ({ name: c.name, id: c.id })))}

    For each character found:
    1. If they are ALREADY in the hub, provide a "development" snippet (how they changed or what we learned new).
    2. If they are NEW, provide a name and a brief "initial_description".
    
    Text snippet: ${text.substring(0, 8000)}
    
    Format as JSON: 
    { 
      "new_characters": [{ "name": "...", "description": "...", "suggested_id": "..." }],
      "existing_updates": [{ "id": "...", "name": "...", "development": "..." }]
    }`;

    try {
      const result = await generateAIResponse(userPrompt, apiKey, systemPrompt, {
        type: "object",
        properties: {
          new_characters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                suggested_id: { type: "string" }
              }
            }
          },
          existing_updates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                development: { type: "string" }
              }
            }
          }
        }
      });
      setDetectedCharacters(result || { new_characters: [], existing_updates: [] });
    } catch (e) {
      console.error("Char detection failed", e);
    } finally {
      setScanningCharacters(false);
    }
  };

  const handleRewrite = async (mode) => {
    const selectedText = window.getSelection().toString() || content.substring(0, 5000);
    if (!selectedText) return;

    setLoading(true);
    const systemPrompt = `You are a professional editor. Rewrite the following text in a ${mode} tone. Maintain the original meaning but enhance the prose, imagery, and emotional impact.`;
    const userPrompt = `Original text: "${selectedText}"`;

    try {
      const rewritten = await generateAIResponse(userPrompt, apiKey, systemPrompt);
      if (window.getSelection().toString()) {
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(rewritten));
        setContent(editorRef.current.value);
      } else {
        setContent(rewritten);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addCharacterToHub = (char) => {
    const newChar = {
        id: char.suggested_id || `char_${Date.now()}_${char.name.replace(/\s+/g, '_')}`,
        name: char.name,
        description: char.description,
        personality: "TBD",
        firstAppearance: `Chapter ${currentChapterIndex + 1}`,
        role: "Supporting",
        development: [`Added in Chapter ${currentChapterIndex + 1}: ${char.description}`]
    };
    setCharacters([...characters, newChar]);
    setDetectedCharacters(prev => ({
        ...prev,
        new_characters: prev.new_characters.filter(p => p.name !== char.name)
    }));
  };

  const updateCharacterInHub = (update) => {
    const updatedCharacters = characters.map(c => {
        if (c.id === update.id) {
            return {
                ...c,
                development: [...(c.development || []), `Chapter ${currentChapterIndex + 1}: ${update.development}`]
            };
        }
        return c;
    });
    setCharacters(updatedCharacters);
    setDetectedCharacters(prev => ({
        ...prev,
        existing_updates: prev.existing_updates.filter(p => p.id !== update.id)
    }));
  };

  if (!currentChapter) return <div>Chapter not found.</div>;

  return (
    <div className="editor-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Bar */}
      <header className="glass-panel" style={{ 
        padding: '0.75rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        borderRadius: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Compass size={18} /> Home
            </button>
            <button onClick={() => navigate('/overview')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <ChevronLeft size={18} /> Overview
            </button>
          </div>
          <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Chapter {currentChapterIndex + 1}</span>
            <h2 style={{ fontSize: '1.1rem', color: 'white' }}>{currentChapter.title}</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {content.split(/\s+/).filter(x => x).length} words
          </div>
          <button 
            onClick={syncStoryState} 
            disabled={isSyncing}
            className="btn-secondary" 
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px',
              borderColor: syncComplete ? '#10b981' : 'rgba(16, 185, 129, 0.3)',
              background: syncComplete ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: syncComplete ? '#10b981' : 'var(--primary-color)'
            }}
          >
            {isSyncing ? (
              <><Loader2 size={18} className="animate-spin" /> Syncing...</>
            ) : syncComplete ? (
              <><CheckCircle2 size={18} /> Synced</>
            ) : (
              <><Sparkles size={18} /> Sync Narrative</>
            )}
          </button>
          <button onClick={saveChapter} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
            {saving ? <CheckCircle2 size={18} color="#10b981" /> : <><Save size={18} /> Save</>}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Editor Area */}
        <div style={{ flex: 1, position: 'relative', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '4rem 0' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto', minHeight: '100%' }}>
            <textarea 
              ref={editorRef}
              value={content}
              onChange={handleManualContentChange}
              placeholder="The story starts here..."
              style={{
                width: '100%',
                minHeight: '80vh',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-color)',
                fontSize: '1.15rem',
                lineHeight: '1.8',
                fontFamily: 'Playfair Display, serif',
                padding: '0',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>
        </div>

        <aside className="glass-panel" style={{ width: '380px', height: '100%', borderLeft: '1px solid var(--border-color)', borderRadius: 0, padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }} 
              onClick={handleGenerateChapter}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={16} /> Generate Chapter Content</>}
            </button>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PenTool size={18} color="var(--secondary-color)" /> Writing Assistant
              </h3>
              <div className="grid-2" style={{ gap: '0.5rem' }}>
                <button onClick={() => handleRewrite('Dramatic')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>Dramatic</button>
                <button onClick={() => handleRewrite('Suspenseful')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>Suspenseful</button>
                <button onClick={() => handleRewrite('Emotional')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>Emotional</button>
                <button onClick={() => handleRewrite('Humorous')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>Humorous</button>
                <button onClick={() => handleRewrite('Flowing')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem', gridColumn: 'span 2' }}>Improve Flow</button>
                <button 
                  onClick={() => handleDetectCharacters(content)} 
                  className="btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '0.5rem', gridColumn: 'span 2', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  disabled={scanningCharacters}
                >
                  {scanningCharacters ? <Loader2 size={16} className="animate-spin" /> : <><Users size={16} /> Scan for Characters</>}
                </button>
              </div>
          </div>

          <AnimatePresence>
            {showCharacterCards && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}
              >
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} /> Narrator Insights
                </h4>
                
                {scanningCharacters ? (
                   <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                      <p style={{ fontSize: '0.8rem' }}>Analyzing chapter for characters...</p>
                   </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* New Characters */}
                    {detectedCharacters.new_characters?.map((char, i) => (
                      <div key={`new-${i}`} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-color)', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span className="badge" style={{ fontSize: '0.6rem' }}>NEW CHARACTER</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {char.suggested_id || 'Generating...'}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: 'white' }}>{char.name}</div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: '1.4' }}>{char.description}</div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button 
                            onClick={() => addCharacterToHub(char)} 
                            className="btn-secondary" 
                            style={{ padding: '6px 16px', fontSize: '0.8rem', fontWeight: 600, flex: 1 }}
                          >
                            ADD
                          </button>
                          <button 
                            onClick={() => setDetectedCharacters(prev => ({ ...prev, new_characters: prev.new_characters.filter(x => x.name !== char.name)}))} 
                            className="btn-ghost" 
                            style={{ padding: '6px 16px', fontSize: '0.8rem', flex: 1, border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                          >
                            IGNORE
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Updates */}
                    {detectedCharacters.existing_updates?.map((upd, i) => {
                      const charName = characters.find(c => c.id === upd.id)?.name || "Unknown";
                      return (
                        <div key={`upd-${i}`} className="card" style={{ padding: '1rem', borderLeft: '4px solid #10b981' }}>
                          <span className="badge" style={{ fontSize: '0.6rem', marginBottom: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>DEVELOPMENT</span>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{charName}</div>
                          <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>{upd.development}</div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => updateCharacterInHub(upd)} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>UPDATE PROFILE</button>
                            <button onClick={() => setDetectedCharacters(prev => ({ ...prev, existing_updates: prev.existing_updates.filter(x => x.id !== upd.id)}))} className="btn-ghost" style={{ fontSize: '0.75rem', color: 'white' }}>KEEP ORIGINAL</button>
                          </div>
                        </div>
                      );
                    })}

                    {(!detectedCharacters.new_characters?.length && !detectedCharacters.existing_updates?.length) && (
                      <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
                        No new character activity detected in this section.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </aside>
      </div>

      {/* Screenplay Overlay */}
      <AnimatePresence>
        {showScreenplay && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.9)', 
            backdropFilter: 'blur(20px)',
            zIndex: 2000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', padding: '0' }}
            >
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem' }}>Screenplay Conversion</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chapter {currentChapterIndex + 1}: {currentChapter.title}</p>
                </div>
                <button onClick={() => setShowScreenplay(false)} className="btn-ghost" style={{ padding: '0.5rem' }}><Minimize2 size={24} /></button>
              </div>

              <div style={{ flex: 1, padding: '3rem', overflowY: 'auto', background: '#f5f5f5', color: '#1a1a1a', fontFamily: '"Courier Prime", Courier, monospace' }}>
                {isGeneratingScreenplay ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={48} className="animate-spin" color="#333" />
                    <p style={{ marginTop: '1.5rem', fontSize: '1.1rem' }}>Translating prose into cinema...</p>
                  </div>
                ) : (
                  <div style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.4' }}>
                    <ReactMarkdown>{screenplayContent}</ReactMarkdown>
                  </div>
                )}
              </div>

              <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn-secondary" style={{ color: 'var(--primary-color)' }} onClick={() => {
                  const blob = new Blob([screenplayContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Chapter_${currentChapterIndex + 1}_Screenplay.txt`;
                  a.click();
                }}>Download Script</button>
                <button onClick={() => setShowScreenplay(false)} className="btn btn-primary">Close Preview</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Narrative Progress Bar */}
      <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
          <div style={{ 
            height: '100%', 
            width: `${((currentChapterIndex + 1) / chapters.length) * 100}%`, 
            background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
          }} />
      </div>
    </div>
  );
};

export default ChapterEditor;
