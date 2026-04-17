import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Heart, 
  Zap, 
  Shield, 
  Skull, 
  MessageSquare, 
  Search,
  Filter,
  MoreVertical,
  Plus,
  Share2,
  Network,
  Compass
} from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { generateAIResponse } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

const CharacterHub = () => {
  const navigate = useNavigate();
  const { characters, setCharacters, apiKey, chapters } = useStory();
  const [activeTab, setActiveTab] = useState('Characters'); // Characters vs Relationship Map
  const [loadingMap, setLoadingMap] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);

  const generateMap = async () => {
    if (!apiKey || characters.length < 2) return;
    setLoadingMap(true);
    
    const systemPrompt = "You are a literary analyst specialized in deep character bonds (Family, Love, Friendship).";
    const userPrompt = `Analyze the relationships between these characters. Focus EXCLUSIVELY on deep bonds like Family, Love, and Friendship. 
    DO NOT include rivalry, enemies, or simple professional alliances.
    Characters: ${JSON.stringify(characters.map(c => ({ name: c.name, role: c.role })))}
    
    Format as JSON: { "relationships": [{ "from": "...", "to": "...", "type": "Family/Love/Friendship", "intensity": 1-10, "notes": "..." }] }`;

    try {
      const result = await generateAIResponse(userPrompt, apiKey, systemPrompt, {
        type: "object",
        properties: {
          relationships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                type: { type: "string" },
                intensity: { type: "number" },
                notes: { type: "string" }
              }
            }
          }
        }
      });
      setRelationships(result.relationships);
      setActiveTab('Map');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMap(false);
    }
  };

  const RelationshipMap = () => {
    // Basic node positioning (circular layout for simplicity but effective)
    const radius = 250;
    const centerX = 400;
    const centerY = 350;

    const nodes = characters.map((char, i) => {
      const angle = (i / characters.length) * 2 * Math.PI;
      return {
        ...char,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    const getRelationshipColor = (type) => {
      const colors = {
        family: '#059669',   // Deep Emerald
        love: '#34d399',     // Emerald
        romantic: '#34d399',
        friendship: '#6ee7b7', // Mint
        friend: '#6ee7b7'
      };
      return colors[type.toLowerCase()] || 'var(--primary-color)';
    };

    return (
      <div className="rel-map animate-fade-in" style={{ 
        padding: '2rem', 
        height: '700px', 
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 800 700" style={{ pointerEvents: 'all' }}>
          {/* Relationship Lines */}
          {relationships.map((rel, i) => {
            const fromNode = nodes.find(n => n.name === rel.from);
            const toNode = nodes.find(n => n.name === rel.to);
            if (!fromNode || !toNode) return null;

            const color = getRelationshipColor(rel.type);
            
            return (
              <g key={`rel-${i}`}>
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={color}
                  strokeWidth={2 + rel.intensity / 2}
                  strokeDasharray="5,5"
                />
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 10}
                  fill={color}
                  style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', pointerEvents: 'none' }}
                  textAnchor="middle"
                >
                  {rel.type}
                </motion.text>
              </g>
            );
          })}

          {/* Character Nodes */}
          {nodes.map((node, i) => (
            <motion.g 
              key={`node-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.1 }}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedChar(node)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r="35"
                fill="var(--bg-color-alt)"
                stroke="var(--primary-color)"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }}
              />
              <text
                x={node.x}
                y={node.y + 45}
                fill="white"
                textAnchor="middle"
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                {node.name}
              </text>
              <text
                x={node.x}
                y={node.y + 5}
                fill="var(--primary-color)"
                textAnchor="middle"
                style={{ fontSize: '14px', fontWeight: 800 }}
              >
                {node.name.charAt(0)}
              </text>
            </motion.g>
          ))}
        </svg>

        {relationships.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <Network size={64} style={{ marginBottom: '1rem' }} />
            <p>Gather data to visualize character dynamics</p>
          </div>
        )}

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Family', color: '#059669' },
            { label: 'Love', color: '#34d399' },
            { label: 'Friendship', color: '#6ee7b7' }
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="character-hub animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className="text-gradient">Character Hub</h1>
            <p>Managing {characters.length} identities within your narrative.</p>
          </div>
          <button onClick={() => navigate('/home')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Compass size={18} /> Home
          </button>
        </div>
        <div className="glass-panel" style={{ padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', height: 'fit-content' }}>
          <button 
            onClick={() => setActiveTab('Characters')} 
            style={{ padding: '8px 16px', borderRadius: '8px', background: activeTab === 'Characters' ? 'rgba(255,255,255,0.1)' : 'transparent', fontSize: '0.9rem', color: activeTab === 'Characters' ? 'white' : 'var(--text-muted)' }}
          >
            <Users size={16} /> Directory
          </button>
          <button 
            onClick={generateMap} 
            style={{ padding: '8px 16px', borderRadius: '8px', background: activeTab === 'Map' ? 'rgba(255,255,255,0.1)' : 'transparent', fontSize: '0.9rem', color: activeTab === 'Map' ? 'white' : 'var(--text-muted)' }}
          >
            <Network size={16} /> Relationship Map
          </button>
        </div>
      </header>

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {activeTab === 'Characters' ? (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input placeholder="Search personalities, roles, or names..." style={{ paddingLeft: '2.5rem' }} />
              </div>
              <button className="btn-secondary" style={{ padding: '10px 15px' }}><Filter size={18} /> Filter</button>
              <button className="btn btn-primary" style={{ padding: '10px 20px' }}><UserPlus size={18} /> New Character</button>
            </div>

            <div className="grid-3">
              {characters.map((char, i) => (
                <motion.div 
                  key={i} 
                  className="glass-panel" 
                  style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', cursor: 'pointer' }}
                  whileHover={{ borderColor: 'rgba(16, 185, 129, 0.4)', y: -5 }}
                  onClick={() => setSelectedChar(char)}
                >
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <MoreVertical size={16} style={{ cursor: 'pointer', opacity: 0.5 }} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>{char.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{char.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: 600, textTransform: 'uppercase' }}>{char.role}</p>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                    ID: {char.id?.substring(0, 12)}
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {char.description}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ display: 'block', color: 'var(--text-muted)' }}>Personality</span>
                      <span style={{ color: 'white' }}>{char.personality || 'TBD'}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ display: 'block', color: 'var(--text-muted)' }}>Found In</span>
                      <span style={{ color: 'white' }}>{char.firstAppearance}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <RelationshipMap />
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedChar && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="glass-panel" 
               style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', position: 'relative' }}
             >
               <button onClick={() => setSelectedChar(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>Close (Esc)</button>
               
               <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                 <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <span style={{ fontSize: '4rem', fontWeight: 800 }}>{selectedChar.name.charAt(0)}</span>
                 </div>
                 <div>
                   <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedChar.name}</h2>
                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--secondary-color)', fontWeight: 700, textTransform: 'uppercase' }}>{selectedChar.role}</span>
                      <span style={{ color: 'var(--text-muted)' }}>|</span>
                      <span style={{ color: 'var(--text-muted)' }}>{selectedChar.id}</span>
                   </div>
                 </div>
               </div>

               <div className="grid-2" style={{ gap: '3rem' }}>
                 <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1rem' }}>Background</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{selectedChar.description}</p>
                    
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                       <div>
                         <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Personality Traits</span>
                         <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                           {['Brave', 'Calculating', 'Loyal'].map(tag => (
                             <span key={tag} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>{tag}</span>
                           ))}
                         </div>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1rem' }}>Development Timeline</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem' }}>
                       <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: 'var(--border-color)' }} />
                       {(selectedChar.development || []).map((dev, i) => (
                         <div key={i} style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-1.85rem', top: '0.4rem', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)', border: '2px solid var(--bg-color)' }} />
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.5 }}>{dev}</p>
                         </div>
                       ))}
                       {(!selectedChar.development || selectedChar.development.length === 0) && (
                         <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No development recorded yet.</p>
                       )}
                    </div>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterHub;
