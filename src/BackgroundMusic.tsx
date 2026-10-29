import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './music.css';

const tracks = {
  home: { title: '走出一条新的路来', credit: '改编', src: 'audio/about-new-road.mp3' },
  about: { title: '思恋观世音', credit: '翻唱', src: 'audio/home-guanshiyin-compatible.m4a' },
  writing: { title: '我的心真的静下来了', credit: '原创', src: 'audio/writing-quiet-heart-compatible.m4a' },
};

export function isIOSDevice(device: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'>) {
  return /iPad|iPhone|iPod/i.test(device.userAgent) ||
    (/Mac/i.test(device.platform) && device.maxTouchPoints > 1);
}

function TrackPlayer({ track }: { track: typeof tracks.home }) {
  const ios = isIOSDevice(navigator);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(ios);
  const [error, setError] = useState(false);
  const manualPause = useRef(false);
  const alive = useRef(false);

  useEffect(() => {
    const player = audio.current!;
    alive.current = true;
    let cancelled = false;
    player.volume = .35;
    // Call play synchronously inside the trusted gesture (especially on iOS).
    // touchend/click remain fallbacks when Safari rejects touchstart playback.
    const gestures = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'] as const;
    const removeGestureListeners = () => {
      gestures.forEach(type => window.removeEventListener(type, unlock, true));
    };
    const attempt = () => {
      if (cancelled || manualPause.current) return;
      if (!player.paused) { removeGestureListeners(); return; }
      if (player.error) player.load();
      void player.play().then(() => {
        if (cancelled) return;
        setBlocked(false);
        setError(false);
        removeGestureListeners();
      }).catch((reason: unknown) => {
        if (cancelled) return;
        if (reason instanceof DOMException && reason.name === 'NotAllowedError') setBlocked(true);
        else if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(true);
      });
    };
    function unlock(event: Event) {
      if (event.target instanceof Element && event.target.closest('.ambient-music')) return;
      attempt();
    }
    gestures.forEach(type => window.addEventListener(type, unlock, { capture: true, passive: true }));
    // iPadOS can advertise a desktop Mac user agent; touch capability above
    // distinguishes it from macOS. Only iOS deliberately waits for a gesture.
    if (ios) setBlocked(true);
    else attempt();
    return () => {
      cancelled = true;
      alive.current = false;
      removeGestureListeners();
      player.pause();
    };
  }, []);

  async function toggle() {
    const player = audio.current!;
    if (!player.paused) {
      manualPause.current = true;
      player.pause();
      return;
    }
    manualPause.current = false;
    setError(false);
    try {
      if (player.error) player.load();
      await player.play();
      if (alive.current) setBlocked(false);
    } catch (reason) {
      if (!alive.current) return;
      if (reason instanceof DOMException && reason.name === 'NotAllowedError') setBlocked(true);
      else if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(true);
    }
  }

  return <aside className={`ambient-music ${playing ? 'is-playing' : ''}`} aria-label="页面背景音乐">
    <audio ref={audio} src={`${import.meta.env.BASE_URL}${track.src}`} loop playsInline preload="metadata"
      onPlay={() => { setPlaying(true); setBlocked(false); }} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setError(true); }} />
    <button type="button" className="ambient-toggle" onClick={() => void toggle()} aria-label={`${playing ? '暂停' : '播放'}背景音乐：${track.title}`} aria-pressed={playing}>
      <span className="ambient-icon" aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
      <span className="ambient-copy"><strong><span className="music-original">{track.credit}</span>{track.title}</strong><small role="status">{error ? '暂时无法播放，点击重试' : playing ? '正在播放 · 点击暂停' : blocked ? (ios ? '轻触页面开启音乐' : '浏览器限制自动播放，点击开启') : '已暂停 · 点击播放'}</small></span>
      <span className="music-bars" aria-hidden="true"><i /><i /><i /><i /></span>
    </button>
  </aside>;
}

export function BackgroundMusic() {
  const { pathname } = useLocation();
  // Keep the same keyed audio element across home and product routes so that
  // playback position and the visitor's manual pause state survive navigation.
  const key = pathname === '/' || pathname.startsWith('/projects/') ? 'home' : pathname === '/about' ? 'about' : pathname === '/writing' || pathname.startsWith('/writing/') ? 'writing' : null;
  return key ? <TrackPlayer key={key} track={tracks[key]} /> : null;
}
