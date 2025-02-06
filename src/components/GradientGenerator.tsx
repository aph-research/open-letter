import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import type { GradientStyle } from '@/app/types/gradient';

const wildColors = {
  reds: ['#ff0000', '#ff4444', '#ff6b6b', '#ff8585', '#d10000'],
  blues: ['#0066ff', '#0099ff', '#00ccff', '#4da6ff', '#0040ff'],
  greens: ['#00ff66', '#00ff99', '#00ffcc', '#4dffb8', '#00cc66'],
  purples: ['#6600ff', '#9933ff', '#cc66ff', '#b84dff', '#4d00ff'],
  pinks: ['#ff00cc', '#ff33cc', '#ff66cc', '#ff99cc', '#cc0099'],
  teals: ['#00ffff', '#33ffff', '#66ffff', '#99ffff', '#00cccc']
};

interface Props {
  onGradientChange: (style: GradientStyle) => void;
}

export const GradientGenerator: React.FC<Props> = ({ onGradientChange }) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [currentGradient, setCurrentGradient] = useState<GradientStyle | null>(null);

  const generateWildGradient = () => {
    const usedFamilies = new Set();
    const getUniqueColor = () => {
      const availableFamilies = Object.entries(wildColors).filter(([name]) => !usedFamilies.has(name));
      const [familyName, family] = availableFamilies[Math.floor(Math.random() * availableFamilies.length)];
      usedFamilies.add(familyName);
      return family[Math.floor(Math.random() * family.length)];
    };

    const style: GradientStyle = {
      backgroundImage: `linear-gradient(45deg, ${getUniqueColor()} 0%, ${getUniqueColor()} 50%, ${getUniqueColor()} 100%),
                       linear-gradient(135deg, transparent 0%, ${getUniqueColor()}99 50%, transparent 100%)`,
      backgroundAttachment: 'fixed',
      backgroundBlendMode: 'overlay',
      color: 'white'
    };
    
    setCurrentGradient(style);
    onGradientChange(style);
  };

  const copyToClipboard = () => {
    if (!currentGradient) return;
    
    const code = `backgroundImage: \`${currentGradient.backgroundImage}\``;
    
    navigator.clipboard.writeText(code);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  return (
    <>
      <button
        onClick={generateWildGradient}
        className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        New Gradient
      </button>
      
      {currentGradient && (
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
        >
          <Copy className="w-4 h-4" />
          {copiedToClipboard ? 'Copied!' : 'Copy CSS'}
        </button>
      )}
    </>
  );
};