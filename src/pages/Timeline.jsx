import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  History, 
  Sparkles, 
  BookOpen, 
  User, 
  Calendar,
  Filter,
  Plus,
  ChevronDown,
  Globe,
  Star,
  Zap,
  Loader2,
  RefreshCw,
  Compass
} from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { generateAIResponse } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

const Timeline = () => {
  const navigate = useNavigate();
  const { timelineEvents, setTimelineEvents, chapters, novelData } = useStory();
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Categories: History, Chapter Milestone, Character Arc
  const categories = ['All', 'History', 'Chapter', 'Character'];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', category: 'History', time: '', impact: '' });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.description) return;
    setTimelineEvents(prev => [...(prev || []), { ...newEvent, id: `manual-${Date.now()}` }]);
    setShowAddModal(false);
    setNewEvent({ title: '', description: '', category: 'History', time: '', impact: '' });
  };

  const scanChaptersForEvents = async () => {
    if (!chapters || chapters.length === 0) {
      alert("Please write at least one chapter to scan.");
      return;
    }
    setLoading(true);

    const systemPrompt = "You are a story analyst. Extract major timeline events from chapter content and categorize them accurately.";
    const userPrompt = `Analyze these chapters and extract a chronological timeline of events:
    ${chapters.map((c, i) => `Chapter ${i+1} Title: ${c.title}\nContent: ${c.content.substring(0, 1500)}...`).join("\n\n")}
    
    For each event, provide: Title, Category (History/Chapter/Character), Time/Era, and a brief Description.
    Also include the Chapter ID (index starting from 0) if the event happened in a specific chapter.
    
    Format as JSON: 
    { 
      "events": [
        { "title": "...", "category": "History|Chapter|Character", "time": "...", "description": "...", "chapterId": 0 },
        "..."
      ]
    }`;

    try {
      const result = await generateAIResponse(userPrompt, systemPrompt, {
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string", enum: ["History", "Chapter", "Character"] },
                time: { type: "string" },
                description: { type: "string" },
                chapterId: { type: "number" }
              }
            }
          }
        }
      });
      
      const newEvents = result.events.map((e, idx) => ({ ...e, id: `ai-${Date.now()}-${idx}` }));
      setTimelineEvents(newEvents);
    } catch (e) {
      console.error(e);
      alert("Failed to scan chapters. Ensure you have chapters with content.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'History': return <Globe size={16} />;
      case 'Chapter': return <BookOpen size={16} />;
      case 'Character': return <User size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'History': return '#3b82f6'; // blue
      case 'Chapter': return '#10b981'; // green
      case 'Character': return '#ec4899'; // pink
      default: return '#94a3b8';
    }
  };

  const filteredEvents = (timelineEvents || []).filter(e => filter === 'All' || e.category === filter);

  return (
    <div className="timeline-page animate-fade-in" style={{ paddingBottom: '10rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className="text-gradient">Story Timeline</h1>
            <p>The chronological backbone of your universe.</p>
          </div>
          <button onClick={() => navigate('/home')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Compass size={18} /> Home
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={scanChaptersForEvents}
            disabled={loading}
            className="btn-primary" 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
            }}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />} 
            {loading ? 'Scanning Chapters...' : 'Scan Chapters'}
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-secondary" 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} /> Add Event
          </button>
          
          <div className="glass-panel" style={{ padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: filter === cat ? 'white' : 'var(--text-muted)',
                  background: filter === cat ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(10px)',
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}
            >
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar color="var(--primary-color)" /> Add Timeline Event
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Title</label>
                  <input 
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="e.g. Battle of the Red Skies"
                  />
                </div>
                
                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <select 
                      value={newEvent.category}
                      onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Time/Era</label>
                    <input 
                      value={newEvent.time}
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      placeholder="e.g. 2nd Age"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Description</label>
                  <textarea 
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Describe what happened..."
                    style={{ minHeight: '100px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={handleAddEvent} className="btn-primary" style={{ flex: 1 }}>Save Event</button>
                  <button onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="container" style={{ marginTop: '2rem' }}>
        {filteredEvents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '5rem', textAlign: 'center', opacity: 0.6 }}>
            <Clock size={48} style={{ marginBottom: '1rem', color: 'var(--primary-color)' }} />
            <h3>No events recorded yet</h3>
            <p>Complete chapters or add historical events to see your timeline grow.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            {/* Timeline Line */}
            <div style={{ 
              position: 'absolute', 
              left: '7px', 
              top: 0, 
              bottom: 0, 
              width: '2px', 
              background: 'linear-gradient(180deg, var(--primary-color), var(--secondary-color), transparent)',
              opacity: 0.3
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {filteredEvents.map((event, i) => {
                const color = getCategoryColor(event.category);
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    style={{ position: 'relative' }}
                  >
                    {/* Node */}
                    <div style={{ 
                      position: 'absolute', 
                      left: '-2rem', 
                      top: '0.5rem', 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%', 
                      background: 'var(--bg-color)', 
                      border: `3px solid ${color}`,
                      boxShadow: `0 0 10px ${color}40`,
                      zIndex: 2
                    }} />

                    <div className="glass-panel" style={{ 
                      padding: '1.5rem', 
                      borderLeft: `4px solid ${color}`,
                      background: `linear-gradient(90deg, ${color}05, transparent)`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 800, 
                            color, 
                            textTransform: 'uppercase', 
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {getCategoryIcon(event.category)} {event.category} • {event.time || 'Current Era'}
                          </span>
                          <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: 'white' }}>{event.title}</h3>
                        </div>
                        {event.chapterId !== undefined && (
                          <div style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Chapter {event.chapterId + 1}
                          </div>
                        )}
                      </div>
                      
                      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {event.description}
                      </p>

                      {event.impact && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--accent-color)' }}>
                            Impact: {event.impact}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
