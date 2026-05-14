import Logo from "./Logo";

export default function AdminLogin({ onLogin, close }: { onLogin: () => void; close: () => void }) {
  return (
    <div className="admin-overlay">
      <div className="admin-login">
        <div style={{display:"flex",justifyContent:"center",marginBottom:18}}><Logo size={56}/></div>
        <h2>Admin Login</h2>
        <p>Kings Treat Tech — Site Management</p>
        <button className="admin-login-btn" onClick={onLogin}>🔐 Sign In with Google (Admin)</button>
        <button 
          onClick={close}
          style={{background:"none",border:"none",color:"#666",marginTop:15,fontSize:13,cursor:"pointer",textDecoration:"underline"}}
        >
          Cancel
        </button>
        <div className="admin-hint">Note: Real security is managed via Google Authentication.</div>
      </div>
    </div>
  );
}
