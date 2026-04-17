import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Globe, 
  Clock, 
  Layout, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  LogOut,
  Home,
  Plus,
  Zap,
  Menu,
  Box,
  Camera,
  Film
} from 'lucide-react';
import { useStory } from '../context/StoryContext';
import logo from '../assets/logo.png';

const Sidebar = () => {
  const { chapters, setChapters, novelData, setNovelData } = useStory();
  const [zenMode, setZenMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleAddChapter = () => {
    const newId = chapters.length + 1;
    const newChat = {
      chapter: newId,
      title: `Chapter ${newId}`,
      summary: "New chapter summary...",
      goal: "Draft goals...",
      charactersIntroduced: [],
      content: ""
    };
    setChapters([...chapters, newChat]);
    navigate(`/chapter/${chapters.length}`);
  };

  const handleLogout = () => {
    if (window.confirm("Abandon current novel? Unsaved progress will be lost.")) {
      setNovelData(null);
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Chapters', icon: BookOpen, path: '/overview' },
    { name: 'Character Hub', icon: Users, path: '/characters' },
    { name: 'World Builder', icon: Globe, path: '/world' },
    { name: 'Timeline', icon: Clock, path: '/timeline' },
    { name: 'Scene System', icon: Layout, path: '/scenes' },
  ];

  return (
    <aside className={`sidebar glass-panel ${zenMode ? 'zen-active' : ''} ${isCollapsed ? 'collapsed' : ''}`} style={{ 
      width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)', 
      height: '100vh', 
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      position: 'relative',
      zIndex: 10,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          right: '-12px',
          top: '2.8rem',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
          zIndex: 11,
          border: '2px solid var(--bg-color)'
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="sidebar-logo" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          borderRadius: '8px', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {!isCollapsed && <h2 style={{ fontSize: '1.2rem', color: 'white', letterSpacing: '-0.5px', textShadow: '0 0 10px rgba(16, 185, 129, 0.2)' }}>AI Novelist</h2>}
      </div>

      <nav style={{ flex: 1, overflowX: 'hidden' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className="nav-item"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  justifyContent: isCollapsed ? 'center' : 'flex-start'
                })}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} color={window.location.pathname === item.path ? '#10b981' : 'currentColor'} />
                {!isCollapsed && <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</span>}
                {!isCollapsed && window.location.pathname === item.path && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
              </NavLink>
            </li>
          ))}
        </ul>

        {chapters.length > 0 && !isCollapsed && (
          <div className="chapter-list" style={{ marginTop: '2.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '1rem', marginBottom: '1rem', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Chapters
            <button onClick={handleAddChapter} style={{ color: 'var(--primary-color)', paddingRight: '1rem' }}><Plus size={14} /></button>
          </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '30vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {chapters.map((chap, i) => (
                <NavLink 
                  key={i}
                  to={`/chapter/${i}`}
                  style={({ isActive }) => ({
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent'
                  })}
                >
                  {i + 1}. {chap.title}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Modern Toggle Switch */}
        <div 
          onClick={() => setZenMode(!zenMode)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: zenMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: zenMode ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            justifyContent: isCollapsed ? 'center' : 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={16} style={{ flexShrink: 0 }} color={zenMode ? '#10b981' : 'var(--text-muted)'} />
            {!isCollapsed && <span className="zen-mode-text" style={{ fontSize: '0.85rem', color: zenMode ? 'white' : 'var(--text-muted)', fontWeight: 500 }}>Zen Mode</span>}
          </div>
          {!isCollapsed && (
            <div style={{
              width: '32px',
              height: '18px',
              borderRadius: '10px',
              background: zenMode ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: zenMode ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: '2px',
                left: zenMode ? '16px' : '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            </div>
          )}
        </div>

        {!isCollapsed && <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />}

        <button 
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', color: 'var(--danger-color)', opacity: 0.8, justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>New Novel</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


