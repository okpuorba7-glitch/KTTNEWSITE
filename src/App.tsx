import { useState, useEffect } from "react";
import { dbService } from "./services/dbService";
import { Service, Plan, Settings, Booking } from "./types";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

// --- Components & Pages ---
import Logo from "./components/Logo";
import { InstagramIcon, TikTokIcon, FacebookIcon, TwitterIcon } from "./components/SocialIcons";
import AdminLogin from "./components/AdminLogin";
import AdminDash from "./components/AdminDash";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import BookingPage from "./pages/Booking";
import PlansPage from "./pages/Plans";
import Contact from "./pages/Contact";

const PAGES = ["home", "about", "services", "booking", "plans", "contact"];
const LABELS: Record<string, string> = { home: "Home", about: "About Us", services: "Services", booking: "Book Now", plans: "Plans", contact: "Contact" };

// Default data for seeding
const DEFAULT_SERVICES: Service[] = [
  { id:"food", cardClass:"food", label:"FOOD DELIVERY", emoji:"🍽️", number:"01",
    numColor:"#39FF14", stripe:"linear-gradient(90deg,#39FF14,#2BC710)",
    iconBg:"#0D1F0D", title:"Hot Meals at Your Door", sub:"Order from top restaurants near you",
    description:"Fast, hot gourmet meal delivery straight to your doorstep. We partner with top-rated local kitchens and chefs in Abuja.",
    tap:"Tap to order food instantly", btnLabel:"Order Food Now", btnBg:"#39FF14", btnColor:"#0A0A0A",
    featColor:"#39FF14", barColor:"#39FF14",
    basePrice:"3500", deliveryFee:"1000", minOrder:"2000",
    features:["Live order tracking","Same-day delivery","No hidden charges"],
    media:[
      { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop", type: "image", name: "Gourmet Meal" },
      { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop", type: "image", name: "Delicious Burger" },
      { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop", type: "image", name: "Fresh Pizza" },
      { url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop", type: "image", name: "Asian Noodle Bowl" }
    ] },
  { id:"laundry", cardClass:"laundry", label:"DRY CLEANING & LAUNDRY", emoji:"👔", number:"02",
    numColor:"#FF5E00", stripe:"linear-gradient(90deg,#FF5E00,#CC4C00)",
    iconBg:"#1F0D00", title:"Pickup, Clean & Return", sub:"Professional garment care at your pace",
    description:"Premium laundry, dry cleaning, pressing, and fabric stain care. Free doorstep pickup and delivery across Abuja.",
    tap:"Tap to book a pickup", btnLabel:"Book Pickup Now", btnBg:"#FF5E00", btnColor:"#FFFFFF",
    featColor:"#FF5E00", barColor:"#FF5E00",
    basePrice:"5000", deliveryFee:"1500", minOrder:"3000",
    features:["Free pickup & delivery","Dry clean & wash","48hr turnaround","Quality guarantee"],
    media:[
      { url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&auto=format&fit=crop", type: "image", name: "Folded Towels" },
      { url: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop", type: "image", name: "Suits Dry Cleaning" },
      { url: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop", type: "image", name: "Laundry Facility" },
      { url: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&auto=format&fit=crop", type: "image", name: "Steam Ironing" }
    ] },
  { id:"cleaning", cardClass:"cleaning", label:"HOME & OFFICE CLEANING", emoji:"🏠", number:"03",
    numColor:"#39FF14", stripe:"linear-gradient(90deg,#39FF14,#2BC710)",
    iconBg:"#0D1F0D", title:"Spotless Results, Every Time", sub:"Vetted professional cleaners",
    description:"Deep cleaning for apartments, private homes, and corporate offices. Includes sanitize, dusting, floor scrubbing, and glass polish.",
    tap:"Tap to book a cleaner", btnLabel:"Book Cleaning Now", btnBg:"#39FF14", btnColor:"#0A0A0A",
    featColor:"#39FF14", barColor:"#39FF14",
    basePrice:"15000", deliveryFee:"0", minOrder:"10000",
    features:["Background-checked staff","Home & office","Flexible scheduling","Quality products"],
    media:[
      { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop", type: "image", name: "Clean Interior" },
      { url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop", type: "image", name: "Surface Polishing" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop", type: "image", name: "Modern Living Room" },
      { url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&auto=format&fit=crop", type: "image", name: "Eco Cleaning Kit" }
    ] },
];

const DEFAULT_PLANS: Plan[] = [
  { id:"starter", name:"Starter", price:"15,000", period:"/ month", cta:"Get Started",
    ctaClass:"plan-outline", featured:false,
    features:["5 food deliveries/month","2 laundry pickups/month","1 home cleaning/month","Priority support"] },
  { id:"classic", name:"Classic", price:"28,500", period:"/ month", cta:"Choose Classic",
    ctaClass:"plan-filled", featured:true, badge:"MOST POPULAR",
    features:["12 food deliveries/month","6 laundry pickups/month","3 home cleanings/month","Free delivery fees","Dedicated agent"] },
  { id:"premium", name:"Premium", price:"49,000", period:"/ month", cta:"Go Premium",
    ctaClass:"plan-outline", featured:false,
    features:["Unlimited food deliveries","Unlimited laundry pickups","Weekly home cleaning","Same-day service","Personal concierge"] },
];

const DEFAULT_SETTINGS: Settings = {
  phone: "07066613373",
  managerPhone: "09047885282",
  email: "Ktt.inquiries@gmail.com",
  whatsapp: "2347066613373",
  address: "First gate Apo mechanic Estate, opposite Dubison oil, Abuja, Nigeria",
  monSat: "7am – 10pm",
  sunday: "9am – 6pm",
  holidays: "9am – 6pm",
  instagram: "https://www.instagram.com/kingstreatabuja?utm_source=qr&igsh=YzFwbXJha3E2ZmNo",
  facebook: "",
  twitter: "",
  tiktok: "https://www.tiktok.com/@kingtreatsabuja?_r=1&_t=ZS-98TD7eukyWK",
  banner: "",
  bannerLink: "",
};

export default function App() {
  const [page, setPage] = useState("home");
  const [menu, setMenu] = useState(false);
  const [pre, setPre] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<'superadmin' | 'subadmin' | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [svcs, plns, stgs] = await Promise.all([
          dbService.getServices(),
          dbService.getPlans(),
          dbService.getSettings()
        ]);

        const mergedServices = svcs.length > 0 ? svcs.map(s => {
          const defaultSvc = DEFAULT_SERVICES.find(d => d.id === s.id);
          const hasMedia = s.media && s.media.length > 0;
          return {
            ...defaultSvc,
            ...s,
            media: hasMedia ? s.media : (defaultSvc?.media || [])
          };
        }) : DEFAULT_SERVICES;

        setServices(mergedServices);
        setPlans(plns.length > 0 ? plns : DEFAULT_PLANS);
        if (stgs) setSettings({ ...DEFAULT_SETTINGS, ...stgs });

      } catch (error) {
        console.error("Error loading data from Firestore", error);
        setServices(DEFAULT_SERVICES);
        setPlans(DEFAULT_PLANS);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const emailLower = user.email.toLowerCase();
        setCurrentUserEmail(user.email);
        const isOwner = emailLower === "okpuorba7@gmail.com" || emailLower === "chatkttlimited@gmail.com";
        const isSub = settings.subAdmins?.some(s => s.email.toLowerCase() === emailLower);

        if (isOwner) {
          setIsAdmin(true);
          setAdminRole('superadmin');
        } else if (isSub) {
          setIsAdmin(true);
          setAdminRole('subadmin');
        } else {
          setIsAdmin(false);
          setAdminRole(null);
        }
      } else {
        setCurrentUserEmail(null);
        setIsAdmin(false);
        setAdminRole(null);
      }
    });

    return unsub;
  }, [settings]);

  const goTo = (p: string, svc?: string) => { 
    setPage(p); 
    if(svc) setPre(svc); 
    setMenu(false); 
    window.scrollTo({top:0,behavior:"smooth"}); 
  };

  const handleAdminLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const userEmail = res.user.email?.toLowerCase() || "";
      const isOwner = userEmail === "okpuorba7@gmail.com" || userEmail === "chatkttlimited@gmail.com";
      const isSub = settings.subAdmins?.some(s => s.email.toLowerCase() === userEmail);

      if (isOwner || isSub) {
        setShowLogin(false);
        setPage('admin');
      } else {
        alert(`Access Denied: The Google account (${res.user.email}) is not registered as an Admin or Sub-Admin. Please log in with the main owner account or request sub-admin access.`);
        await signOut(auth);
      }
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handlePasswordLogin = (enteredPass: string) => {
    const validPassword = settings.adminPassword || "admin123";
    if (enteredPass === validPassword) {
      setIsAdmin(true);
      setAdminRole('superadmin');
      setCurrentUserEmail('Chatkttlimited@gmail.com');
      setShowLogin(false);
      setPage('admin');
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setAdminRole(null);
    setCurrentUserEmail(null);
    goTo("home");
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white font-sans">Loading KTT...</div>;
  }

  if (isAdmin && (page === 'admin' || showLogin)) {
    return (
      <div className="admin-view">
        <nav className="nav" style={{top:settings.banner?"36px":0}}>
          <div className="nav-logo" onClick={()=>{goTo("home");}}>
            <Logo size={42}/>
            <div>
              <div className="logo-name">Kings Treat <span>Tech</span></div>
              <div className="logo-sub">Limited · KTT</div>
            </div>
          </div>
          <div className="nav-right">
            <span style={{background:"rgba(57,255,20,.1)",border:"1px solid rgba(57,255,20,.3)",color:"#39FF14",fontSize:11,fontWeight:700,padding:"4px 11px",borderRadius:20}}>
              {adminRole === 'superadmin' ? '👑 SUPER ADMIN' : '👔 SUB-ADMIN MODE'}
            </span>
            <button className="admin-logout" onClick={handleLogout}>⬅ Logout</button>
          </div>
        </nav>
        <AdminDash 
          svcs={services} 
          setSvcs={setServices} 
          plans={plans} 
          setPlans={setPlans} 
          onLogout={handleLogout} 
          settings={settings} 
          setSettings={setSettings}
          currentUserEmail={currentUserEmail}
          adminRole={adminRole}
        />
      </div>
    );
  }

  return (
    <>
      {showLogin && (
        <AdminLogin 
          onGoogleLogin={handleAdminLogin} 
          onPasswordLogin={handlePasswordLogin} 
          close={() => setShowLogin(false)} 
        />
      )}
      
      {settings.banner && (
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:"#FF5E00",color:"#fff",textAlign:"center",padding:"8px 5%",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <span>{settings.banner}</span>
          {settings.bannerLink && <a href={settings.bannerLink} style={{color:"#fff",textDecoration:"underline",fontSize:12}} target="_blank" rel="noreferrer">Learn more</a>}
        </div>
      )}

      <nav className="nav" style={{top:settings.banner?"36px":0}}>
        <div className="nav-logo" onClick={()=>goTo("home")}>
          <Logo size={42}/>
          <div>
            <div className="logo-name">Kings Treat <span>Tech</span></div>
            <div className="logo-sub">Limited · KTT</div>
          </div>
        </div>
        <div className="nav-links">
          {PAGES.filter(p=>p!=="booking").map(p=>(
            <button key={p} className={`nav-btn${page===p?" active":""}`} onClick={()=>goTo(p)}>{LABELS[p]}</button>
          ))}
        </div>
        <div className="nav-right">
          <button className="btn-admin" onClick={() => isAdmin ? setPage('admin') : setShowLogin(true)}>🛡️ Admin</button>
          <button className="btn-orange" onClick={()=>goTo("booking")}>Book a Service</button>
          <button className="hamburger" onClick={()=>setMenu(m=>!m)}><span/><span/><span/></button>
        </div>
      </nav>

      {menu && (
        <div style={{position:"fixed",top:66,left:0,right:0,background:"#111111",zIndex:998,borderBottom:"1px solid #2A2A2A"}}>
          {PAGES.map(p=>(
            <button key={p} style={{display:"block",width:"100%",textAlign:"left",padding:"13px 5%",background:"none",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",color:page===p?"#39FF14":"#ccc",fontFamily:"'DM Sans',sans-serif",borderBottom:"1px solid #2A2A2A"}} onClick={()=>goTo(p)}>{LABELS[p]}</button>
          ))}
          <button style={{display:"block",width:"100%",textAlign:"left",padding:"13px 5%",background:"none",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",color:"#FF5E00",fontFamily:"'DM Sans',sans-serif"}} onClick={() => isAdmin ? setPage('admin') : setShowLogin(true)}>🛡️ Admin Panel</button>
        </div>
      )}

      <main>
        {page==="home"     && <Home svcs={services} plans={plans} goTo={goTo} settings={settings}/>}
        {page==="about"    && <About/>}
        {page==="services" && <Services svcs={services} goTo={goTo}/>}
        {page==="booking"  && <BookingPage pre={pre} settings={settings}/>}
        {page==="plans"    && <PlansPage plans={plans} goTo={goTo}/>}
        {page==="contact"  && <Contact settings={settings}/>}
        {page==="admin"    && isAdmin && (
          <AdminDash 
            svcs={services} 
            setSvcs={setServices} 
            plans={plans} 
            setPlans={setPlans} 
            onLogout={handleLogout} 
            settings={settings} 
            setSettings={setSettings}
          />
        )}
      </main>

      <footer className="footer"><div className="footer-inner">
        <div className="footer-bar"/>
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{display:"flex",alignItems:"center",gap:11}}><Logo size={38}/><div><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Kings Treat Tech</div><div style={{fontSize:10,color:"#888"}}>Limited · KTT</div></div></div>
            <p>Everything Home, One Platform. Reliable food delivery, laundry care, and professional cleaning across Abuja.</p>
            <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#1A1A1A",border:"1px solid #2A2A2A",color:"#fff",padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.2s"}}>
                  <InstagramIcon size={18} /> Instagram
                </a>
              )}
              {settings.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#1A1A1A",border:"1px solid #2A2A2A",color:"#fff",padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.2s"}}>
                  <TikTokIcon size={18} /> TikTok
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#1A1A1A",border:"1px solid #2A2A2A",color:"#fff",padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.2s"}}>
                  <FacebookIcon size={18} /> Facebook
                </a>
              )}
              {settings.twitter && (
                <a href={settings.twitter} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#1A1A1A",border:"1px solid #2A2A2A",color:"#fff",padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.2s"}}>
                  <TwitterIcon size={18} /> Twitter / X
                </a>
              )}
            </div>
          </div>
          <div className="footer-col"><h4>Services</h4><ul>
            <li onClick={()=>goTo("booking")}>Food Delivery</li>
            <li onClick={()=>goTo("booking")}>Laundry &amp; Dry Cleaning</li>
            <li onClick={()=>goTo("booking")}>Home Cleaning</li>
            <li onClick={()=>goTo("booking")}>Office Cleaning</li>
          </ul></div>
          <div className="footer-col"><h4>Company</h4><ul>
            <li onClick={()=>goTo("about")}>About Us</li>
            <li onClick={()=>goTo("plans")}>Pricing Plans</li>
            <li onClick={()=>goTo("booking")}>Book a Service</li>
            <li onClick={()=>goTo("contact")}>Contact</li>
          </ul></div>
          <div className="footer-col"><h4>Contact</h4><ul>
            <li><strong>Hotline:</strong> {settings.phone}</li>
            {settings.managerPhone && <li><strong>Manager:</strong> {settings.managerPhone}</li>}
            <li style={{wordBreak:"break-all"}}>{settings.email}</li>
            <li>{settings.address}</li>
            <li style={{color:"#39FF14"}}>Mon–Sat: {settings.monSat}</li>
          </ul></div>
        </div>
        <hr className="footer-div"/>
        <div className="footer-btm">
          <p>© 2025 Kings Treat Tech Limited. All rights reserved.</p>
          <div className="footer-links"><span>Privacy Policy</span><span>Terms of Service</span></div>
        </div>
      </div></footer>

      <a href={`https://wa.me/${settings.whatsapp}`} className="wa-float" target="_blank" rel="noreferrer">💬</a>
    </>
  );
}
