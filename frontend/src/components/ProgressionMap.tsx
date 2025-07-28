import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { progressionApi, storage, handleApiError, ProgressionStage } from '../services/api';

interface ProgressionMapProps {
  onClose: () => void;
}

const nodeColors = {
  unlocked: '#58cc02',
  locked: '#bdbdbd',
  childUnlocked: '#1cb0f6',
  childLocked: '#e0e0e0',
};

const ProgressionMap: React.FC<ProgressionMapProps> = ({ onClose }) => {
  const [skillTree, setSkillTree] = useState<ProgressionStage[]>([]);
  const [selectedNode, setSelectedNode] = useState<ProgressionStage | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        const nickname = storage.getNickname();
        if (!nickname) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        console.log('Fetching progression for user:', nickname);
        const data = await progressionApi.getProgression(nickname);
        console.log('Progression data received:', data);
        setSkillTree(data);
        setError('');
      } catch (err: any) {
        console.error('Progression fetch error:', err);
        
        // Provide fallback progression data
        const fallbackProgression = [
          {
            id: 'basics',
            label: 'Language Basics',
            unlocked: true,
            children: [
              { id: 'basics_1', label: 'Introduction', unlocked: true },
              { id: 'basics_2', label: 'Simple Phrases', unlocked: false },
              { id: 'basics_3', label: 'Basic Grammar', unlocked: false }
            ]
          },
          {
            id: 'food',
            label: 'Food & Dining',
            unlocked: false,
            children: [
              { id: 'food_1', label: 'Basic Food Terms', unlocked: false },
              { id: 'food_2', label: 'Restaurant Conversations', unlocked: false },
              { id: 'food_3', label: 'Cooking & Recipes', unlocked: false }
            ]
          },
          {
            id: 'travel',
            label: 'Travel & Transportation',
            unlocked: false,
            children: [
              { id: 'travel_1', label: 'Directions', unlocked: false },
              { id: 'travel_2', label: 'Transportation', unlocked: false },
              { id: 'travel_3', label: 'Hotels & Accommodation', unlocked: false }
            ]
          }
        ];
        
        setSkillTree(fallbackProgression);
        setError('Using demo data - server connection failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgression();

    // Set up polling for real-time updates (but less frequent to reduce server load)
    const pollInterval = setInterval(fetchProgression, 60000); // Poll every 60 seconds

    return () => clearInterval(pollInterval);
  }, []);

  // Count unlocked nodes
  const totalNodes = skillTree.reduce((acc, cat) => acc + (cat.children ? cat.children.length : 0), skillTree.length);
  const unlockedNodes = skillTree.reduce((acc, cat) => acc + (cat.children ? cat.children.filter(c => c.unlocked).length : 0) + (cat.unlocked ? 1 : 0), 0);

  // Render a single node (category or child)
const renderNode = (node: ProgressionStage, isChild = false) => {
  const color = node.unlocked
    ? isChild ? nodeColors.childUnlocked : nodeColors.unlocked
    : isChild ? nodeColors.childLocked : nodeColors.locked;
  const icon = node.unlocked
    ? isChild ? 'star' : 'check_circle'
    : 'lock';
  
  const isMobile = window.innerWidth <= 768;
  
  return (
    <motion.div
      key={node.id}
      whileHover={{ scale: 1.08, boxShadow: node.unlocked ? '0 4px 16px #58cc0255' : '0 2px 8px #bdbdbd55' }}
      whileTap={{ scale: 0.97 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? 4 : 6,
        background: node.unlocked
          ? isChild
            ? 'linear-gradient(135deg, #e0ffe6 0%, #d7f7c8 100%)'
            : 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)'
          : '#f0f0f0',
        borderRadius: isMobile ? 12 : 18,
        padding: isChild 
          ? isMobile ? '8px 12px' : '12px 18px'
          : isMobile ? '12px 16px' : '18px 24px',
        boxShadow: node.unlocked ? '0 2px 8px #58cc0222' : 'none',
        border: `2px solid ${color}`,
        minWidth: isChild 
          ? isMobile ? 60 : 70
          : isMobile ? 80 : 110,
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={() => setSelectedNode(node)}
      title={node.unlocked ? 'Click for details' : 'Locked'}
    >
      <span
        className="material-icons"
        style={{
          color: !node.unlocked ? '#FFD700' : color,
          fontSize: isChild 
            ? isMobile ? 20 : 26
            : isMobile ? 24 : 32,
          filter: node.unlocked ? 'drop-shadow(0 2px 8px #58cc0255)' : 'none',
        }}
      >
        {icon}
      </span>
      <span style={{ 
        fontSize: isChild 
          ? isMobile ? '0.8rem' : '1.05rem'
          : isMobile ? '0.9rem' : '1.15rem', 
        color, 
        fontFamily: 'Fira Mono, Menlo, Consolas, monospace', 
        fontWeight: 300,
        textAlign: 'center',
        lineHeight: isMobile ? 1.2 : 1.3,
        wordBreak: isMobile ? 'break-word' : 'normal'
      }}>{node.label}</span>
    </motion.div>
  );
};

  return (
    <>
      <style>{`
        .progression-map-scrollable::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .progression-map-scrollable::-webkit-scrollbar-thumb {
          background: transparent;
        }
        .progression-map-scrollable {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.55)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, #d7f7c8 0%, #c8f4b8 100%)',
            borderRadius: window.innerWidth <= 768 ? 16 : 32,
            boxShadow: '0 12px 40px #58cc0222, 0 2px 8px #58cc0222',
            minWidth: window.innerWidth <= 768 ? 280 : 320,
            maxWidth: window.innerWidth <= 768 ? '98vw' : '95vw',
            width: window.innerWidth <= 768 ? '98vw' : 'auto',
            minHeight: window.innerWidth <= 768 ? 280 : 320,
            maxHeight: window.innerWidth <= 768 ? '95vh' : '90vh',
            padding: window.innerWidth <= 768 ? '20px 12px 16px 12px' : '40px 24px 32px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            border: `${window.innerWidth <= 768 ? 2 : 2.5}px solid #58cc02`,
          }}
          className="progression-map-scrollable"
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: window.innerWidth <= 768 ? 8 : 16,
              right: window.innerWidth <= 768 ? 8 : 16,
              background: 'none',
              border: 'none',
              fontSize: window.innerWidth <= 768 ? 24 : 28,
              color: '#58cc02',
              cursor: 'pointer',
              padding: '4px',
              zIndex: 10,
            }}
            title="Close"
          >
            <span className="material-icons">close</span>
          </button>
<h2 style={{ 
            color: '#58cc02', 
            marginBottom: 8, 
            fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem', 
            letterSpacing: '.01em', 
            fontFamily: 'Fira Mono, Menlo, Consolas, monospace', 
            fontWeight: 300,
            textAlign: 'center',
            paddingRight: window.innerWidth <= 768 ? '40px' : '0'
          }}>
            <span className="material-icons" style={{ 
              verticalAlign: 'middle', 
              fontSize: window.innerWidth <= 768 ? 24 : 32, 
              marginRight: window.innerWidth <= 768 ? 4 : 8 
            }}>account_tree</span>
            Progression Map
          </h2>
          {loading && (
            <div style={{ 
              color: '#58cc02', 
              marginBottom: 18, 
              textAlign: 'center',
              fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
            }}>
              <span className="material-icons" style={{ 
                fontSize: window.innerWidth <= 768 ? 20 : 24, 
                verticalAlign: 'middle', 
                marginRight: window.innerWidth <= 768 ? 4 : 8 
              }}>hourglass_top</span>
              Loading...
            </div>
          )}
          {error && (
            <div style={{ 
              color: '#ff4b4b', 
              marginBottom: 18, 
              textAlign: 'center',
              fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
              padding: window.innerWidth <= 768 ? '0 8px' : '0'
            }}>
              <span className="material-icons" style={{ 
                fontSize: window.innerWidth <= 768 ? 20 : 24, 
                verticalAlign: 'middle', 
                marginRight: window.innerWidth <= 768 ? 4 : 8 
              }}>error</span>
              {error}
            </div>
          )}
          <div style={{ 
            color: '#3caa3c', 
            marginBottom: 18, 
            fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem', 
            fontFamily: 'Fira Mono, Menlo, Consolas, monospace', 
            fontWeight: 300,
            textAlign: 'center'
          }}>
            {unlockedNodes} / {totalNodes} skills unlocked
          </div>
          <div style={{ 
            width: '100%', 
            maxWidth: window.innerWidth <= 768 ? '100%' : 520, 
            margin: '0 auto',
            padding: window.innerWidth <= 768 ? '0 4px' : '0'
          }}>
            {skillTree.map((cat, i) => (
              <div key={cat.id} style={{ 
                marginBottom: window.innerWidth <= 768 ? 20 : 32, 
                position: 'relative' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: window.innerWidth <= 768 ? 8 : 16,
                  flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                  textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                }}>
                  {renderNode(cat)}
                  {/* Connecting lines to children - hide on mobile for cleaner look */}
                  {cat.children && cat.children.length > 0 && window.innerWidth > 768 && (
                    <div style={{ height: 2, width: 32, background: '#bdbdbd', marginLeft: 8, marginRight: 8, borderRadius: 1 }} />
                  )}
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem', 
                    color: cat.unlocked ? '#58cc02' : '#bdbdbd', 
                    letterSpacing: '.01em', 
                    fontFamily: 'Fira Mono, Menlo, Consolas, monospace', 
                    fontWeight: 300,
                    marginTop: window.innerWidth <= 768 ? '8px' : '0'
                  }}>{cat.label}</div>
                </div>
                {/* Children nodes */}
                {cat.children && (
                  <div style={{ 
                    display: 'flex', 
                    gap: window.innerWidth <= 768 ? 12 : 28, 
                    marginLeft: window.innerWidth <= 768 ? 0 : 80, 
                    marginTop: 16,
                    flexWrap: window.innerWidth <= 768 ? 'wrap' : 'nowrap',
                    justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start'
                  }}>
                    {cat.children.map(child => renderNode(child, true))}
                  </div>
                )}
                {i < skillTree.length - 1 && window.innerWidth > 768 && (
                  <div style={{ height: 36, borderLeft: '3px dashed #bdbdbd', margin: '0 0 0 32px' }} />
                )}
              </div>
            ))}
          </div>
          {/* Node details modal/tooltip */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.25)',
                  zIndex: 4100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => setSelectedNode(null)}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: window.innerWidth <= 768 ? 16 : 24,
                    boxShadow: '0 8px 32px #58cc0222',
                    padding: window.innerWidth <= 768 ? '20px 16px' : '32px 28px',
                    minWidth: window.innerWidth <= 768 ? 240 : 260,
                    maxWidth: window.innerWidth <= 768 ? '85vw' : '90vw',
                    textAlign: 'center',
                    position: 'relative',
                    fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
                    fontWeight: 300,
                    margin: window.innerWidth <= 768 ? '0 16px' : '0',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <span className="material-icons" style={{ 
                    fontSize: window.innerWidth <= 768 ? 32 : 40, 
                    color: selectedNode.unlocked ? '#58cc02' : '#FFD700', 
                    marginBottom: window.innerWidth <= 768 ? 6 : 8 
                  }}>
                    {selectedNode.unlocked ? 'emoji_events' : 'lock'}
                  </span>
                  <h3 style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem', 
                    margin: 0, 
                    fontFamily: 'Fira Mono, Menlo, Consolas, monospace', 
                    fontWeight: 300,
                    lineHeight: 1.3
                  }}>{selectedNode.label}</h3>
                  <div style={{ 
                    color: '#6c6f7d', 
                    fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem', 
                    margin: window.innerWidth <= 768 ? '8px 0 0 0' : '12px 0 0 0', 
                    fontFamily: 'Fira Mono, Menlo, Consolas, monospace', 
                    fontWeight: 300,
                    lineHeight: 1.4
                  }}>
                    {selectedNode.unlocked ? 'Skill unlocked! Keep progressing.' : 'This skill is locked. Complete previous skills to unlock.'}
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    style={{
                      marginTop: window.innerWidth <= 768 ? 14 : 18,
                      padding: window.innerWidth <= 768 ? '6px 18px' : '8px 22px',
                      borderRadius: window.innerWidth <= 768 ? 12 : 14,
                      background: '#58cc02',
                      color: '#fff',
                      border: 'none',
                      fontSize: window.innerWidth <= 768 ? '0.9rem' : '0.98rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px #58cc0222',
                      transition: 'all 0.2s',
                      fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
                      fontWeight: 300,
                    }}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default ProgressionMap; 