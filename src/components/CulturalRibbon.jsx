import React from 'react';
import './CulturalRibbon.css';

// 11 Traditional Geometric & Cultural Motifs matching the TurismoTrack ribbon
const RIBBON_SEGMENTS = [
  { id: 1, icon: '▼' },
  { id: 2, icon: '|||' },
  { id: 3, icon: '✤' },
  { id: 4, icon: '❖' },
  { id: 5, icon: '■' },
  { id: 6, icon: '▲' },
  { id: 7, icon: '▲' },
  { id: 8, icon: '▣' },
  { id: 9, icon: '◆' },
  { id: 10, icon: '✦' },
  { id: 11, icon: '●' },
];

export default function CulturalRibbon({ className = '' }) {
  return (
    <div className={`tt-cultural-ribbon ${className}`} aria-hidden="true">
      {RIBBON_SEGMENTS.map((seg) => (
        <div key={seg.id} className={`tt-ribbon-segment tt-ribbon-seg-${seg.id}`}>
          <span className="tt-ribbon-icon">{seg.icon}</span>
        </div>
      ))}
    </div>
  );
}
