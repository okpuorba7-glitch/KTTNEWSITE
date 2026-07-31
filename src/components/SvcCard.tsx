import React, { useState } from "react";
import { Service } from "../types";

export default function SvcCard({ s, onBook }: { s: Service; onBook: () => void; key?: any }) {
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

  const activeMedia = s.media && s.media.length > 0 
    ? s.media[selectedMediaIdx] || s.media[0] 
    : null;

  return (
    <div className={`svc-card ${s.cardClass}`} onClick={onBook}>
      <div className="svc-stripe" style={{background:s.stripe}}/>
      
      {/* Featured Cover Image/Video Banner */}
      {activeMedia && (
        <div style={{ position: "relative", width: "100%", height: 180, overflow: "hidden", background: "#000" }}>
          {activeMedia.type === "video" ? (
            <video src={activeMedia.url} muted autoPlay loop style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <img src={activeMedia.url} alt={activeMedia.name || s.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.3s ease" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(17,17,17,0.9) 100%)" }} />
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
            {s.emoji} {s.label}
          </div>
        </div>
      )}

      <div className="svc-body" style={{ paddingTop: activeMedia ? 16 : 24 }}>
        <div>
          <div className="svc-lbl" style={{color:s.numColor}}>{s.label}</div>
          <div className="svc-num" style={{color:s.numColor}}>{s.number}</div>
          <div className="svc-title">{s.title}</div>
          <div className="svc-sub">{s.sub}</div>
          {s.description && <div className="svc-desc" style={{ fontSize: 13, color: "#aaa", marginTop: 8, lineHeight: 1.5 }}>{s.description}</div>}
        </div>
        {!activeMedia && <div className="svc-icon" style={{background:s.iconBg,borderColor:s.numColor+"44"}}>{s.emoji}</div>}
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

      {/* Image / Video Gallery Thumbnails */}
      {s.media && s.media.length > 0 && (
        <div className="svc-media-row" style={{ padding: "10px 20px 6px" }}>
          {s.media.map((m, i) => (
            <div 
              key={i} 
              onClick={(e) => { e.stopPropagation(); setSelectedMediaIdx(i); }}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: selectedMediaIdx === i ? `2px solid ${s.numColor}` : "1px solid #333",
                opacity: selectedMediaIdx === i ? 1 : 0.6,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {m.type === "video" ? (
                <video src={m.url} className="media-t" muted style={{ width: 48, height: 48 }} />
              ) : (
                <img src={m.url} className="media-t" alt={m.name || ""} style={{ width: 48, height: 48 }} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="svc-footer">
        <span className="svc-tap">{s.tap}</span>
        <button className="svc-btn" style={{background:s.btnBg,color:s.btnColor}} onClick={e=>{e.stopPropagation();onBook();}}>{s.btnLabel}</button>
      </div>
    </div>
  );
}
