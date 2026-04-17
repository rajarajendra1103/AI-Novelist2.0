import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  MapPin, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Zap, 
  ChevronRight, 
  Save, 
  Plus, 
  Trash2,
  Sword,
  Rocket,
  Ghost,
  GraduationCap,
  ArrowLeft,
  Loader2,
  Compass
} from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { generateAIResponse } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

const WorldBuilder = () => {
  const { worldData, setWorldData, apiKey, novelData, chapters } = useStory();
  const navigate = useNavigate();
  const [step, setStep] = useState(worldData ? 2 : 0); // 0: Theme, 1: Interview, 2: Review
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [customFeatures, setCustomFeatures] = useState(worldData?.customFeatures || []);
  const [newFeature, setNewFeature] = useState("");

  // Sync custom features if worldData is updated externally (e.g., from sync)
  React.useEffect(() => {
    if (worldData?.customFeatures) {
      setCustomFeatures(worldData.customFeatures);
    }
  }, [worldData]);

  const themes = [
    { name: "Medieval Fantasy", icon: Sword, color: "#fbbf24", desc: "Magic, kingdoms, and ancient myths." },
    { name: "Sci-Fi Galaxy", icon: Rocket, color: "#3b82f6", desc: "Interstellar travel, futuristic tech, and alien worlds." },
    { name: "Dystopian Future", icon: Ghost, color: "#ef4444", desc: "Societal collapse, survival, and high-tech oppression." },
    { name: "Magical Academy", icon: GraduationCap, color: "#10b981", desc: "Hidden schools, youthful wonder, and arcane secrets." }
  ];

  const startInterview = async (selectedTheme) => {
    const finalTheme = selectedTheme || customTheme;
    if (!finalTheme) return;

    setTheme(finalTheme);
    setLoading(true);
    setStep(1);

    const systemPrompt = `You are an elite World-Building Architect. Your task is to extract the foundational "DNA" of a fictional universe.
    You create deep, structural questions that force the creator to think about the systemic nature of their world.
    Focus on:
    1. Geopolitics: Number of kingdoms/countries and their major capital cities.
    2. Linguistics: Major language groups and how they influence trade/culture.
    3. Power Systems: Detailed inclusion of Magic or Tech systems and their laws.
    4. Cultural Identity: Specific cultural groups, their core values, customs, and religious/philosophical beliefs.
    5. Daily Life: How these systems affect a common citizen.`;

    const userPrompt = `Generate exactly 8 specific, architectural interview questions to build a world with the theme: "${finalTheme}". 
    
    The questions MUST cover:
    - Political landscape (Kingdoms/Countries/Territories)
    - Major urban centers (Cities/Strongholds)
    - Linguistic diversity
    - Energy/Power source (Magic vs Technology vs Hybrid)
    - Ethnic/Cultural groups and their distinct values
    - Religious or philosophical systems
    - Social customs or traditions
    - A unique global "anomaly" or specific world rule
    
    Make the questions immersive and tailored to the theme "${finalTheme}".
    
    Format as JSON: { "questions": ["...", "...", "...", "...", "...", "...", "...", "..."] }`;

    try {
      const result = await generateAIResponse(userPrompt, apiKey, systemPrompt, {
        type: "object",
        properties: {
          questions: { type: "array", items: { type: "string" }, minItems: 8, maxItems: 8 }
        }
      });
      setQuestions(result.questions);
    } catch (e) {
      console.error(e);
      alert("Failed to connect to AI. Please check your API key.");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const updatedAnswers = { ...answers, [questions[currentQ]]: currentAnswer };
    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finalizeWorld(updatedAnswers);
    }
  };

  const finalizeWorld = async (finalAnswers) => {
    setLoading(true);
    const summaryPrompt = `Based on these world-building details for a "${theme}" world, write a cohesive 3-sentence summary that defines the world's atmosphere and core identity.
    
    Details:
    ${Object.entries(finalAnswers).map(([q, a]) => `${q}: ${a}`).join("\n")}
    `;

    try {
      const result = await generateAIResponse(summaryPrompt, apiKey, "You are a master storyteller.", {
        type: "object",
        properties: {
          summary: { type: "string" }
        }
      });
      const data = {
        theme,
        answers: finalAnswers,
        aiSummary: result.summary,
        customFeatures: []
      };
      setWorldData(data);
      setStep(2);
    } catch (e) {
      console.error(e);
      const data = { theme, answers: finalAnswers, customFeatures: [] };
      setWorldData(data);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const generateWorldAutomatically = async (specificTheme) => {
    const finalTheme = specificTheme || customTheme || theme || (novelData?.title + " world");
    
    setLoading(true);
    setStep(1);

    const systemPrompt = "You are a world-building architect. Create a detailed world based on a core theme or story context.";
    
    let contextPrompt = `Build a world for the theme: "${finalTheme}"`;
    if (novelData?.generatedOutline) {
      contextPrompt = `Based on this story outline, generate a deep world-building codex:
      Title: ${novelData.title}
      Description: ${novelData.description}
      Outline: ${novelData.generatedOutline.story_arc}
      Theme Context: ${finalTheme}`;
    }

    const userPrompt = `${contextPrompt}
    
    Generate exactly 8 architectural questions and their detailed answers that define this world.
    Also provide a 3-sentence cumulative summary of the world's identity.
    
    Format as JSON: 
    { 
      "theme": "${finalTheme}",
      "answers": { "Question 1": "Answer 1", "...": "..." },
      "aiSummary": "..."
    }`;

    try {
      const result = await generateAIResponse(userPrompt, apiKey, systemPrompt, {
        type: "object",
        properties: {
          theme: { type: "string" },
          answers: { type: "object" },
          aiSummary: { type: "string" }
        }
      });
      
      const data = {
        theme: result.theme || finalTheme,
        answers: result.answers,
        aiSummary: result.aiSummary,
        customFeatures: []
      };
      setWorldData(data);
      setTheme(result.theme || finalTheme);
      setQuestions(Object.keys(result.answers));
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("Failed to generate world. Try manual building.");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    const updated = [...customFeatures, newFeature.trim()];
    setCustomFeatures(updated);
    setWorldData({ ...worldData, customFeatures: updated });
    setNewFeature("");
  };

  const removeFeature = (index) => {
    const updated = customFeatures.filter((_, i) => i !== index);
    setCustomFeatures(updated);
    setWorldData({ ...worldData, customFeatures: updated });
  };

  return (
    <div className="world-builder animate-fade-in" style={{ paddingBottom: '10rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className="text-gradient">World Builder</h1>
            <p>The architect's tool for crafting unique realities.</p>
          </div>
          <button onClick={() => navigate('/home')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Compass size={18} /> Home
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {step === 0 && (
            <button 
              onClick={generateWorldAutomatically}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <Zap size={14} /> Quick AI Generate
            </button>
          )}
          {step > 0 && (
            <button 
              onClick={() => {
                  if (window.confirm("Restart world building? Current progress will be lost.")) {
                      setStep(0);
                      setWorldData(null);
                  }
              }}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              <ArrowLeft size={14} /> Reset World
            </button>
          )}
        </div>
      </header>

      <div className="container">
        <AnimatePresence mode="wait">
          {/* STEP 0: THEME SELECT */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Select your World's Theme</h3>
              <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
                {themes.map((t) => (
                  <motion.div 
                    key={t.name}
                    whileHover={{ scale: 1.02, borderColor: t.color }}
                    onClick={() => startInterview(t.name)}
                    className="glass-panel"
                    style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.3s ease', borderLeft: `4px solid ${t.color}` }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ padding: '10px', borderRadius: '12px', background: `${t.color}20` }}>
                        <t.icon size={24} color={t.color} />
                      </div>
                      <h4 style={{ fontSize: '1.25rem' }}>{t.name}</h4>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Or define a custom theme</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <input 
                    placeholder="e.g. Victorian Steampunk with Underwater Cities..." 
                    value={customTheme}
                    onChange={(e) => setCustomTheme(e.target.value)}
                    style={{ flex: 1, minWidth: '300px' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startInterview()} className="btn-secondary" style={{ flexShrink: 0 }}>
                      Manual Build
                    </button>
                    <button 
                      onClick={() => generateWorldAutomatically()} 
                      className="btn btn-primary" 
                      style={{ flexShrink: 0, background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
                    >
                      <Zap size={14} /> AI Build
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: INTERVIEW */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel"
              style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto' }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <Loader2 className="animate-spin" size={48} color="var(--primary-color)" style={{ margin: '0 auto 1.5rem' }} />
                  <h3>Consulting the Arcane Archives...</h3>
                  <p>Generating personalized questions for your world.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase' }}>
                      Architectural Interview • Question {currentQ + 1} of {questions.length}
                    </span>
                    <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ 
                        position: 'absolute', 
                        left: 0, 
                        top: 0, 
                        height: '100%', 
                        width: `${((currentQ + 1) / questions.length) * 100}%`, 
                        background: 'var(--primary-color)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem', lineHeight: 1.3 }}>{questions[currentQ]}</h2>
                  
                  <textarea 
                    autoFocus
                    placeholder="Describe your vision here..."
                    style={{ minHeight: '150px', fontSize: '1.1rem', padding: '1.5rem', marginBottom: '2rem' }}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      disabled={!currentAnswer.trim()}
                      onClick={handleNextQuestion}
                      className="btn btn-primary"
                    >
                      {currentQ === questions.length - 1 ? 'Finalize World' : 'Next Question'} <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* STEP 2: REVIEW & CUSTOMS */}
          {step === 2 && worldData && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="review-system"
            >
              <div className="grid-2" style={{ gap: '2rem' }}>
                {/* Left: World Atlas Summary */}
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Globe size={32} color="var(--primary-color)" />
                    <div>
                      <h3 style={{ fontSize: '1.5rem' }}>World Codex</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', textTransform: 'uppercase', fontWeight: 800 }}>{worldData.theme}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {worldData.aiSummary && (
                      <div style={{ 
                        background: 'rgba(16, 185, 129, 0.05)', 
                        border: '1px solid rgba(16, 185, 129, 0.2)', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        marginBottom: '1rem'
                      }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          <Zap size={10} style={{ marginRight: '4px' }} /> Core World Identity
                        </p>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.5, color: 'white', fontWeight: 500 }}>"{worldData.aiSummary}"</p>
                      </div>
                    )}

                    {worldData.answers ? Object.entries(worldData.answers).map(([q, a], i) => (
                      <div key={i} style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', opacity: 0.7 }}>{q}</p>
                        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{a}</p>
                      </div>
                    )) : (
                      <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>
                        <p>No interview data recorded for this world.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: User Customs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Sparkles size={24} color="var(--accent-color)" /> User Customs
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add unique rules, gravity constants, magic levels, or secret currencies to your world.</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {['Kingdom', 'City', 'Language', 'Religion', 'Technology'].map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setNewFeature(`${cat}: `)}
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '4px 10px', 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)'
                          }}
                        >
                          + Add {cat}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                      <input 
                        placeholder="Add specific rule or detail..." 
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <button onClick={addFeature} className="btn-secondary" style={{ padding: '10px' }}><Plus size={20} /></button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {customFeatures.map((feat, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          className="glass-panel" 
                          style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <span style={{ fontSize: '0.95rem' }}>{feat}</span>
                          <button onClick={() => removeFeature(i)} style={{ color: 'var(--danger-color)', opacity: 0.5 }}><Trash2 size={16} /></button>
                        </motion.div>
                      ))}
                      {customFeatures.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem' }}>No custom details added yet.</p>}
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)' }}>
                    <Save size={32} color="var(--primary-color)" style={{ margin: '0 auto 1rem' }} />
                    <h4>World Defined</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This data will be used by the AI when generating chapters to maintain consistent world rules.</p>
                    
                    {!chapters?.length && (
                        <button 
                            onClick={() => navigate('/story-builder')} 
                            className="btn btn-primary"
                            style={{ width: '100%', gap: '0.5rem' }}
                        >
                            <BookOpen size={18} /> Launch Story Engine
                        </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorldBuilder;

