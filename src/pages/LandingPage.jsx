import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Book, PenTool, Layout, Users, ChevronRight, Zap, Target, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

import logo from '../assets/logo.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Zap, title: "Amazon Nova-Powered", desc: "Experience the magic of deep AI writing models that understand Narrative POV and literary structure." },
    { icon: Book, title: "Story Architects", desc: "Let AI build your plot structure, chapters, and twists based on your most basic ideas." },
    { icon: Layout, title: "Structured Outlining", desc: "Generate chapter-by-chapter summaries including character arcs and story progression." },
    { icon: Users, title: "Character Engine", desc: "Automatically track characters and their evolving relationships across every single chapter." },
    { icon: PenTool, title: "Writing Assistant", desc: "Professional grammar, tone, and style adjustments to make your prose feel truly professional." },
    { icon: Palette, title: "World Builder", desc: "Build rich backstories and consistent world rules to guide your narrative." }
  ];

  return (
    <div className="landing-page" style={{ position: 'relative', overflowX: 'hidden' }}>
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '1.25rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        zIndex: 100,
        background: 'rgba(13, 15, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logo} alt="Logo" style={{ width: '24px', height: '24px' }} />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.5px' }}>AI NOVELIST</span>
        </div>
        <button onClick={() => navigate('/home')} className="btn-ghost" style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>
          Launch Workspace <ChevronRight size={16} />
        </button>
      </header>
      {/* Hero Section */}
      <section className="hero" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, rgba(13, 15, 23, 1) 100%)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '1000px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '2rem' }}>
              <img src={logo} alt="Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Introducing AI Novelist 2.0</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1.1, marginBottom: '2rem' }}>
              Turning Raw Ideas into <br /><span className="text-gradient">Epic Masterpieces</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '700px', marginInline: 'auto' }}>
              The most advanced AI writing workspace. From seed prompts to full 20-chapter outlines, 
              character hubs, and real-time relationship mapping.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <button onClick={() => navigate('/home')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '10px' }}>
                Start Writing Now <ChevronRight size={18} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '10px' }}>
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Grid */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, width: '100%', height: '100%', 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', 
          backgroundSize: '40px 40px',
          zIndex: -1,
          opacity: 0.5
        }} />
      </section>

      {/* Feature Grid */}
      <section className="features" style={{ padding: '8rem 2rem', background: 'var(--bg-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your Professional Writing Suite</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Everything a novelist needs, augmented by next-gen intelligence.</p>
          </div>

          <div className="grid-3">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                className="glass-panel" 
                style={{ padding: '2.5rem', transition: 'all 0.3s' }}
                whileHover={{ translateY: -10, borderColor: 'var(--primary-color)' }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <f.icon color="#10b981" size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'white' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section: How to Write */}
      <section style={{ padding: '8rem 2rem', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Mastering Digital Narrative</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Writing a novel is no longer an isolated battle. With AI Novelist, you become the director 
              of your own creative universe.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                "Control Narrative POV with surgical precision",
                "Maintain complex character consistency automatically",
                "Visualize relationships and plot twists in real-time",
                "Export your work into production-ready formats"
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }} />
                  <span style={{ fontSize: '1rem' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', opacity: 0.2 }}>{"{ ... }"}</div>
              <p style={{ color: 'var(--text-muted)' }}>Advanced AI logic operating at 1,000,000+ context window tokens.</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>© 2026 AI Novelist Director. Built for the next era of storytellers.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
