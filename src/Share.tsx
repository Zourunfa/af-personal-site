import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { profile } from './content';
import * as QRCode from 'qrcode';

type ShareProps = { title?: string; description?: string };
type Poster = { image: string; file: File; width: number; height: number };

async function loadPosterPhoto() {
  const image = new Image();
  image.src = `${import.meta.env.BASE_URL}afeng-travel.jpg`;
  await image.decode();
  return image;
}

function wrapText(context: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = '';
  for (const char of text) {
    if (char === '\n' || context.measureText(line + char).width > width) {
      lines.push(line);
      line = char === '\n' ? '' : char;
    } else line += char;
  }
  if (line) lines.push(line);
  return lines;
}

export async function createPoster(title: string, description: string, url: string, showTitle = true): Promise<Poster> {
  const photo = await loadPosterPhoto();
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前浏览器无法生成图片，请尝试复制链接');
  const font = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.font = `600 64px ${font}`;
  const titleLines = showTitle ? wrapText(ctx, title, 952).slice(0, 2) : [];
  const photoY = showTitle ? 270 + (titleLines.length - 1) * 82 : 186;
  ctx.font = `27px ${font}`;
  const descriptionLines = wrapText(ctx, description, 952).slice(0, 3);
  ctx.font = `23px ${font}`;
  const urlLines = wrapText(ctx, url, 550);
  const footerHeight = Math.max(360, 275 + Math.max(0, urlLines.length - 1) * 32 + 15);
  const qrY = canvas.height - 40 - footerHeight;
  const dividerY = qrY - 20;
  const descriptionY = dividerY - 28 - Math.max(0, descriptionLines.length - 1) * 42;
  // The poster, not the photo, is 9:16. Give the photo all remaining height.
  const photoHeight = descriptionY - 36 - photoY;
  const linkY = qrY + 275;
  ctx.fillStyle = '#f8f7f3'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#292b27'; ctx.font = 'italic bold 72px Georgia'; ctx.fillText('a.', 64, 108);
  ctx.font = `500 30px ${font}`; ctx.fillText('阿锋', 158, 99);
  ctx.fillStyle = '#7b7c74'; ctx.font = `18px ${font}`; ctx.fillText('代码 · 音乐 · 旅途', 810, 99);
  ctx.strokeStyle = '#deded5'; ctx.beginPath(); ctx.moveTo(64, 142); ctx.lineTo(1016, 142); ctx.stroke();
  ctx.fillStyle = '#292b27'; ctx.font = `600 64px ${font}`;
  titleLines.forEach((line, i) => ctx.fillText(line, 64, 230 + i * 82));
  // Prefer trimming the sky rather than the shoes when a cover crop is needed.
  const scale = Math.max(952 / photo.naturalWidth, photoHeight / photo.naturalHeight);
  const sourceWidth = 952 / scale, sourceHeight = photoHeight / scale;
  const sourceX = (photo.naturalWidth - sourceWidth) / 2;
  const sourceY = (photo.naturalHeight - sourceHeight) * .95;
  ctx.save(); ctx.beginPath(); ctx.roundRect(64, photoY, 952, photoHeight, 12); ctx.clip();
  ctx.drawImage(photo, sourceX, sourceY, sourceWidth, sourceHeight, 64, photoY, 952, photoHeight);
  ctx.restore();
  ctx.fillStyle = '#72746b'; ctx.font = `27px ${font}`;
  descriptionLines.forEach((line, i) => ctx.fillText(line, 64, descriptionY + i * 42));
  ctx.strokeStyle = '#deded5'; ctx.beginPath(); ctx.moveTo(64, dividerY); ctx.lineTo(1016, dividerY); ctx.stroke();
  const qr = document.createElement('canvas');
  await QRCode.toCanvas(qr, url, { width: 360, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#292b27', light: '#ffffff' } });
  ctx.drawImage(qr, 656, qrY, 360, 360);
  ctx.fillStyle = '#b95d46'; ctx.font = `500 23px ${font}`; ctx.fillText('长按识别 / 微信扫一扫', 64, qrY + 49);
  ctx.fillStyle = '#292b27'; ctx.font = `500 36px ${font}`; ctx.fillText('来我的个人空间坐坐。', 64, qrY + 112);
  ctx.fillStyle = '#72746b'; ctx.font = `24px ${font}`; ctx.fillText('产品、记录，还有生活里的好奇。', 64, qrY + 162);
  ctx.font = `19px ${font}`; ctx.fillText('网页链接', 64, qrY + 237);
  ctx.fillStyle = '#292b27'; ctx.font = `23px ${font}`;
  urlLines.forEach((line, i) => ctx.fillText(line, 64, linkY + i * 32));
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('图片生成失败，请重试')), 'image/png'));
  return { image: canvas.toDataURL('image/png'), file: new File([blob], '阿锋-分享海报.png', { type: 'image/png' }), width: canvas.width, height: canvas.height };
}

export function ShareButton({ title = '阿锋的个人空间', description = '我是阿锋，写代码、做产品，也弹吉他、吹口琴，去远方走走。' }: ShareProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [poster, setPoster] = useState<Poster | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [posterError, setPosterError] = useState('');
  const generation = useRef(0);
  const url = new URL(window.location.pathname, profile.siteOrigin).href;
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

  useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.current?.showModal();
      return () => { document.body.style.overflow = previousOverflow; };
    }
  }, [open]);
  useEffect(() => () => { generation.current++; }, []);

  function close() {
    generation.current++;
    dialog.current?.close();
    setOpen(false); setBusy(false); setPoster(null); setMessage(''); setPosterError('');
    trigger.current?.focus();
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('链接已复制，可以粘贴给朋友。');
    } catch {
      linkInput.current?.focus(); linkInput.current?.select();
      setMessage('请长按或使用 Ctrl/Cmd+C 复制下方已选中的链接。');
    }
  }
  async function systemShare(withImage = false) {
    try {
      const data: ShareData = withImage && poster ? { files: [poster.file], title } : { title: `${title} — 阿锋`, text: description, url };
      if (typeof navigator.share !== 'function' || (withImage && (!navigator.canShare || !navigator.canShare(data)))) {
        setMessage(withImage ? '此浏览器不支持分享图片，请保存海报后在微信中分享。' : '此浏览器不支持系统分享，请复制链接或保存海报。');
        return;
      }
      await navigator.share(data);
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) setMessage('系统分享未能打开，可以复制链接或保存海报。');
    }
  }
  async function generate() {
    const id = ++generation.current;
    setBusy(true); setPosterError('');
    try {
      const result = await createPoster(title, description, url, title !== '阿锋的个人空间');
      if (id === generation.current) setPoster(result);
    } catch (error) {
      if (id === generation.current) setPosterError('海报生成失败，请检查网络后重试；若页面已打开较久，请刷新后再生成。');
    } finally {
      if (id === generation.current) setBusy(false);
    }
  }
  return <>
    <button ref={trigger} className="share-trigger" onClick={() => setOpen(true)} aria-haspopup="dialog"><span aria-hidden="true">↗</span> 分享</button>
    {open && createPortal(<dialog className="share-dialog" ref={dialog} aria-labelledby="share-heading" onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="share-dialog-inner"><button className="share-close" aria-label="关闭分享" onClick={close}>×</button>
        <p className="eyebrow">SHARE A LITTLE CURIOSITY</p><h2 id="share-heading">把这份好奇，分享出去。</h2>
        <p className="share-description">{title}</p>
        <div className="share-options">
          {typeof navigator.share === 'function' && <button onClick={() => void systemShare()}>系统分享 ↗</button>}
          <button onClick={() => void copyLink()}>复制链接</button>
          <button onClick={() => void generate()} disabled={busy}>{busy ? '正在生成…' : poster ? '重新生成海报' : '生成分享海报'}</button>
        </div>
        <label className="share-link-label" htmlFor="share-url">分享链接</label><input ref={linkInput} id="share-url" readOnly value={url} onFocus={e => e.target.select()} />
        <p className="share-hint">{isWeChat ? '在微信中，可点右上角「…」分享到朋友圈；也可以保存海报后发布。' : '分享到朋友圈：保存海报后，在微信中选择图片发布。系统分享中的可用应用以手机为准。'}</p>
        <p role="status" className="share-status">{message}</p>
        {posterError && <p role="alert" className="share-error">{posterError}</p>}
        {poster && <div className="share-poster"><img src={poster.image} width={poster.width} height={poster.height} alt={`${title}，阿锋的分享海报，附有此页面二维码`} /><div className="share-poster-actions"><a href={poster.image} download="阿锋-分享海报.png" className="button">保存海报 ↓</a><button onClick={() => void systemShare(true)}>分享图片 ↗</button></div><p className="share-hint">若未弹出下载，请长按海报保存图片。</p></div>}
      </div>
    </dialog>, document.body)}
  </>;
}
