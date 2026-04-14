import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GooeyNav.css';

const GooeyNav = ({
  items,
  animationTime = 500,
  particleCount = 14,
  particleDistances = [85, 25],
  particleR = 85,
  timeVariance = 200,
  colors = ['#00E5FF', '#FF0055', '#FFD700', '#39FF14', '#7000FF'],
  initialActiveIndex = 0
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [isGlowing, setIsGlowing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setActiveIndex(initialActiveIndex); }, [initialActiveIndex]);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = (element) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--particle-color', p.color);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => { element.classList.add('active'); });
        setTimeout(() => { try { element.removeChild(particle); } catch { } }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element) => {
    if (!containerRef.current || !filterRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
  };

  const handleClick = (e, index) => {
    const liEl = e.currentTarget.parentElement;
    if (activeIndex === index) return;

    setActiveIndex(index);
    updateEffectPosition(liEl);
    setIsGlowing(true);

    if (filterRef.current) {
      filterRef.current.classList.remove('active');
      void filterRef.current.offsetWidth;
      filterRef.current.querySelectorAll('.particle').forEach(p => {
        try { filterRef.current.removeChild(p); } catch { }
      });
      makeParticles(filterRef.current);
    }

    if (items[index]?.href) { navigate(items[index].href); }

    setTimeout(() => {
      setIsGlowing(false);
    }, 600);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement;
      if (liEl) handleClick({ currentTarget: liEl.firstChild }, index);
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
      if (filterRef.current) {
        filterRef.current.classList.remove('active');
        void filterRef.current.offsetWidth;
        filterRef.current.classList.add('active');
      }
    }
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) updateEffectPosition(currentActiveLi);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li key={index} className={activeIndex === index ? 'active' : ''}>
              <a
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleClick(e, index); }}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {/* Background glowing particles layer */}
      <span className={`effect filter ${isGlowing ? 'glowing' : ''}`} ref={filterRef} />
    </div>
  );
};

export default GooeyNav;