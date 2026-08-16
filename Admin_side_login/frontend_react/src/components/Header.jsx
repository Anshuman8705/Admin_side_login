import React from 'react';

export default function Header({ clients, activeClientId, onSelectClient, activeClientName, onSignOut, showClientBadge = true }) {
  return (
    <div className="topbar">
      <div className="wordmark">OneSmarter <span>/ MIR Relay Admin</span></div>
      <div className="spacer"></div>
      {showClientBadge && (
        <div className="active-client-badge" id="top-client-badge">
          Client: <b>{activeClientName || 'Northwood'}</b>
        </div>
      )}
      <div className="env env-ok" id="env">Live · Database Connected</div>
      <div className="me">
        <div className="av">VJ</div>
        <div>
          <div>Vikram J.</div>
          <div className="role">Platform Admin</div>
        </div>
      </div>
      <button className="signout" id="signout" onClick={onSignOut}>Sign Out</button>
    </div>
  );
}
