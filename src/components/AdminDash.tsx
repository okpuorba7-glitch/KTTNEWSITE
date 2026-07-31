import { useState, useEffect } from "react";
import { dbService } from "../services/dbService";
import { Service, Plan, Settings, Booking, Media, SubAdmin } from "../types";

// Helper for media upload
function MediaUp({ media, onChange }: { media: Media[]; onChange: (fn: (p: Media[]) => Media[]) => void }) {
  const [urlInput, setUrlInput] = useState("");

  const handle = (files: FileList) => Array.from(files).forEach(f => {
    const r = new FileReader();
    r.onload = e => onChange(p => [...p, { url: e.target?.result as string, type: f.type.startsWith("video") ? "video" : "image", name: f.name }]);
    r.readAsDataURL(f);
  });

  const addUrlImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const isVideo = urlInput.endsWith(".mp4") || urlInput.endsWith(".mov") || urlInput.includes("video");
    onChange(p => [...p, { url: urlInput.trim(), type: isVideo ? "video" : "image", name: "Added Image" }]);
    setUrlInput("");
  };

  return (
    <div>
      <div className="media-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); if(e.dataTransfer.files) handle(e.dataTransfer.files);}}>
        <input type="file" accept="image/*,video/*" multiple onChange={e=>{if(e.target.files) handle(e.target.files)}}/>
        <div className="media-drop-ico">📁</div>
        <div style={{fontSize:13,fontWeight:600,color:"#ccc"}}>Drop images or videos here</div>
        <p>or click to browse · JPG, PNG, WEBP, MP4, MOV</p>
      </div>

      <form onSubmit={addUrlImage} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input 
          type="url" 
          placeholder="Or paste image URL (https://...)" 
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 6, color: "#fff", fontSize: 13 }}
        />
        <button 
          type="submit"
          style={{ background: "#FF5E00", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          + Add URL
        </button>
      </form>

      {media.length > 0 && (
        <div className="media-grid-a" style={{ marginTop: 16 }}>
          {media.map((m, i) => (
            <div key={i} className="media-item">
              {m.type === "video" ? <video src={m.url} muted style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <img src={m.url} alt={m.name || ""}/>}
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
  svcs, setSvcs, plans, setPlans, onLogout, settings, setSettings, currentUserEmail, adminRole 
}: { 
  svcs: Service[]; setSvcs: (s: Service[]) => void; 
  plans: Plan[]; setPlans: (p: Plan[]) => void; 
  onLogout: () => void; 
  settings: Settings; setSettings: (s: Settings) => void;
  currentUserEmail?: string | null;
  adminRole?: 'superadmin' | 'subadmin' | string | null;
}) {
  const isSuperAdmin = currentUserEmail?.toLowerCase() === "okpuorba7@gmail.com" || currentUserEmail?.toLowerCase() === "chatkttlimited@gmail.com" || adminRole === "superadmin";

  // Check subadmin permissions if not superadmin
  const currentSubAdmin = settings.subAdmins?.find(s => s.email.toLowerCase() === currentUserEmail?.toLowerCase());
  const allowedPermissions = isSuperAdmin 
    ? ['overview', 'bookings', 'subadmins', 'services', 'media', 'plans', 'settings']
    : ['overview', ...(currentSubAdmin?.permissions || ['bookings'])];

  const ALL_TABS = [
    { id: "overview", l: "📊 Overview" },
    { id: "bookings", l: "📋 Bookings & Orders" },
    { id: "subadmins", l: "👥 Sub-Admins / Staff", superOnly: true },
    { id: "services", l: "⚙️ Services & Pricing" },
    { id: "media", l: "🖼️ Media" },
    { id: "plans", l: "💳 Plans" },
    { id: "settings", l: "🔧 Site Settings" },
  ];

  const visibleTabs = ALL_TABS.filter(t => {
    if (t.superOnly && !isSuperAdmin) return false;
    return allowedPermissions.includes(t.id);
  });

  const [tab, setTab] = useState(visibleTabs[0]?.id || "overview");
  const [saved, setSaved] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Form state for adding sub-admin
  const [newSubEmail, setNewSubEmail] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubRole, setNewSubRole] = useState<'order_manager' | 'service_manager' | 'full_subadmin'>('order_manager');

  useEffect(() => {
    const unsub = dbService.subscribeToBookings(setBookings);
    return unsub;
  }, []);

  const save = async () => {
    setSaved(true);
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
    await Promise.all([
      ...svcs.map(s => dbService.updateService(s)),
      ...plans.map(p => dbService.updatePlan(p)),
      dbService.updateSettings(settings)
    ]);
    setTimeout(() => setSaved(false), 2500);
    alert("Database seeded successfully!");
  };

  const updSetting = (k: keyof Settings, v: any) => setSettings({ ...settings, [k]: v });
  
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

  // Sub-Admin Management
  const handleAddSubAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim() || !newSubEmail.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    let perms: Array<'bookings' | 'services' | 'media' | 'plans' | 'settings'> = ['bookings'];
    if (newSubRole === 'service_manager') {
      perms = ['bookings', 'services', 'media'];
    } else if (newSubRole === 'full_subadmin') {
      perms = ['bookings', 'services', 'media', 'plans', 'settings'];
    }

    const newSub: SubAdmin = {
      id: "sub_" + Date.now(),
      email: newSubEmail.trim().toLowerCase(),
      name: newSubName.trim() || "Staff Member",
      role: newSubRole,
      permissions: perms,
      addedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    const currentSubs = settings.subAdmins || [];
    if (currentSubs.some(s => s.email.toLowerCase() === newSub.email)) {
      alert("A sub-admin with this email already exists.");
      return;
    }

    const updatedSettings = {
      ...settings,
      subAdmins: [...currentSubs, newSub]
    };
    setSettings(updatedSettings);
    dbService.updateSettings(updatedSettings);

    setNewSubEmail("");
    setNewSubName("");
    alert(`Sub-admin ${newSub.email} added successfully! They can now log in with Google.`);
  };

  const handleRemoveSubAdmin = (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${email}?`)) return;
    const currentSubs = settings.subAdmins || [];
    const updatedSettings = {
      ...settings,
      subAdmins: currentSubs.filter(s => s.id !== id)
    };
    setSettings(updatedSettings);
    dbService.updateSettings(updatedSettings);
  };

  return (
    <div className="admin-wrap">
      {/* Role Banner Info */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "8px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#888" }}>
        <div>
          Logged in as: <strong style={{ color: "#fff" }}>{currentUserEmail || "Admin"}</strong> {isSuperAdmin ? <span style={{ color: "#39FF14", marginLeft: 6, fontWeight: 700 }}>(👑 Super Admin)</span> : <span style={{ color: "#FF5E00", marginLeft: 6, fontWeight: 700 }}>(👔 Sub-Admin)</span>}
        </div>
        {!isSuperAdmin && currentSubAdmin && (
          <div style={{ color: "#D4D4D8", fontSize: 11 }}>
            Permissions: <span style={{ color: "#39FF14", fontWeight: 600 }}>{currentSubAdmin.permissions.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="admin-tabs">
        {visibleTabs.map(t => (
          <button key={t.id} className={`admin-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="admin-body">

        {tab === "overview" && <>
          <div className="admin-sec-title">Dashboard Overview</div>
          <div className="admin-sec-sub">Welcome back! Quick summary of your KTT platform.</div>
          <div className="admin-stats-row">
            {[{ n: "2,500+", l: "Customers", c: "var(--neon-lime)", ch: "+12% this month" }, { n: bookings.length.toString(), l: "Bookings", c: "var(--bright-orange)", ch: "All time" }, { n: svcs.length.toString(), l: "Services", c: "var(--neon-lime)", ch: "Active" }, { n: "98%", l: "Satisfaction", c: "var(--bright-orange)", ch: "Based on reviews" }].map((s, i) => (
              <div key={i} className="admin-stat"><div className="admin-stat-n" style={{ color: s.c }}>{s.n}</div><div className="admin-stat-l">{s.l}</div><div className="admin-stat-c">{s.ch}</div></div>
            ))}
          </div>

          {isSuperAdmin && (
            <div style={{marginTop:40,padding:24,background:"#1A1A1A",borderRadius:16,border:"1px solid #2A2A2A",textAlign:"center"}}>
              <h4 style={{color:"#fff",marginBottom:12}}>Database Initialization</h4>
              <p style={{color:"#888",fontSize:13,marginBottom:20}}>If this is a new installation and your Firestore is empty, use this to populate it with default content.</p>
              <button className="btn-orange" style={{padding:"12px 32px"}} onClick={seedData}>🚀 Seed Initial Data</button>
            </div>
          )}
        </>}

        {tab === "subadmins" && isSuperAdmin && <>
          <div className="admin-sec-title">Sub-Admin & Staff Management</div>
          <div className="admin-sec-sub">Create and give limited or full access to team members to manage bookings or services when you are away.</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, marginBottom: 40 }}>
            {/* Add Sub-Admin Form */}
            <form onSubmit={handleAddSubAdmin} style={{ background: "#1A1A1A", borderRadius: 14, border: "1px solid #2A2A2A", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                ➕ Create Sub-Admin Access
              </h3>

              <div className="af">
                <label>Google Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. staff.ktt@gmail.com" 
                  value={newSubEmail}
                  onChange={e => setNewSubEmail(e.target.value)}
                  required
                />
                <span style={{ fontSize: 11, color: "#888", marginTop: 3, display: "block" }}>
                  Must be the exact Gmail address they use to sign in.
                </span>
              </div>

              <div className="af" style={{ marginTop: 14 }}>
                <label>Staff Name / Role Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. Blessing (Order Manager)" 
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                />
              </div>

              <div className="af" style={{ marginTop: 14 }}>
                <label>Access Level & Permissions</label>
                <select 
                  value={newSubRole} 
                  onChange={e => setNewSubRole(e.target.value as any)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#0A0A0A", color: "#fff", border: "1px solid #2A2A2A", fontSize: 13, fontWeight: 600 }}
                >
                  <option value="order_manager">📦 Order & Booking Manager (Bookings Only)</option>
                  <option value="service_manager">⚙️ Service & Booking Manager (Bookings + Services + Media)</option>
                  <option value="full_subadmin">🛡️ Full Access Sub-Admin (All tabs except adding Sub-Admins)</option>
                </select>
              </div>

              <button 
                type="submit" 
                style={{ width: "100%", marginTop: 18, background: "#FF5E00", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                ➕ Grant Access to Sub-Admin
              </button>
            </form>

            {/* List of active sub-admins */}
            <div style={{ background: "#1A1A1A", borderRadius: 14, border: "1px solid #2A2A2A", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
                Active Sub-Admins ({settings.subAdmins?.length || 0})
              </h3>

              {(!settings.subAdmins || settings.subAdmins.length === 0) ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#888", fontSize: 13 }}>
                  No sub-admins added yet. Add a staff email on the left to allow them to log in and help manage orders.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {settings.subAdmins.map(sub => (
                    <div key={sub.id} style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 10, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{sub.name}</div>
                        <div style={{ fontSize: 12, color: "#39FF14", marginTop: 2 }}>{sub.email}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          <span style={{ background: "rgba(255,94,0,0.15)", color: "#FF5E00", border: "1px solid rgba(255,94,0,0.3)", padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                            {sub.role.replace("_", " ")}
                          </span>
                          {sub.permissions.map(p => (
                            <span key={p} style={{ background: "#1A1A1A", color: "#AAA", border: "1px solid #333", padding: "2px 8px", borderRadius: 12, fontSize: 10 }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveSubAdmin(sub.id, sub.email)}
                        style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", color: "#FF4D4D", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >
                        Revoke Access
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>}

        {tab === "services" && allowedPermissions.includes("services") && <>
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
                  <div className="af"><label>Subtitle / Short Tagline</label><input value={s.sub} onChange={e => updSvc(s.id, "sub", e.target.value)} /></div>
                  <div className="af">
                    <label>Full Detailed Description</label>
                    <textarea 
                      rows={3} 
                      value={s.description || ""} 
                      placeholder="Write detailed information about this service..."
                      onChange={e => updSvc(s.id, "description", e.target.value)} 
                      style={{ width: "100%", padding: "10px 12px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, resize: "vertical" }}
                    />
                  </div>
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

        {tab === "media" && allowedPermissions.includes("media") && <>
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

        {tab === "plans" && allowedPermissions.includes("plans") && <>
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

        {tab === "bookings" && allowedPermissions.includes("bookings") && <>
          <div className="admin-sec-title">Booking Management</div>
          <div className="admin-sec-sub">All bookings submitted through the website. Status changes update live.</div>
          <div style={{ background: "#1A1A1A", borderRadius: 13, border: "1px solid #2A2A2A", overflow: "auto" }}>
            <table className="bk-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Phone</th>
                  <th>Service Requested</th>
                  <th>Date & Time</th>
                  <th>Address</th>
                  <th>Customer Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>{bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#888" }}>
                    No customer bookings found yet.
                  </td>
                </tr>
              ) : (
                bookings.map((b, i) => (
                  <tr key={b.id || i}>
                    <td style={{ fontWeight: 600, color: "#fff" }}>
                      <div>{b.name}</div>
                      <div style={{ fontSize: 11, color: "#888", fontWeight: 400 }}>{b.email}</div>
                    </td>
                    <td style={{ color: "#39FF14", fontWeight: 600 }}>{b.phone}</td>
                    <td style={{ color: "#FF5E00", fontWeight: 600 }}>{b.service}</td>
                    <td>
                      <div>{b.date}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{b.time}</div>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 160, wordBreak: "break-word" }}>{b.address || "—"}</td>
                    <td style={{ fontSize: 12, maxWidth: 200, wordBreak: "break-word" }}>
                      {b.notes ? (
                        <div style={{ color: "#FFC107", background: "rgba(255,193,7,0.1)", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,193,7,0.2)" }}>
                          💬 {b.notes}
                        </div>
                      ) : (
                        <span style={{ color: "#666" }}>None</span>
                      )}
                    </td>
                    <td>
                      <select value={b.status} onChange={e => b.id && updBookingStatus(b.id, e.target.value)}
                        style={{ background: "#0A0A0A", color: b.status === "done" ? "#39FF14" : b.status === "confirmed" ? "#00F2FE" : b.status === "cancelled" ? "#FF4D4D" : "#FF5E00", border: "1px solid #2A2A2A", borderRadius: 5, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        <option value="new">🆕 New</option>
                        <option value="confirmed">⏳ Confirmed</option>
                        <option value="done">✅ Done</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}</tbody>
            </table>
          </div>
        </>}

        {tab === "settings" && allowedPermissions.includes("settings") && <>
          <div className="admin-sec-title">Site Settings</div>
          <div className="admin-sec-sub">Update contact info and branding.</div>
          <div className="settings-grid">
            <div className="settings-card">
              <h3>📞 Contact Information</h3>
              {(["phone", "managerPhone", "email", "whatsapp", "address"] as const).map((k) => (
                <div key={k} className="af"><label>{k === "phone" ? "Front Desk Hotline" : k === "managerPhone" ? "Manager Hotline" : k}</label><input value={settings[k] || ""} onChange={e => updSetting(k, e.target.value)} /></div>
              ))}
            </div>
            <div className="settings-card">
              <h3>📱 Social Media Links</h3>
              {(["instagram", "tiktok", "facebook", "twitter"] as const).map((k) => (
                <div key={k} className="af"><label>{k}</label><input value={settings[k] || ""} onChange={e => updSetting(k, e.target.value)} placeholder={`https://${k}.com/...`} /></div>
              ))}
            </div>
            <div className="settings-card">
              <h3>📢 Announcement Banner</h3>
              {(["banner", "bannerLink"] as const).map((k) => (
                <div key={k} className="af"><label>{k}</label><input value={settings[k] || ""} onChange={e => updSetting(k, e.target.value)} /></div>
              ))}
            </div>
            <div className="settings-card">
              <h3>🔑 Admin Master Password</h3>
              <div className="af">
                <label>Admin Login Password / PIN</label>
                <input 
                  type="text" 
                  value={settings.adminPassword || "admin123"} 
                  onChange={e => updSetting("adminPassword", e.target.value)} 
                  placeholder="Set custom admin password..." 
                />
                <span style={{ fontSize: 11, color: "#888", marginTop: 4, display: "block" }}>
                  Used for direct password login without Google authentication. Default is <strong>admin123</strong>.
                </span>
              </div>
            </div>
          </div>
          <div className="save-bar">{saved ? <div className="saved-msg">✅ Settings saved & live!</div> : <p>Save to persist changes.</p>}<button className="save-btn" onClick={save}>💾 Save Settings</button></div>
        </>}

      </div>
    </div>
  );
}
