import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Search, 
  Image, 
  FileText, 
  Database, 
  Sparkles, 
  Clock, 
  MapPin, 
  Wind, 
  Sun, 
  Users,
  ChevronRight,
  Loader2,
  Trash2,
  BookCopy,
  Maximize2,
  Minimize2,
  Video,
  Copy,
  Check,
  Film,
  Compass
} from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { generateAIResponse } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const SceneSystem = () => {
  const navigate = useNavigate();
  const { 
    chapters, 
    scenes, 
    setScenes, 
    apiKey,
    visualDNA,
    setVisualDNA
  } = useStory();
  const [activeTab, setActiveTab] = useState('Detection'); // Detection, Background, Screenplay
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingScreenplay, setIsGeneratingScreenplay] = useState(false);
  const [screenplayContent, setScreenplayContent] = useState("");
  const [showScreenplay, setShowScreenplay] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const currentChapter = chapters[selectedChapter];
  const currentChapterScenes = scenes.find(s => s.chapterId === selectedChapter)?.scenes || [];

  const tabs = [
    { id: 'Detection', icon: Search, label: 'Scene Detection' },
    { id: 'Background', icon: Image, label: 'Scene Background' },
    { id: 'Screenplay', icon: FileText, label: 'Screenplay' }
  ];

  const handleExtractScenes = async () => {
    if (!apiKey || !currentChapter?.content) return;
    setIsExtracting(true);

    const systemPrompt = "You are a cinematic director and environment designer. Segment the chapter into logical scenes and extract visual details.";
    const userPrompt = `
      CHAPTER CONTENT:
      ${currentChapter.content}

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
          const filtered = prev.filter(s => s.chapterId !== selectedChapter);
          return [...filtered, { chapterId: selectedChapter, scenes: result.scenes }];
        });
      }
    } catch (e) {
      console.error("Extraction failed", e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateScreenplay = async () => {
    if (!apiKey || !currentChapter?.content) return;
    setIsGeneratingScreenplay(true);
    setShowScreenplay(true);

    const systemPrompt = "You are a professional screenwriter. Convert the novel chapter into a cinematic screenplay format.";
    const userPrompt = `
      NOVEL CONTENT:
      ${currentChapter.content}

      SCENE BREAKDOWN:
      ${JSON.stringify(currentChapterScenes)}

      Write a full screenplay version.
    `;

    try {
      const screenplay = await generateAIResponse(userPrompt, apiKey, systemPrompt);
      setScreenplayContent(screenplay);
    } catch (e) {
      console.error("Screenplay failed", e);
    } finally {
      setIsGeneratingScreenplay(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="scene-system animate-fade-in" style={{ paddingBottom: '10rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className="text-gradient">Director's Scene System</h1>
            <p>Cinematic orchestration and environmental continuity.</p>
          </div>
          <button onClick={() => navigate('/home')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Compass size={18} /> Home
          </button>
        </div>

        {/* Mode Toggle Buttons */}
                <div className="glass-panel" style={{ padding: '6px', borderRadius: '16px', display: 'flex', gap: '6px', background: 'rgba(16, 185, 129, 0.05)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Chapter Selector */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {chapters.map((ch, i) => (
            <button
              key={i}
              onClick={() => setSelectedChapter(i)}
              className="glass-panel"
              style={{
                padding: '14px 28px',
                whiteSpace: 'nowrap',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: selectedChapter === i ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                background: selectedChapter === i ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                color: selectedChapter === i ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              Chapter {i + 1}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* SECTION 1: SCENE DETECTION */}
          {activeTab === 'Detection' && (
            <motion.div 
              key="detection"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid-2"
              style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}
            >
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Search size={22} color="var(--primary-color)" /> Detection Controls
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                  Analyze the prose to automatically identify logical scene shifts, temporal jumps, and major location changes.
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginBottom: '2rem' }}
                  onClick={handleExtractScenes}
                  disabled={isExtracting || !currentChapter?.content}
                >
                  {isExtracting ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Scan Chapter {selectedChapter + 1}</>}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentChapterScenes.map((scene, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--primary-color)' }}>
                      <div style={{ fontWeight: 700, color: 'white', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        Scene {idx + 1}: {scene.name}
                        <Clock size={14} opacity={0.5} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{scene.summary}</p>
                    </div>
                  ))}
                  {currentChapterScenes.length === 0 && !isExtracting && (
                     <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.4 }}>
                        <Layout size={40} style={{ margin: '0 auto 1rem' }} />
                        <p>No scenes detected.</p>
                     </div>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Maximize2 size={20} /> Narrative Flow</h3>
                    <div className="badge">LIVE ADAPTATION</div>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                    {currentChapterScenes.map((scene, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            background: 'var(--bg-color-alt)', 
                            border: '2px solid var(--primary-color)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '0.85rem',
                            fontWeight: 900
                        }}>
                            {idx + 1}
                        </div>
                        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{scene.name}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{scene.location}</span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{scene.time}</span>
                            </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Visual Line */}
                    <div style={{ 
                        position: 'absolute', 
                        left: '19px', 
                        top: '40px', 
                        bottom: '40px', 
                        width: '2px', 
                        background: 'linear-gradient(180deg, var(--primary-color) 0%, transparent 100%)',
                        zIndex: -1,
                        opacity: 0.3
                    }} />
                    
                    {currentChapterScenes.length === 0 && (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Scan chapter to generate flow map.</p>
                        </div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}

          {/* SECTION 2: SCENE BACKGROUND */}
          {activeTab === 'Background' && (
            <motion.div 
              key="background"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Image size={24} color="var(--accent-color)" /> Environmental Attributes
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Visual context ensuring continuity across descriptive prose.</p>
                </div>
                
                {/* Background Context Engine Button */}
                <button 
                    className="btn-secondary" 
                    style={{ 
                        padding: '12px 24px',
                        border: '1px solid var(--primary-color)', 
                        color: 'var(--primary-color)', 
                        background: 'rgba(16, 185, 129, 0.05)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                    onClick={() => alert("Synchronizing environmental metadata with world-building records...")}
                >
                    <Database size={18} /> Background Context Engine
                </button>
              </div>

              <div className="grid-2" style={{ gap: '2rem' }}>
                {currentChapterScenes.map((scene, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid var(--primary-color)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, transparent 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '1.4rem' }}>{scene.name}</h4>
                        <div className="badge" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>SCENE {idx + 1}</div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="bg-field">
                            <label><MapPin size={12} /> Location</label>
                            <p>{scene.location}</p>
                        </div>
                        <div className="bg-field">
                            <label><Sun size={12} /> Lighting</label>
                            <p>{scene.lighting}</p>
                        </div>
                        <div className="bg-field">
                            <label><Wind size={12} /> Weather</label>
                            <p>{scene.weather}</p>
                        </div>
                        <div className="bg-field">
                            <label><Layout size={12} /> Architecture</label>
                            <p>{scene.architecture}</p>
                        </div>
                        <div className="bg-field" style={{ gridColumn: 'span 2' }}>
                            <label><Sparkles size={12} /> Atmosphere</label>
                            <p>{scene.atmosphere}</p>
                        </div>
                        <div className="bg-field" style={{ gridColumn: 'span 2' }}>
                            <label><Users size={12} /> Characters Present</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                {scene.characters_present?.map(c => <span className="badge" key={c} style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{c}</span>)}
                            </div>
                        </div>
                    </div>
                  </div>
                ))}
                {currentChapterScenes.length === 0 && (
                    <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '6rem', textAlign: 'center', opacity: 0.5 }}>
                        <Image size={56} style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }} />
                        <p style={{ fontSize: '1.1rem' }}>No environmental background data found for this chapter.</p>
                        <button onClick={() => setActiveTab('Detection')} className="btn-ghost" style={{ marginTop: '1rem', color: 'var(--primary-color)' }}>Run Scene Detection first →</button>
                    </div>
                )}
              </div>
            </motion.div>
          )}


          {/* SECTION 3: SCREENPLAY */}
          {activeTab === 'Screenplay' && (
            <motion.div 
              key="screenplay"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="glass-panel" style={{ padding: '4rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 2rem'
                }}>
                    <BookCopy size={32} color="#3b82f6" />
                </div>
                <h2 style={{ fontSize: '2rem' }}>Screenplay Generator</h2>
                <p style={{ maxWidth: '600px', margin: '1rem auto 2.5rem', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    Convert your chapter prose into a production-ready screenplay format. This uses the detected scene backgrounds for stage directions and atmospheric cues.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '800px', margin: '0 auto 3.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Structure</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{currentChapterScenes.length} SCENES</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Continuity</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>LOCKED</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Format</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>DIRECTOR V1</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button 
                        className="btn btn-primary" 
                        style={{ padding: '1.2rem 3.5rem', fontSize: '1.1rem', background: '#3b82f6' }}
                        onClick={handleGenerateScreenplay}
                        disabled={isGeneratingScreenplay || !currentChapter?.content}
                    >
                        {isGeneratingScreenplay ? <Loader2 className="animate-spin" /> : 'Transform to Screenplay'}
                    </button>
                    {screenplayContent && (
                        <button className="btn-secondary" onClick={() => setShowScreenplay(true)}>View Script</button>
                    )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screenplay Overlay */}
      <AnimatePresence>
        {showScreenplay && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.95)', 
            backdropFilter: 'blur(30px)',
            zIndex: 3000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', padding: '0', background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'white' }}>{currentChapter.title} - Script Preview</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cinematic Translation Active</p>
                </div>
                <button onClick={() => setShowScreenplay(false)} className="btn-ghost" style={{ padding: '0.5rem', color: 'white' }}><Minimize2 size={28} /></button>
              </div>

              <div style={{ flex: 1, padding: '4rem', overflowY: 'auto', background: '#fcfcfc', color: '#111', fontFamily: '"Courier Prime", Courier, monospace', borderRadius: '0 0 12px 12px' }}>
                {isGeneratingScreenplay ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={64} className="animate-spin" color="#333" />
                    <p style={{ marginTop: '2rem', fontSize: '1.2rem', fontWeight: 600 }}>Casting scenes into format...</p>
                  </div>
                ) : (
                  <div style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.5' }}>
                    <ReactMarkdown>{screenplayContent}</ReactMarkdown>
                  </div>
                )}
              </div>

              <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', background: '#111' }}>
                <button className="btn btn-primary" style={{ background: '#333' }} onClick={() => {
                  const blob = new Blob([screenplayContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Screenplay_CH${selectedChapter + 1}.txt`;
                  a.click();
                }}>Download Script</button>
                <button onClick={() => setShowScreenplay(false)} className="btn btn-primary">Close Preview</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .bg-field {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem;
            background: rgba(255,255,255,0.02);
            border-radius: 8px;
        }
        .bg-field label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--accent-color);
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            opacity: 0.8;
        }
        .bg-field p {
            font-size: 1rem;
            color: white;
            line-height: 1.5;
            font-weight: 500;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SceneSystem;
