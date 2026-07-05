import { memo } from 'react';
import styles from './EuropeBusinessMap.module.css';

interface RouteParticleProps {
  path: string;
  delay?: number;
  dur?: number;
  className?: string;
}

export const RouteParticle = memo(function RouteParticle({
  path,
  delay = 0,
  dur = 2.5,
  className = styles.particle,
}: RouteParticleProps) {
  return (
    <circle r="0.35" className={className}>
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
    </circle>
  );
});
