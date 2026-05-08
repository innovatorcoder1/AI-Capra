import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const generateParticles = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));
};

export default function ParticleField() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(generateParticles(30));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 201, 114, 0.4)',
            boxShadow: '0 0 10px rgba(0, 201, 114, 0.8)'
          }}
          animate={{
            y: ['0vh', '-100vh']
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay
          }}
        />
      ))}
    </div>
  );
}
