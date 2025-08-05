import React from 'react';
import { motion } from 'framer-motion';

interface Step {
  label: string;
  icon: string; // Material icon name or emoji
}

interface LogicFlowStepperProps {
  steps: Step[];
  currentStep: number; // 0-based index
  className?: string;
}

const LogicFlowStepper: React.FC<LogicFlowStepperProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={`lq-logic-stepper ${className || ''}`} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '1rem 0',
      gap: '0.1rem',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'auto',
      padding: '0 0.5rem',
    }}>
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        const isFuture = idx > currentStep;
        
        return (
          <React.Fragment key={step.label}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              minWidth: 'min(80px, 20vw)',
              position: 'relative',
              zIndex: 2,
              flexShrink: 0,
            }}>
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(88, 204, 2, 0.2)'
                    : isCompleted
                      ? '0 2px 6px rgba(88, 204, 2, 0.15)'
                      : '0 1px 3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: isActive
                    ? '#fff'
                    : isCompleted
                      ? '#58cc02'
                      : '#f5f5f5',
                  borderColor: isActive
                    ? '#58cc02'
                    : isCompleted
                      ? '#58cc02'
                      : isFuture
                        ? '#ddd'
                        : '#eee',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 20,
                  duration: 0.2,
                }}
                style={{
                  width: 'min(40px, 10vw)',
                  height: 'min(40px, 10vw)',
                  borderRadius: '50%',
                  border: '2px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 'min(1.2rem, 4vw)',
                  color: isActive 
                    ? '#58cc02' 
                    : isCompleted 
                      ? '#fff' 
                      : isFuture
                        ? '#aaa'
                        : '#999',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  position: 'relative',
                  marginBottom: 6,
                  cursor: 'pointer',
                }}
                whileHover={!isActive ? { scale: 1.05 } : {}}
              >
                <span 
                  className="material-icons" 
                  style={{ 
                    fontSize: 'min(1.2rem, 4vw)', 
                    verticalAlign: 'middle',
                  }}
                >
                  {step.icon}
                </span>
                {isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#58cc02',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid white',
                    color: 'white',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                  }}>
                    ✓
                  </div>
                )}
              </motion.div>
              
              <motion.span 
                initial={false}
                animate={{
                  color: isActive 
                    ? '#58cc02' 
                    : isCompleted 
                      ? '#58a700' 
                      : isFuture
                        ? '#aaa'
                        : '#888',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 'min(0.75rem, 3vw)',
                  marginTop: 2,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  display: 'inline-block',
                  padding: '0 2px',
                  lineHeight: 1.2,
                }}
              >
                {step.label}
              </motion.span>
            </div>
            
            {idx < steps.length - 1 && (
              <motion.div
                initial={false}
                animate={{ 
                  backgroundColor: isCompleted ? '#58cc02' : '#e5e5e5',
                  opacity: isFuture ? 0.5 : 1
                }}
                transition={{ duration: 0.3 }}
                style={{
                  height: 2,
                  flex: 1,
                  maxWidth: 'min(40px, 10vw)',
                  borderRadius: 1,
                  backgroundColor: isCompleted ? '#58cc02' : '#e5e5e5',
                  marginBottom: 'min(30px, 7.5vw)',
                  alignSelf: 'center',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
      
      {/* Dark mode styles for material icons */}
      <style>{`
        body.dark .lq-logic-stepper .material-icons,
        .dark .lq-logic-stepper .material-icons {
          color: #e2e8f0 !important;
        }
      `}</style>
    </div>
  );
};

export default LogicFlowStepper;