import { Service, Plan } from "../types";
import { WHY, TESTIMONIALS, C } from "../constants";
import SvcCard from "../components/SvcCard";

export default function Home({ svcs, plans, goTo }: { svcs: Service[]; plans: Plan[]; goTo: (p: string) => void }) {
  return (<>
    <div className="hero-wrap">
      <div className="hero-inner">
        <div className="pill"><span style={{ width: 6, height: 6, background: "var(--neon-lime)", borderRadius: "50%" }}></span>NOW SERVING ABUJA</div>
        <h1 className="headline">Everything Home, <br /><em>One Platform.</em></h1>
        <p className="tagline">Reliable food delivery, professional laundry care, and premium cleaning services in Abuja.</p>
      </div>
    </div>

    <div className="tabs">
      {[{i:"🏠",l:"Home"},{i:"🍽️",l:"Food Delivery"},{i:"👔",l:"Laundry"},{i:"🧹",l:"Cleaning"},{i:"💳",l:"Plans"},{i:"📞",l:"Contact"}].map((t,i)=>(
        <button key={i} className={`tab${i===0?" active":""}`} onClick={()=>{if(i===1||i===2||i===3)goTo("booking");if(i===4)goTo("plans");if(i===5)goTo("contact");}}>
          {t.i} {t.l}
        </button>
      ))}
    </div>

    <div className="dash"><div className="dash-inner">
      <div className="stats-grid">
        {[{n:"2,500+",l:"Customers",c:"var(--neon-lime)"},{n:"98%",l:"Satisfaction",c:"var(--bright-orange)"},{n:"50K+",l:"Orders Done",c:"var(--neon-lime)"},{n:"24/7",l:"Support",c:"var(--bright-orange)"}].map((s,i)=>(
          <div key={i} className="stat-item"><span className="stat-num" style={{color:s.c}}>{s.n}</span><span className="stat-label">{s.l}</span></div>
        ))}
      </div>
      <div className="dash-lbl">Select a service &amp; book instantly</div>
      <div className="cards-grid">
        {svcs.map((s,i)=><SvcCard key={i} s={s} onBook={()=>goTo("booking")}/>)}
      </div>
    </div></div>

    <div className="sec">
      <div className="sec-hdr"><div className="sec-lbl">Why KTT</div><h2 className="fd sec-title">Built for your <span style={{color:"var(--neon-lime)"}}>convenience.</span></h2><p className="sec-sub">Every part of our service is designed to make your everyday life simpler.</p></div>
      <div className="why-grid">{WHY.map((w,i)=><div key={i} className="why-card"><div className="why-ico">{w.icon}</div><div><h4>{w.title}</h4><p>{w.desc}</p></div></div>)}</div>
    </div>

    <div className="plans-bg"><div className="plans-inner">
      <div className="sec-hdr centered"><div className="sec-lbl">Pricing</div><h2 className="fd sec-title">Simple, honest pricing.</h2><p className="sec-sub" style={{margin:"0 auto"}}>Subscribe and save.</p></div>
      <div className="plans-grid">{plans.map((p,i)=>(
        <div key={i} className={`plan-card${p.featured?" hot":""}`}>
          {p.badge&&p.featured&&<div className="plan-badge">{p.badge}</div>}
          <div className="plan-name">{p.name}</div>
          <div className="plan-price"><sup>₦</sup>{p.price}</div>
          <div className="plan-period">{p.period}</div>
          <hr className="plan-div"/>
          <ul className="plan-feats">{p.features.filter(Boolean).map((f,j)=><li key={j}>{f}</li>)}</ul>
          <button className={`plan-cta ${p.ctaClass}`} onClick={()=>goTo("booking")}>{p.cta}</button>
        </div>
      ))}</div>
    </div></div>

    <div className="sec">
      <div className="sec-hdr centered"><div className="sec-lbl">Testimonials</div><h2 className="fd sec-title">What our customers say.</h2></div>
      <div className="testi-grid">{TESTIMONIALS.map((t,i)=>(
        <div key={i} className="testi-card">
          <div className="testi-stars">{t.stars}</div>
          <p className="testi-txt">"{t.text}"</p>
          <div className="testi-author">
            <div className="testi-av" style={{background:t.bg,color:t.tc}}>{t.name[0]}</div>
            <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
          </div>
        </div>
      ))}</div>
    </div>

    <div className="cta-strip">
      <div className="sec-lbl" style={{display:"flex",justifyContent:"center",marginBottom:8}}>Ready to get started?</div>
      <h2 className="fd sec-title" style={{marginBottom:8}}>Book your first service today.</h2>
      <p className="sec-sub" style={{margin:"0 auto 24px"}}>No commitments. Just great service at your door.</p>
      <div style={{display:"flex",gap:11,justifyContent:"center",flexWrap:"wrap"}}>
        <button className="btn-orange" style={{fontSize:15,padding:"13px 26px"}} onClick={()=>goTo("booking")}>Book a Service</button>
        <button className="btn-lime" style={{fontSize:15,padding:"13px 26px"}} onClick={()=>goTo("plans")}>View Plans</button>
        <a href="https://wa.me/2348160880608" className="wa-btn" target="_blank" rel="noreferrer">💬 WhatsApp Us</a>
      </div>
    </div>
  </>);
}
