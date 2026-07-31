import { Service } from "../types";

export default function SvcCard({ s, onBook }: { s: Service; onBook: () => void; key?: any }) {
  return (
    <div className={`svc-card ${s.cardClass}`} onClick={onBook}>
      <div className="svc-stripe" style={{background:s.stripe}}/>
      <div className="svc-body">
        <div>
          <div className="svc-lbl" style={{color:s.numColor}}>{s.label}</div>
          <div className="svc-num" style={{color:s.numColor}}>{s.number}</div>
          <div className="svc-title">{s.title}</div>
          <div className="svc-sub">{s.sub}</div>
          {s.description && <div className="svc-desc" style={{ fontSize: 13, color: "#aaa", marginTop: 8, lineHeight: 1.5 }}>{s.description}</div>}
        </div>
        <div className="svc-icon" style={{background:s.iconBg,borderColor:s.numColor+"44"}}>{s.emoji}</div>
      </div>
      <div className="svc-bar-wrap"><div className="svc-bar-bg"><div className="svc-bar-fill" style={{background:s.barColor}}/></div></div>
      {(s.basePrice||s.deliveryFee||s.minOrder) && (
        <div className="svc-price-box">
          {s.basePrice&&<span className="price-item">From <strong>₦{s.basePrice}</strong></span>}
          {s.deliveryFee&&<span className="price-item">Delivery <strong>₦{s.deliveryFee}</strong></span>}
          {s.minOrder&&<span className="price-item">{s.minOrder}</span>}
        </div>
      )}
      <div className="svc-feats">
        {s.features.filter(Boolean).map((f,i)=><div key={i} className="svc-feat"><span style={{color:s.featColor,fontWeight:700,fontSize:11}}>✓</span>{f}</div>)}
      </div>
      {s.media&&s.media.length>0 && (
        <div className="svc-media-row">
          {s.media.slice(0,5).map((m,i)=>m.type==="video"
            ?<video key={i} src={m.url} className="media-t" muted/>
            :<img key={i} src={m.url} className="media-t" alt=""/>)}
        </div>
      )}
      <div className="svc-footer">
        <span className="svc-tap">{s.tap}</span>
        <button className="svc-btn" style={{background:s.btnBg,color:s.btnColor}} onClick={e=>{e.stopPropagation();onBook();}}>{s.btnLabel}</button>
      </div>
    </div>
  );
}
