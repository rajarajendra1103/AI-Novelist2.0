import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  MapPin, 
  Target, 
  ChevronRight, 
  Zap, 
  PenTool,
  Clock,
  Layout,
  MessageSquare,
  Sparkles,
  Compass
} from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { motion } from 'framer-motion';

const NovelOverview = () => {
  const { novelData, chapters } = useStory();
  const navigate = useNavigate();

  if (!novelData) return <div>No novel data yet.</div>;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="overview-page animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <header className="page-header" style={{ position: 'sticky', top: 0, zIndex: 5, background: 'rgba(13, 15, 23, 0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>{novelData.title}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <Sparkles size={16} color="var(--primary-color)" /> Novel Foundation Complete
          </p>
        </div>
        <button onClick={() => navigate('/home')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <Compass size={18} /> Home
        </button>
      </header>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
        
        {/* Left Column: Premise & Structure */}
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.section variants={item} className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'white' }}>
              <BookOpen size={20} color="var(--primary-color)" /> Story Premise
            </h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-color)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {novelData.premise}
            </p>
          </motion.section>

          <motion.section variants={item} className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'white' }}>
              <Target size={20} color="var(--secondary-color)" /> Narrative Goals & Structure
            </h3>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Structure Model</h4>
              <p>{novelData.plotStructure}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Major Conflicts</h4>
              {novelData.majorConflicts.map((conflict, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                  <div style={{ width: '4px', background: 'var(--accent-color)', borderRadius: '4px' }} />
                  <p style={{ fontSize: '0.95rem' }}>{conflict}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={item} className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
                <Users size={20} color="var(--accent-color)" /> Key Cast
              </h3>
              <button onClick={() => navigate('/characters')} style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>View Hub</button>
            </div>
            <div className="grid-2">
              {novelData.initialCharacters.map((char, i) => (
                <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ marginBottom: '0.25rem' }}>{char.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{char.role}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{char.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

        </motion.div>

        {/* Right Column: Outline List */}
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.section variants={item} className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'white' }}>
              <Layout size={20} color="var(--primary-color)" /> Chapter Progression
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chapters.map((chap, i) => (
                <div key={i} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                        {chap.chapter}
                      </div>
                      <h4 style={{ fontSize: '1rem' }}>{chap.title}</h4>
                    </div>
                    <button 
                      onClick={() => navigate(`/chapter/${i}`)} 
                      className="btn-outline" 
                      style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}
                    >
                      Write <ChevronRight size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {chap.summary}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {chap.charactersIntroduced.map((c, ci) => (
                      <span key={ci} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

        </motion.div>
      </div>
    </div>
  );
};

export default NovelOverview;
