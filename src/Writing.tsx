import { Link } from 'react-router-dom';
import { ShareButton } from './Share';
import { imageExcerpts, writings, type Writing } from './writings';
import './writing.css';


function ReadingMusic() {
  return <aside className="reading-music" aria-label="阅读背景音乐">
    <div className="music-credit"><span>原创音乐 · 伴着音乐，慢慢读</span><strong>我的心真的静下来了</strong></div>
    <p className="music-footnote">右下角悬浮按钮可播放或暂停背景音乐。</p>
  </aside>;
}

export function WritingTeaser() {
  const poem = writings[0];
  return <section id="writing" className="section shell writing-teaser reveal"><div className="section-head"><div><p className="eyebrow">02 / WORDS TO KEEP</p><h2>让心里的声音，有处停留。</h2></div><Link to="/writing" className="text-link">读我的文字 ↗</Link></div><Link to={`/writing/${poem.slug}`} className="poem-preview"><div className="poem-preview-aside"><span className="eyebrow">{poem.kind} / 01</span><h3>{poem.title}</h3><span className="poem-signature">阿锋 / 写给此刻</span></div><div className="poem-preview-lines"><p>我的心静下来了</p><p>朋友们，我的心真的静下来了</p><p>我的内心反而充满了想要给予关怀的能量。</p><span className="text-link">读完整首诗 ↗</span></div></Link><div className="writing-teaser-foot"><span>自己的诗、感悟片段，以及想留下的文字。</span><a href="https://blog.csdn.net/weixin_43342105" target="_blank" rel="noopener noreferrer">技术博客 ↗</a></div></section>;
}

function Poem({ poem }: { poem: Writing }) {
  return <article className="poem-sheet"><header className="poem-heading reveal"><p className="eyebrow">{poem.kind} / WORDS FROM WITHIN</p><h1>{poem.title}</h1><p className="poem-byline">{[poem.period, '阿锋', '原创文字'].filter(Boolean).join(' · ')}</p></header><div className="poem-body">{poem.stanzas.map((lines, i) => <div className="poem-stanza reveal" key={i}>{lines.map((line, j) => <p key={j}>{line}</p>)}</div>)}</div><footer className="poem-ending reveal"><span className="poem-seal" aria-hidden="true">锋</span><p>把这一刻，轻轻留下。</p><ShareButton title={poem.title} description={poem.stanzas[poem.stanzas.length - 1].join(' ')} /></footer></article>;
}

const orderedWritings = [...writings].sort((a, b) =>
  Number(b.slug === 'a-quiet-heart') - Number(a.slug === 'a-quiet-heart') ||
  (b.period?.split('–')[0] || '0000').localeCompare(a.period?.split('–')[0] || '0000'));
const writingGroups = Array.from(orderedWritings.reduce((groups, item) => {
  const period = item.period || '未标注时间';
  groups.set(period, [...(groups.get(period) || []), item]);
  return groups;
}, new Map<string, Writing[]>()));

function WritingList() {
  return <section className="writing-list-section" aria-labelledby="writing-list-title">
    <header className="writing-list-heading reveal">
      <p className="eyebrow">WORDS FROM WITHIN</p>
      <h1 id="writing-list-title">诗与随笔 · 原创</h1>
      <p>把路过的风景、心里的声音，慢慢写下来。</p>
    </header>
    <div className="writing-list">
      {writingGroups.map(([period, items]) => <section className="writing-period" key={period} aria-label={`${period}年的文字`}>
        <header className="writing-period-heading reveal"><h2>{period}</h2><span>{items.length} 篇文字</span></header>
        {items.map(item => <Link to={`/writing/${item.slug}`} className="writing-list-item reveal" key={item.slug}>
          <span className="writing-list-number">{String(orderedWritings.indexOf(item) + 1).padStart(2, '0')}</span>
          <div className="writing-list-copy">
            <span className="eyebrow">{item.kind} · 原创文字</span>
            <h3>{item.title}</h3>
            <p>{item.stanzas[0].join(' ')}</p>
          </div>
          <span className="writing-list-arrow" aria-hidden="true">↗</span>
        </Link>)}
      </section>)}
    </div>
  </section>;
}

function WritingNavigation({ poem }: { poem: Writing }) {
  const index = orderedWritings.indexOf(poem);
  const previous = orderedWritings[index - 1];
  const next = orderedWritings[index + 1];
  return <nav className="writing-pagination reveal" aria-label="随笔导航">
    {previous ? <Link to={`/writing/${previous.slug}`}><span>← 上一篇</span><strong>{previous.title}</strong></Link> : <span />}
    {next ? <Link to={`/writing/${next.slug}`}><span>下一篇 →</span><strong>{next.title}</strong></Link> : <Link to="/writing"><span>返回列表 →</span><strong>读更多文字</strong></Link>}
  </nav>;
}

export function WritingPage({ slug }: { slug?: string }) {
  const poem = slug ? writings.find(item => item.slug === slug) : undefined;
  if (slug && !poem) return <main className="not-found shell"><h1>这页文字还没写下。</h1><Link to="/writing" className="text-link">返回文字 ↗</Link></main>;
  return <main className="writing-page shell"><div className="reading-header"><Link to={poem ? '/writing' : '/#writing'} className="back">{poem ? '← 返回文字' : '← 返回首页'}</Link><span className="eyebrow">POEMS · MOMENTS · LITTLE THOUGHTS</span></div><div className="reading-layout"><div className="reading-column">{poem ? <><Poem poem={poem} /><WritingNavigation poem={poem} />{imageExcerpts.length > 0 && <section className="excerpt-gallery" aria-label="原创手稿图片">{imageExcerpts.map(item => <figure key={item.src}><a href={`${import.meta.env.BASE_URL}${item.src}`} target="_blank" rel="noopener noreferrer"><img src={`${import.meta.env.BASE_URL}${item.src}`} alt={item.alt} loading="lazy" /></a>{item.caption && <figcaption>{item.caption}</figcaption>}</figure>)}</section>}</> : <WritingList />}<div className="writing-afterword reveal"><p>这里收录的是我的原创诗歌、随笔与感悟。</p><p>我的大部分写作尚未收录于此，本站仅呈现其中的一小部分。</p><p>这些文字主要展现我积极、向上的一面，并非我全部的生活与心境。</p><p>不赶路，读到哪里，就停在哪里。</p></div></div><ReadingMusic /></div></main>;
}
