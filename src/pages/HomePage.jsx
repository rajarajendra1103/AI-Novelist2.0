import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronRight, 
  Type, 
  Music, 
  Compass, 
  Wind,
  Loader2,
  Layout,
  AlertCircle
} from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { generateAIResponse } from '../lib/gemini';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { setNovelData, setChapters, setCharacters } = useStory();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [prompt, setPrompt] = useState("");
  const [selectedGenres, setSelectedGenres] = useState(["Fantasy"]);
  const [writingStyle, setWritingStyle] = useState("Literary");
  const [selectedTones, setSelectedTones] = useState(["Dramatic"]);
  const [pov, setPov] = useState("Third Person Limited");

  const genres = ["Fantasy", "Sci-Fi", "Thriller", "Romance", "Horror", "Historical Fiction", "Mystery", "Cyberpunk", "SteamPunk"];
  const styles = ["Literary", "Fast-paced", "Descriptive", "Minimalist", "Poetic", "Journalistic"];
  const tones = ["Dramatic", "Suspenseful", "Emotional", "Humorous", "Dark", "Optimistic", "Melancholic"];
  const povs = ["First Person", "Third Person Limited", "Third Person Omniscient", "Second Person"];

  const handleGenerateOutline = async () => {
    if (!prompt.trim()) {
      setError("Please describe your story idea first.");
      return;
    }

    setLoading(true);
    setError(null);

    const systemPrompt = `You are a world-class professional novelist and story architect. 
      Your goal is to generate a comprehensive novel foundation and multi-chapter outline based on a short theme or idea.
      Always be creative, structurally sound (using 3-act or similar structures), and compelling.`;

    const userPrompt = `
      Create a novel plan based on this idea: "${prompt}"
      Genres: ${selectedGenres.join(", ")}
      Writing Style: ${writingStyle}
      Tones: ${selectedTones.join(", ")}
      Narrative POV: ${pov}

      Provide your response as a JSON object with this exact structure:
      {
        "title": "...",
        "premise": "...",
        "plotStructure": "...",
        "majorConflicts": ["...", "..."],
        "outline": [
          { "chapter": 1, "title": "...", "summary": "...", "goal": "...", "charactersIntroduced": ["..."] },
          ... up to 15-20 chapters
        ],
        "initialCharacters": [
          { "name": "...", "description": "...", "personality": "...", "role": "..." }
        ]
      }
    `;

    try {
      const result = await generateAIResponse(userPrompt, systemPrompt, "application/json");

      setNovelData(result);
      
      const initialChapters = result.outline.map((chap, i) => ({
        ...chap,
        content: "" 
      }));

      // Proactively generate Chapter 1 and 2
      const firstTwoChapters = [...initialChapters];
      
      try {
        const systemPromptWrite = "You are a professional novelist. Write the full content of a chapter based on the outline.";
        
        const [ch1Content, ch2Content] = await Promise.all([
          generateAIResponse(`Write Chapter 1 for "${result.title}". Overview: ${result.premise}. Chapter Goal: ${result.outline[0].summary}`, systemPromptWrite),
          generateAIResponse(`Write Chapter 2 for "${result.title}". Overview: ${result.premise}. Chapter Goal: ${result.outline[1].summary}`, systemPromptWrite)
        ]);

        firstTwoChapters[0].content = ch1Content;
        firstTwoChapters[1].content = ch2Content;
      } catch (e) {
        console.warn("Auto-generation of first chapters failed, but outline is saved.", e);
      }

      setChapters(firstTwoChapters);
      setCharacters(result.initialCharacters.map((c, i) => ({ 
        ...c, 
        id: `char_${i}_${Date.now()}`,
        personality: c.personality || "Unknown",
        firstAppearance: "Chapter 1",
        development: []
      })));
      
      navigate('/overview');
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate outline. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page animate-fade-in" style={{ padding: '0 0 5rem 0' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient">Architect Your World</h1>
          <p>Tell the AI your vision, and watch a complete story architecture emerge.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <Compass size={18} /> Landing Page
        </button>
      </header>

      <div className="container" style={{ maxWidth: '1000px', marginTop: '-1rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          {/* API Key Modal/Input if missing */}

          {error && (
            <div style={{ marginBottom: '1.5rem', color: 'var(--danger-color)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'white' }}>Short story idea or theme</label>
            <textarea 
              placeholder="e.g. A cybernetic detective discovers a forgotten memory in a city where dreams are traded as currency." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ minHeight: '150px', fontSize: '1.1rem', background: 'rgba(0,0,0,0.3)' }}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <div className="select-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <Compass size={14} /> Genres (Select Multiple)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {genres.map(g => (
                  <button
                    key={g}
                    onClick={() => {
                      if (selectedGenres.includes(g)) {
                        if (selectedGenres.length > 1) setSelectedGenres(selectedGenres.filter(x => x !== g));
                      } else {
                        setSelectedGenres([...selectedGenres, g]);
                      }
                    }}
                    disabled={loading}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      background: selectedGenres.includes(g) ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                      color: selectedGenres.includes(g) ? 'white' : 'var(--text-muted)',
                      border: '1px solid',
                      borderColor: selectedGenres.includes(g) ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="select-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                  <Wind size={14} /> Tones (Select Multiple)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {tones.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        if (selectedTones.includes(t)) {
                          if (selectedTones.length > 1) setSelectedTones(selectedTones.filter(x => x !== t));
                        } else {
                          setSelectedTones([...selectedTones, t]);
                        }
                      }}
                      disabled={loading}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '100px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        background: selectedTones.includes(t) ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                        color: selectedTones.includes(t) ? 'white' : 'var(--text-muted)',
                        border: '1px solid',
                        borderColor: selectedTones.includes(t) ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                <div className="select-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    <Type size={14} /> Style
                  </label>
                  <select value={writingStyle} onChange={(e) => setWritingStyle(e.target.value)} disabled={loading}>
                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="select-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    <Layout size={14} /> POV
                  </label>
                  <select value={pov} onChange={(e) => setPov(e.target.value)} disabled={loading}>
                    {povs.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
            onClick={handleGenerateOutline}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <div className="spinner" /> 
                <span style={{ fontSize: '0.9rem' }}>Architecting your story...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} /> Construct My Novel
              </>
            )}
          </button>
        </div>

        <div className="info-cards grid-3">
          <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Full Novel Outline</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Automatically bridge your chapter summaries into a cohesive arc.</p>
          </div>
          <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
            <h4 style={{ color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>Character Casting</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Initial major characters are discovered and cataloged in the hub.</p>
          </div>
          <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Premium Logic</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Utilizing advanced instruction following for structural integrity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
