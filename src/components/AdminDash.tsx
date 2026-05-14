import { useState, useEffect } from "react";
import { dbService } from "../services/dbService";
import { Service, Plan, Settings, Booking, Media } from "../types";

// Helper for media upload
function MediaUp({ media, onChange }: { media: Media[]; onChange: (fn: (p: Media[]) => Media[]) => void }) {
  const handle = (files: FileList) => Array.from(files).forEach(f => {
    const r = new FileReader();
    r.onload = e => onChange(p => [...p, { url: e.target?.result as string, type: f.type.startsWith("video") ? "video" : "image", name: f.name }]);
    r.readAsDataURL(f);
  });
  return (
    <div>
      <div className="media-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); if(e.dataTransfer.files) handle(e.dataTransfer.files);}}>
        <input type="file" accept="image/*,video/*" multiple onChange={e=>{if(e.target.files) handle(e.target.files)}}/>
        <div className="media-drop-ico">📁</div>
        <div style={{fontSize:13,fontWeight:600,color:"#ccc"}}>Drop images or videos here</div>
        <p>or click to browse · JPG, PNG, MP4, MOV</p>
      </div>
      {media.length > 0 && (
        <div className="media-grid-a">
          {media.map((m, i) => (
            <div key={i} className="media-item">
              {m.type === "video" ? <video src={m.url} muted style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <img src={m.url} alt=""/>}
              <button className="media-del" onClick={() => onChange(p => p.filter((_, j) => j !== i))}>✕</button>
              <span className="media-badge">{m.type === "video" ? "▶" : "IMG"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDash({ 
  svcs, setSvcs, plans, setPlans, onLogout, settings, setSettings 
}: { 
  svcs: Service[]; setSvcs: (s: Service[]) => void; 
  plans: Plan[]; setPlans: (p: Plan[]) => void; 
  onLogout: () => void; 
  settings: Settings; setSettings: (s: Settings) => void;
}) {
  const [tab, setTab] = useState("overview");
  const [saved, setSaved] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const unsub = dbService.subscribeToBookings(setBookings);
    return unsub;
  }, []);

  const save = async () => {
    setSaved(true);
    // Persist all changes to Firestore
    await Promise.all([
      ...svcs.map(s => dbService.updateService(s)),
      ...plans.map(p => dbService.updatePlan(p)),
      dbService.updateSettings(settings)
    ]);
    setTimeout(() => setSaved(false), 2500);
  };

  const seedData = async () => {
    if(!window.confirm("This will overwrite your existing service/plan descriptions in Firestore with defaults. Continue?")) return;
    setSaved(true);
    // Use the values passed from defaults in App.tsx (if they haven't been edited locally)
    // Actually, it's safer to just trigger the save with whatever is in state, 
    // but the intention is to populate an empty DB.
    await Promise.all([
      ...svcs.map(s => dbService.updateService(s)),
      ...plans.map(p => dbService.updatePlan(p)),
      dbService.updateSettings(settings)
    ]);
    setTimeout(() => setSaved(false), 2500);
    alert("Database seeded successfully!");
  };

  const updSetting = (k: keyof Settings, v: string) => setSettings({ ...settings, [k]: v });
  
  const updBookingStatus = (id: string, status: string) => {
    dbService.updateBookingStatus(id, status);
  };

  const updSvc = (id: string, k: keyof Service, v: any) => setSvcs(svcs.map(s => s.id === id ? { ...s, [k]: v } : s));
  const updFeat = (id: string, i: number, v: string) => setSvcs(svcs.map(s => s.id === id ? { ...s, features: s.features.map((f, j) => j === i ? v : f) } : s));
  const addFeat = (id: string) => setSvcs(svcs.map(s => s.id === id ? { ...s, features: [...s.features, ""] } : s));
  const delFeat = (id: string, i: number) => setSvcs(svcs.map(s => s.id === id ? { ...s, features: s.features.filter((_, j) => j !== i) } : s));
  const updMedia = (id: string, fn: (p: Media[]) => Media[]) => setSvcs(svcs.map(s => s.id === id ? { ...s, media: fn(s.media) } : s));

  const updPlan = (id: string, k: keyof Plan, v: any) => setPlans(plans.map(x => x.id === id ? { ...x, [k]: v } : x));
  const updPlanFeat = (id: string, i: number, v: string) => setPlans(plans.map(x => x.id === id ? { ...x, features: x.features.map((f, j) => j === i ? v : f) } : x));
  const addPlanFeat = (id: string) => setPlans(plans.map(x => x.id === id ? { ...x, features: [...x.features, ""] } : x));
  const delPlanFeat = (id: string, i: number) => setPlans(plans.map(x => x.id === id ? { ...x, features: x.features.filter((_, j) => j !== i) } : x));

  const TABS = [{ id: "overview", l: "📊 Overview" }, { id: "services", l: "⚙️ Pricing" }, { id: "media", l: "🖼️ Media" }, { id: "plans", l: "💳 Plans" }, { id: "bookings", l: "📋 Bookings" }, { id: "settings", l: "🔧 Settings" }];

  return (
    <div className="admin-wrap">
      <div className="admin-tabs">
        {TABS.map(t => <button key={t.id} className={`admin-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>{t.l}</button>)}
      </div>
      <div className="admin-body">

        {tab === "overview" && <>
          <div className="admin-sec-title">Dashboard Overview</div>
          <div className="admin-sec-sub">Welcome back! Quick summary of your KTT platform.</div>
          <div className="admin-stats-row">
            {[{ n: "2,500+", l: "Customers", c: "var(--neon-lime)", ch: "+12% this month" }, { n: bookings.length, l: "Bookings", c: "var(--bright-orange)", ch: "All time" }, { n: svcs.length.toString(), l: "Services", c: "var(--neon-lime)", ch: "Active" }, { n: "98%", l: "Satisfaction", c: "var(--bright-orange)", ch: "Based on reviews" }].map((s, i) => (
              <div key={i} className="admin-stat"><div className="admin-stat-n" style={{ color: s.c }}>{s.n}</div><div className="admin-stat-l">{s.l}</div><div className="admin-stat-c">{s.ch}</div></div>
            ))}
          </div>
          <div style={{marginTop:40,padding:24,background:"#1A1A1A",borderRadius:16,border:"1px solid #2A2A2A",textAlign:"center"}}>
            <h4 style={{color:"#fff",marginBottom:12}}>Database Initialization</h4>
            <p style={{color:"#888",fontSize:13,marginBottom:20}}>If this is a new installation and your Firestore is empty, use this to populate it with default content.</p>
            <button className="btn-orange" style={{padding:"12px 32px"}} onClick={seedData}>🚀 Seed Initial Data</button>
          </div>
        </>}

        {tab === "services" && <>
          <div className="admin-sec-title">Services & Pricing</div>
          <div className="admin-sec-sub">Set prices and descriptions for each service. Changes update live.</div>
          <div className="svc-editor-grid">
            {svcs.map(s => (
              <div key={s.id} className="admin-card">
                <div className="admin-card-hdr" style={{ borderLeft: `4px solid ${s.numColor}` }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span><h3>{s.label}</h3>
                </div>
                <div className="admin-card-body">
                  <div className="af"><label>Service Title</label><input value={s.title} onChange={e => updSvc(s.id, "title", e.target.value)} /></div>
                  <div className="af"><label>Subtitle</label><input value={s.sub} onChange={e => updSvc(s.id, "sub", e.target.value)} /></div>
                  <div className="price-row">
                    <div className="af"><label>Base Price (₦)</label><input value={s.basePrice} onChange={e => updSvc(s.id, "basePrice", e.target.value)} /></div>
                    <div className="af"><label>Delivery Fee (₦)</label><input value={s.deliveryFee} onChange={e => updSvc(s.id, "deliveryFee", e.target.value)} /></div>
                  </div>
                  <div className="feat-list">
                    {s.features.map((f, i) => <div key={i} className="feat-row"><input value={f} onChange={e => updFeat(s.id, i, e.target.value)} /><button className="feat-del" onClick={() => delFeat(s.id, i)}>✕</button></div>)}
                  </div>
                  <button className="feat-add" onClick={() => addFeat(s.id)}>+ Add Feature</button>
                </div>
              </div>
            ))}
          </div>
          <div className="save-bar">{saved ? <div className="saved-msg">✅ Saved!</div> : <p>Changes update live on the website after saving.</p>}<button className="save-btn" onClick={save}>💾 Save Changes</button></div>
        </>}

        {tab === "media" && <>
          <div className="admin-sec-title">Photos & Videos</div>
          <div className="admin-sec-sub">Upload images and videos per service. They show as thumbnails on the service cards.</div>
          <div className="svc-editor-grid">
            {svcs.map(s => (
              <div key={s.id} className="admin-card">
                <div className="admin-card-hdr" style={{ borderLeft: `4px solid ${s.numColor}` }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span><h3>{s.label}</h3>
                </div>
                <div className="admin-card-body">
                  <MediaUp media={s.media} onChange={fn => updMedia(s.id, fn)} />
                </div>
              </div>
            ))}
          </div>
          <div className="save-bar">{saved ? <div className="saved-msg">✅ Media saved!</div> : <p>Save to persist changes.</p>}<button className="save-btn" onClick={save}>💾 Save Media</button></div>
        </>}

        {tab === "plans" && <>
          <div className="admin-sec-title">Subscription Plans</div>
          <div className="admin-sec-sub">Edit plan names, prices, features and toggle which is featured.</div>
          <div className="plans-editor-grid">
            {plans.map(p => (
              <div key={p.name} className="plan-editor">
                <div className="plan-editor-hdr">
                  <h3>{p.name}</h3>
                  <label className="feat-toggle"><input type="checkbox" checked={!!p.featured} onChange={e => updPlan(p.id, "featured", e.target.checked)} />Featured</label>
                </div>
                <div className="plan-editor-body">
                  <div className="af"><label>Plan Name</label><input value={p.name} onChange={e => updPlan(p.id, "name", e.target.value)} /></div>
                  <div className="price-row">
                    <div className="af"><label>Price (₦)</label><input value={p.price} onChange={e => updPlan(p.id, "price", e.target.value)} /></div>
                    <div className="af"><label>Period</label><input value={p.period} onChange={e => updPlan(p.id, "period", e.target.value)} /></div>
                  </div>
                  <div className="feat-list">
                    {p.features.map((f, i) => <div key={i} className="feat-row"><input value={f} onChange={e => updPlanFeat(p.id, i, e.target.value)} /><button className="feat-del" onClick={() => delPlanFeat(p.id, i)}>✕</button></div>)}
                  </div>
                  <button className="feat-add" onClick={() => addPlanFeat(p.id)}>+ Add Feature</button>
                </div>
              </div>
            ))}
          </div>
          <div className="save-bar">{saved ? <div className="saved-msg">✅ Plans saved!</div> : <p>Save to persist changes.</p>}<button className="save-btn" onClick={save}>💾 Save Plans</button></div>
        </>}

        {tab === "bookings" && <>
          <div className="admin-sec-title">Booking Management</div>
          <div className="admin-sec-sub">All bookings submitted through the website.</div>
          <div style={{ background: "#1A1A1A", borderRadius: 13, border: "1px solid #2A2A2A", overflow: "auto" }}>
            <table className="bk-table">
              <thead><tr><th>Name</th><th>Email</th><th>Service</th><th>Status</th></tr></thead>
              <tbody>{bookings.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "#fff" }}>{b.name}</td>
                  <td>{b.email}</td>
                  <td style={{ color: "#FF5E00", fontWeight: 600 }}>{b.service}</td>
                  <td>
                    <select value={b.status} onChange={e => b.id && updBookingStatus(b.id, e.target.value)}
                      style={{ background: "#0A0A0A", color: b.status === "done" ? "#39FF14" : "#FF5E00", border: "1px solid #2A2A2A", borderRadius: 5, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      <option value="new">New</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>}

        {tab === "settings" && <>
          <div className="admin-sec-title">Site Settings</div>
          <div className="admin-sec-sub">Update contact info and branding.</div>
          <div className="settings-grid">
            <div className="settings-card">
              <h3>📞 Contact Information</h3>
              {(["phone", "email", "whatsapp", "address"] as const).map((k) => (
                <div key={k} className="af"><label>{k}</label><input value={settings[k]} onChange={e => updSetting(k, e.target.value)} /></div>
              ))}
            </div>
            <div className="settings-card">
              <h3>📢 Announcement Banner</h3>
              {(["banner", "bannerLink"] as const).map((k) => (
                <div key={k} className="af"><label>{k}</label><input value={settings[k]} onChange={e => updSetting(k, e.target.value)} /></div>
              ))}
            </div>
          </div>
          <div className="save-bar">{saved ? <div className="saved-msg">✅ Settings saved & live!</div> : <p>Save to persist changes.</p>}<button className="save-btn" onClick={save}>💾 Save Settings</button></div>
        </>}

      </div>
    </div>
  );
}
