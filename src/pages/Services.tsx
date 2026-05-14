import { Service } from "../types";
import SvcCard from "../components/SvcCard";
import { WHY } from "../constants";

export default function Services({ svcs, goTo }: { svcs: Service[]; goTo: (p: string) => void }) {
  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">What We Offer</div><h1 className="fd">Our Services</h1>
      <p>Three essential lifestyle services — select one and book in seconds.</p>
    </div></div>
    <div className="dash"><div className="dash-inner">
      <div className="dash-lbl">Tap any service card to get started</div>
      <div className="cards-grid">{svcs.map((s,i)=><SvcCard key={i} s={s} onBook={()=>goTo("booking")}/>)}</div>
    </div></div>
    <div className="sec"><div className="sec-hdr centered"><div className="sec-lbl">Why KTT</div><h2 className="fd sec-title">The KTT difference</h2></div>
      <div className="why-grid">{WHY.map((w,i)=><div key={i} className="why-card"><div className="why-ico">{w.icon}</div><div><h4>{w.title}</h4><p>{w.desc}</p></div></div>)}</div>
    </div>
  </>);
}
